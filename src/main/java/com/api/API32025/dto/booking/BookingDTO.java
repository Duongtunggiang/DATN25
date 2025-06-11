package com.api.API32025.dto.booking;

import com.api.API32025.dto.car.CarDTO;
import com.api.API32025.dto.customer.CustomerDTO;
import com.api.API32025.entity.Car;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Setter
@Getter
@Data
@NoArgsConstructor
public class BookingDTO {
    private Long id;
    private Car.CarStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private double totalPrice;
    private CustomerDTO customer;
    private List<CarDTO> cars;

    private Double numberFeedback;
    private String contentFeedback;
}
