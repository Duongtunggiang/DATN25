package com.api.API32025.dto.car;

import com.api.API32025.entity.Car;
import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class CarDetailDTO {
    private  String description;
    private Long mileage;
    private int fuelCommission;
    private boolean bluetooth;
    private  boolean gps;
    private boolean sunRoof;
    private boolean childLock;
    private boolean childSeat;
    private boolean dvd;
    private boolean usb;
    private boolean camera;
    private Long carId;

    // Car Usage Terms
    private boolean noSmoking;
    private boolean noPets;
    private boolean noEating;
    private boolean returnFullTank;
    private boolean noOffroad;
    private boolean cleanCar;
    private boolean noDeliveryService;

    // Segment and Category information
    private Long segmentId;
    private String segmentName;
    private Long categoryId;
    private String categoryName;
}
