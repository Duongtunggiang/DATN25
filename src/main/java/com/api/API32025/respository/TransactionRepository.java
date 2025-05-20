package com.api.API32025.respository;

import com.api.API32025.entity.Transaction;
import com.api.API32025.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByWalletOrderByTransactionTimeDesc(Wallet wallet);
    List<Transaction> findByWallet(Wallet wallet);
}

