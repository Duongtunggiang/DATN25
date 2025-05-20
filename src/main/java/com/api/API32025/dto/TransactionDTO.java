package com.api.API32025.dto;

import com.api.API32025.entity.Transaction;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TransactionDTO {
    private Long id;
    private int amount;
    private Transaction.TransactionType type;
    private String description;
    private LocalDateTime transactionTime;
    private int balanceAfter;

    public TransactionDTO() {
    }

    public TransactionDTO(Long id, int amount, Transaction.TransactionType type, String description, LocalDateTime transactionTime) {
        this.id = id;
        this.amount = amount;
        this.type = type;
        this.description = description;
        this.transactionTime = transactionTime;
    }

    public int getBalanceAfter() {
        return balanceAfter;
    }

    public void setBalanceAfter(int balanceAfter) {
        this.balanceAfter = balanceAfter;
    }
// Getters và setters...

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getAmount() {
        return amount;
    }

    public void setAmount(int amount) {
        this.amount = amount;
    }

    public Transaction.TransactionType getType() {
        return type;
    }

    public void setType(Transaction.TransactionType type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getTransactionTime() {
        return transactionTime;
    }

    public void setTransactionTime(LocalDateTime transactionTime) {
        this.transactionTime = transactionTime;
    }
}

