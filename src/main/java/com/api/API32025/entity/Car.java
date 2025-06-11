package com.api.API32025.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "car")
public class Car {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "license_plate", nullable = false, unique = true)
    private String licensePlate;

    @Column(name = "car_name", nullable = false)
    private String carName;

    @Column(name = "model")
    private String model;

    @Column(name = "year")
    private int year;

    @Column(name = "color")
    private String color;

    @Column(name = "seats")
    private int seats;

    @Column(name = "price_per_day")
    private double pricePerDay;

    @Column(name = "status")
    private CarStatus status ;
    // 0- PENDING -- Xe mới tạo, chờ admin duyệt
    // 1- AVAILABLE -- Xe sẵn sàng cho thuê
    // 2- DEPOSIT -- Xe đã được cọc
    // 3- BOOKED -- Xe đã có người thuê
    // 4- DELIVERING -- Xe đang được giao
    // 5- RENTED -- Xe đang được thuê
    // 6- RETURNED -- Xe đã trả
    // 7- INACTIVE -- Xe bị ẩn tạm thời (do chủ xe hoặc hệ thống)
    // 8- DELETED -- Xe đã bị xóa mềm (vào thùng rác)
    // 9- REJECTED -- Admin từ chối duyệt xe
    // 10- CANCEL -- Đã hủy đơn - xe
    // 11- REFUND -- Đã hoàn tiền đơn hàng
    // 12- CANCELPENDING -- Hủy đơn hàng khi chờ thanh toán
    // 13- FEEDBACK -- Đã feed back

    public enum CarStatus{
        PENDING,AVAILABLE,DEPOSIT,BOOKED,DELIVERING,RENTED,RETURNED,INACTIVE,DELETED,REJECTED,CANCEL,REFUND,CANCELPENDING, FEEDBACK
    }

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name="fuel")
    private String fuel; // Nhien lieu

    @Column(name = "transmission")
    private Transmission transmission; //Hop so
    public enum Transmission{
        AUTOMATIC, MANUAL,CVT,DTC
    }

    @Column(name = "address")
    private String address;

    @ManyToOne
    @JoinColumn(name = "car_owner_id")
    @JsonBackReference
    private CarOwner carOwner;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "brand_id")
    private Brand brand;

    @JsonBackReference
    @JsonIgnore
    @ManyToMany(mappedBy = "cars")
    private List<Booking> bookings = new ArrayList<>();

    @OneToMany(mappedBy = "car", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Car_images> carImages = new ArrayList<>();

    @OneToOne(mappedBy = "car", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private CarDetail carDetail;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "segment_id")
    private Segment segment;

    @OneToMany(mappedBy = "car", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonBackReference
    private List<FavoriteCar> favoriteCars = new ArrayList<>();
}

