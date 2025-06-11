package com.api.API32025.controller.wallet;

import com.api.API32025.dto.auth.AccountDTO;
import com.api.API32025.dto.wallet.TransactionDTO;
import com.api.API32025.dto.wallet.WalletDTO;
import com.api.API32025.entity.Account;
import com.api.API32025.entity.Transaction;
import com.api.API32025.entity.Wallet;
import com.api.API32025.respository.AccountRepository;
import com.api.API32025.respository.TransactionRepository;
import com.api.API32025.respository.WalletRepository;
import com.api.API32025.service.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/wallet")
public class WalletController {

    @Autowired
    private WalletService walletService;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private WalletRepository walletRepository;

    @GetMapping("/balance")
    public ResponseEntity<WalletDTO> getBalance(Authentication authentication) {
        String username = authentication.getName();
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng"));

        Wallet wallet = walletRepository.findByAccount(account)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví"));

        List<Transaction> transactions = transactionRepository.findByWallet(wallet);

        List<TransactionDTO> transactionDTOs = transactions.stream()
                .map(tx -> {
                    TransactionDTO dto = new TransactionDTO(
                            tx.getId(),
                            tx.getAmount(),
                            tx.getType(),
                            tx.getDescription(),
                            tx.getTransactionTime()
                    );
                    dto.setBalanceAfter(tx.getBalanceAfter() != null ? tx.getBalanceAfter() : 0);
                    return dto;
                }).collect(Collectors.toList());


        AccountDTO accountDTO = new AccountDTO(account.getId(), account.getUsername(), account.getEmail());

        WalletDTO walletDTO = new WalletDTO(
                wallet.getId(),
                wallet.getBalance(),
                wallet.getCurrency(),
                wallet.getStatus(),
                wallet.getCreatedAt(),
                accountDTO,
                transactionDTOs
        );

        return ResponseEntity.ok(walletDTO);
    }

    @PostMapping("/deposit")
    public ResponseEntity<?> deposit(@RequestBody Map<String, Integer> payload, Authentication authentication) {
        int amount = payload.get("amount");
        String username = authentication.getName();
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng"));

        Wallet wallet = walletRepository.findByAccount(account)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví"));

        walletService.deposit(account.getId(), amount, "Nạp tiền vào ví");
        return ResponseEntity.ok("Nạp tiền thành công!");
    }


    @PostMapping("/withdraw")
    public ResponseEntity<?> withdraw(@RequestBody Map<String, Integer> payload,  Authentication auth) {
        int amount = payload.get("amount");
        String username = auth.getName();
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng"));

        Wallet wallet = walletRepository.findByAccount(account)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví"));
        walletService.withdraw(account.getId(), amount, "Rút tiền từ ví");
        return ResponseEntity.ok("Rút tiền thành công!");
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<Transaction>> history(Authentication auth) {
        String username = auth.getName();
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng"));

        Long accountId = account.getId();
        return ResponseEntity.ok(walletService.getTransactionHistory(accountId));
    }

    @GetMapping("/admin/{accountId}/balance")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Integer> getBalanceByAdmin(@PathVariable Long accountId) {
        return ResponseEntity.ok(walletService.getBalanceByAccountId(accountId));
    }

}

