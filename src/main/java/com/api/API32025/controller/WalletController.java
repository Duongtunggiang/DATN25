package com.api.API32025.controller;

import com.api.API32025.entity.Transaction;
import com.api.API32025.entity.UserDetailsImpl;
import com.api.API32025.service.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wallet")
public class WalletController {

    @Autowired
    private WalletService walletService;

    @GetMapping("/balance")
    public ResponseEntity<Integer> getBalance(Authentication auth) {
        Long accountId = ((UserDetailsImpl) auth.getPrincipal()).getAccount().getId();
        return ResponseEntity.ok(walletService.getBalanceByAccountId(accountId));
    }

    @PostMapping("/deposit")
    public ResponseEntity<?> deposit(@RequestParam int amount, Authentication auth) {
        Long accountId = ((UserDetailsImpl) auth.getPrincipal()).getAccount().getId();
        walletService.deposit(accountId, amount, "Nạp tiền vào ví");
        return ResponseEntity.ok("Nạp tiền thành công!");
    }

    @PostMapping("/withdraw")
    public ResponseEntity<?> withdraw(@RequestParam int amount, Authentication auth) {
        Long accountId = ((UserDetailsImpl) auth.getPrincipal()).getAccount().getId();
        walletService.withdraw(accountId, amount, "Rút tiền từ ví");
        return ResponseEntity.ok("Rút tiền thành công!");
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<Transaction>> history(Authentication auth) {
        Long accountId = ((UserDetailsImpl) auth.getPrincipal()).getAccount().getId();
        return ResponseEntity.ok(walletService.getTransactionHistory(accountId));
    }
}

