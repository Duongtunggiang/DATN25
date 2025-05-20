package com.api.API32025.dto;

import com.api.API32025.entity.Account;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class WalletDTO {
    private Long id;
    private int balance;
    private String currency;
    private String status;
    private LocalDateTime createdAt;
    private AccountDTO account;
    private List<TransactionDTO> transactions;

    public WalletDTO() {
    }

    public WalletDTO(Long id, int balance, String currency, String status, LocalDateTime createdAt, AccountDTO account, List<TransactionDTO> transactions) {
        this.id = id;
        this.balance = balance;
        this.currency = currency;
        this.status = status;
        this.createdAt = createdAt;
        this.account = account;
        this.transactions = transactions;
    }

    // Getters và setters...

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getBalance() {
        return balance;
    }

    public void setBalance(int balance) {
        this.balance = balance;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public AccountDTO getAccount() {
        return account;
    }

    public void setAccount(AccountDTO account) {
        this.account = account;
    }

    public List<TransactionDTO> getTransactions() {
        return transactions;
    }

    public void setTransactions(List<TransactionDTO> transactions) {
        this.transactions = transactions;
    }
}

