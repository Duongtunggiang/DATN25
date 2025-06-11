package com.api.API32025.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.security.Principal;

@Entity
@Setter
@Getter
@Table(name = "car_detail")
public class CarDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "description")
    private  String description;

    @Column(name = "mileage")
    private Long mileage;

    @Column(name = "fuel_commission")
    private int fuelCommission;

    @Column(name = "bluetooth")
    private boolean bluetooth;

    @Column(name = "gps")
    private  boolean gps;

    @Column(name = "sun_roof")
    private boolean sunRoof;

    @Column(name = "child_lock")
    private boolean childLock;

    @Column(name = "child_seat")
    private boolean childSeat;

    @Column(name = "dvd")
    private boolean dvd;

    @Column(name = "usb")
    private boolean usb;

    @Column(name = "camera")
    private boolean camera;

    @Column(name = "no_smoking")
    private boolean noSmoking;

    @Column(name = "no_pets")
    private boolean noPets;

    @Column(name = "no_eating")
    private boolean noEating;

    @Column(name = "return_full_tank")
    private boolean returnFullTank;

    @Column(name = "no_offroad")
    private boolean noOffroad;

    @Column(name = "clean_car")
    private boolean cleanCar;

    @Column(name = "no_delivery_service")
    private boolean noDeliveryService;

    @OneToOne
    @JoinColumn(name = "car_id", nullable = false)
    @JsonBackReference
    private Car car;
}
