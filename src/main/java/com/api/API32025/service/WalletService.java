package com.api.API32025.service;

import com.api.API32025.entity.Account;
import com.api.API32025.entity.Transaction;
import com.api.API32025.entity.VnPayTransaction;
import com.api.API32025.entity.Wallet;
import com.api.API32025.respository.AccountRepository;
import com.api.API32025.respository.TransactionRepository;
import com.api.API32025.respository.VnPayTransactionRepository;
import com.api.API32025.respository.WalletRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static com.api.API32025.entity.Transaction.TransactionType.DEPOSIT;
import static com.api.API32025.entity.Transaction.TransactionType.WITHDRAW;

@Service
public class WalletService {

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private VnPayTransactionRepository vnPayTransactionRepository;

    public int getBalanceByAccountId(Long accountId) {
        Wallet wallet = walletRepository.findByAccount(accountRepository.findById(accountId)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản")))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví"));

        return wallet.getBalance();
    }

    public void deposit(Long accountId, int amount, String description) {
        Wallet wallet = getWalletByAccountId(accountId);

        wallet.setBalance(wallet.getBalance() + amount);

        Transaction transaction = new Transaction();
        transaction.setWallet(wallet);
        transaction.setAmount(amount);
        transaction.setType(DEPOSIT);
        transaction.setTransactionTime(LocalDateTime.now());
        transaction.setDescription(description);
        transaction.setBalanceAfter(wallet.getBalance());

        transactionRepository.save(transaction);
        walletRepository.save(wallet);
    }

    public void withdraw(Long accountId, int amount, String description) {
        Wallet wallet = getWalletByAccountId(accountId);

        if (wallet.getBalance() < amount) {
            throw new RuntimeException("Số dư không đủ để rút tiền!");
        }

        wallet.setBalance(wallet.getBalance() - amount);

        Transaction transaction = new Transaction();
        transaction.setWallet(wallet);
        transaction.setAmount(amount);
        transaction.setType(WITHDRAW);
        transaction.setTransactionTime(LocalDateTime.now());
        transaction.setDescription(description);
        transaction.setBalanceAfter(wallet.getBalance());

        transactionRepository.save(transaction);
        walletRepository.save(wallet);
    }

    public List<Transaction> getTransactionHistory(Long accountId) {
        Wallet wallet = getWalletByAccountId(accountId);
        return transactionRepository.findByWalletOrderByTransactionTimeDesc(wallet);
    }

    private Wallet getWalletByAccountId(Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

        return walletRepository.findByAccount(account)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví"));
    }

    // callback vnpay
    @Transactional
    public void processVnPayCallback(Map<String, String> params) {
        String vnpTxnRef = params.get("vnp_TxnRef");
        String vnpResponseCode = params.get("vnp_ResponseCode");
        int amount = Integer.parseInt(params.get("vnp_Amount")) / 100; // vì *100 khi gửi đi
        String orderInfo = params.get("vnp_OrderInfo");

        // Tránh xử lý lại giao dịch đã tồn tại
        if (vnPayTransactionRepository.findByVnpTxnRef(vnpTxnRef).isPresent()) return;

        // Lấy walletId từ orderInfo
        Long walletId = extractWalletId(orderInfo);
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví"));

        // Ghi log giao dịch
        VnPayTransaction transaction = new VnPayTransaction();
        transaction.setVnpTxnRef(vnpTxnRef);
        transaction.setVnpResponseCode(vnpResponseCode);
        transaction.setAmount(amount);
        transaction.setOrderInfo(orderInfo);
        transaction.setTransactionTime(LocalDateTime.now());
        transaction.setWallet(wallet);
        transaction.setStatus("00".equals(vnpResponseCode) ? "SUCCESS" : "FAILED");

        vnPayTransactionRepository.save(transaction);

        // Nếu thành công, cộng tiền vào ví
        if ("00".equals(vnpResponseCode)) {
            wallet.setBalance(wallet.getBalance() + amount);
            walletRepository.save(wallet);
        }
    }

    private Long extractWalletId(String orderInfo) {
        String[] parts = orderInfo.split(" ");
        return Long.parseLong(parts[parts.length - 1]);
    }
}

