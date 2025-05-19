package com.api.API32025.dto;

import com.api.API32025.entity.Car;

public class CarAdminDTO {
    private Long id;
    private String carName;
    private String licensePlate;
    private double pricePerDay;
    private String email;
    private String username;

    public CarAdminDTO(Car car) {
        this.id = car.getId();
        this.carName = car.getCarName();
        this.licensePlate = car.getLicensePlate();
        this.pricePerDay = car.getPricePerDay();

        if (car.getBrand() != null && car.getBrand().getCarOwner() != null) {
            this.email = car.getBrand().getCarOwner().getAccount().getEmail();
            this.username = car.getBrand().getCarOwner().getAccount().getUsername();
        }
    }

    // Getters & Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCarName() {
        return carName;
    }

    public void setCarName(String carName) {
        this.carName = carName;
    }

    public String getLicensePlate() {
        return licensePlate;
    }

    public void setLicensePlate(String licensePlate) {
        this.licensePlate = licensePlate;
    }

    public double getPricePerDay() {
        return pricePerDay;
    }

    public void setPricePerDay(double pricePerDay) {
        this.pricePerDay = pricePerDay;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}

