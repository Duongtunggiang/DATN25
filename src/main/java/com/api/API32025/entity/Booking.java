package com.api.API32025.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "booking")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @JsonManagedReference
    @JsonIgnore
    @ManyToMany
    @JoinTable(
            name = "booking_car",
            joinColumns = @JoinColumn(name = "booking_id"),
            inverseJoinColumns = @JoinColumn(name = "car_id")
    )
    private List<Car> cars = new ArrayList<>();

    @ManyToOne
    @JsonManagedReference
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "booking_date")
    private LocalDateTime bookingDate;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "total_price")
    private double totalPrice;

    @Column(name = "feedback_rating")
    private Double numberFeedback;

    @Column(name = "feedback_content")
    private String contentFeedback;

    @Column(name = "status")
    private Car.CarStatus status ;
    // PENDING: Đang chờ xử lý
    // DEPOSIT: Đã cọc
    // DELIVERING: Đang giao xe
    // RENTED: Đã nhận xe, đang thuê
    // RETURNED: Đã trả xe, có thể feedback
    // CANCELED: Đã huỷ

    @Column(name = "payment_method")
    private String paymentMethod; // "WALLET" hoặc "VNPAY"

    @ManyToOne
    @JoinColumn(name = "wallet_id")
    @JsonBackReference
    private Wallet wallet;

    @ManyToOne
    @JoinColumn(name = "vnPayTransaction_id")
    @JsonBackReference
    private VnPayTransaction vnPayTransaction;

    public VnPayTransaction getVnPayTransaction() {
        return vnPayTransaction;
    }

    public void setVnPayTransaction(VnPayTransaction vnPayTransaction) {
        this.vnPayTransaction = vnPayTransaction;
    }

    public Wallet getWallet() {
        return wallet;
    }

    public void setWallet(Wallet wallet) {
        this.wallet = wallet;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public Car.CarStatus getStatus() {
        return status;
    }

    public void setStatus(Car.CarStatus status) {
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public List<Car> getCars() {
        return cars;
    }

    public void setCars(List<Car> cars) {
        this.cars = cars;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public LocalDateTime getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(LocalDateTime bookingDate) {
        this.bookingDate = bookingDate;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public Double getNumberFeedback() {
        return numberFeedback;
    }

    public void setNumberFeedback(Double numberFeedback) {
        this.numberFeedback = numberFeedback;
    }

    public String getContentFeedback() {
        return contentFeedback;
    }

    public void setContentFeedback(String contentFeedback) {
        this.contentFeedback = contentFeedback;
    }
}


