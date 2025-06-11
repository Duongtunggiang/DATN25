package com.api.API32025.dto.auth;

import com.api.API32025.entity.Car;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
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

        if (car.getBrand() != null && car.getBrand() != null) {
            this.email = car.getCarOwner().getAccount().getEmail();
            this.username = car.getCarOwner().getAccount().getUsername();
        }
    }

}

