package com.api.API32025.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Data
@Setter
@Getter
public class CancellationReason {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "car_id")
    private Car car;

    @ManyToOne
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @Column(columnDefinition = "TEXT")
    private String reason;

    private LocalDateTime cancellationTime;

    @Column(name = "refund_amount")
    private Double refundAmount;

    @Column(name = "is_processed")
    private boolean isProcessed;
} 