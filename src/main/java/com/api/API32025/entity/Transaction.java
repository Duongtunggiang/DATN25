package com.api.API32025.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "transaction_history")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int amount; // Số tiền giao dịch

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private TransactionType type;

    @Column(name = "transaction_time")
    private LocalDateTime transactionTime;

    private String description;

    @ManyToOne
    @JoinColumn(name = "wallet_id", nullable = false)
    @JsonBackReference
    private Wallet wallet;
    public enum TransactionType {
        DEPOSIT, WITHDRAW, DEPOSIT_HOLD, PAYMENT, PAY_DISCOUNT, PAY_WITHDRAW
    }
    //      case "DEPOSIT": return "Nạp tiền";
    //      case "WITHDRAW": return "Rút tiền";
    //      case "DEPOSIT_HOLD": return "Đặt cọc xe";
    //      case "PAYMENT": return "Thanh toán xe";
    //      PAY_DISCOUNT : Nạp vào ví bằng VN Pay
    //      PAY_WITHDRAW : Rút tiền ra qua VN Pay
    @Column(name = "balance_after")
    private Integer balanceAfter;

    public Integer getBalanceAfter() {
        return balanceAfter;
    }

    public void setBalanceAfter(Integer balanceAfter) {
        this.balanceAfter = balanceAfter;
    }


    public Transaction() {
    }

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

    public TransactionType getType() {
        return type;
    }

    public void setType(TransactionType type) {
        this.type = type;
    }

    public LocalDateTime getTransactionTime() {
        return transactionTime;
    }

    public void setTransactionTime(LocalDateTime transactionTime) {
        this.transactionTime = transactionTime;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Wallet getWallet() {
        return wallet;
    }

    public void setWallet(Wallet wallet) {
        this.wallet = wallet;
    }

    public Transaction(Long id, int amount, TransactionType type, LocalDateTime transactionTime, String description, Wallet wallet) {
        this.id = id;
        this.amount = amount;
        this.type = type;
        this.transactionTime = transactionTime;
        this.description = description;
        this.wallet = wallet;
    }
}

