package com.api.API32025.service;

import com.api.API32025.entity.Account;
import com.api.API32025.entity.Transaction;
import com.api.API32025.entity.Wallet;
import com.api.API32025.respository.AccountRepository;
import com.api.API32025.respository.TransactionRepository;
import com.api.API32025.respository.WalletRepository;
import org.springframework.beans.factory.annotation.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class WalletService {

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private AccountRepository accountRepository;

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
        transaction.setType("DEPOSIT");
        transaction.setTransactionTime(LocalDateTime.now());
        transaction.setDescription(description);

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
        transaction.setType("WITHDRAW");
        transaction.setTransactionTime(LocalDateTime.now());
        transaction.setDescription(description);

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
}

