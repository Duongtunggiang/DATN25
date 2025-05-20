package com.api.API32025.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "wallet")
public class Wallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int balance; // Số dư

    @Column(name = "currency")
    private String currency; // Loại tiền tệ (VD: VND, USD...)

    @Column(name = "status")
    private String status; // Trạng thái ví (ACTIVE, LOCKED, etc)

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToOne
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;
    @OneToMany(mappedBy = "wallet", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Transaction> transactions = new ArrayList<>();

    @OneToMany(mappedBy = "wallet", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VnPayTransaction> vnPayTransactions = new ArrayList<>();

    public void setId(Long id) {
        this.id = id;
    }

    public void setTransactions(List<Transaction> transactions) {
        this.transactions = transactions;
    }

    public List<VnPayTransaction> getVnPayTransactions() {
        return vnPayTransactions;
    }

    public void setVnPayTransactions(List<VnPayTransaction> vnPayTransactions) {
        this.vnPayTransactions = vnPayTransactions;
    }

    public List<Transaction> getTransactions() {
        return transactions;
    }

    public Wallet() {
    }

    public Wallet(Long id, int balance, String currency, String status, LocalDateTime createdAt, Account account, List<Transaction> transactions) {
        this.id = id;
        this.balance = balance;
        this.currency = currency;
        this.status = status;
        this.createdAt = createdAt;
        this.account = account;
        this.transactions = transactions;
    }

    // Getters/Setters
    public Long getId() { return id; }
    public int getBalance() { return balance; }
    public void setBalance(int balance) { this.balance = balance; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Account getAccount() { return account; }
    public void setAccount(Account account) { this.account = account; }
}

