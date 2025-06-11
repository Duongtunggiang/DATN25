package com.api.API32025.dto.car;

import com.api.API32025.entity.Car;
import lombok.Getter;
import lombok.Setter;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CarDTO {
    private Long id;
    private String licensePlate;
    private String carName;
    private String model;
    private int year;
    private String color;
    private int seats;
    private double pricePerDay;
    private String imagePaths;
    private Car.CarStatus status;
    private String fuel;
    private Car.Transmission transmission;
    private String address;
    private Long currentBookingId;

    private Long brandId;
    private String brandName;
    private Long segmentId;
    private String segmentName;
    private Long categoryId;
    private String categoryName;

    private String provinceCode;
    private String provinceName;

    public String getProvinceCode() {
        return provinceCode;
    }

    public void setProvinceCode(String provinceCode) {
        this.provinceCode = provinceCode;
    }

    public String getProvinceName() {
        return provinceName;
    }

    public void setProvinceName(String provinceName) {
        this.provinceName = provinceName;
    }
}
