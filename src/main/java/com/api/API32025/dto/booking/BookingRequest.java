package com.api.API32025.dto.booking;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Setter
@Getter
public class BookingRequest {
    private List<Long> carIds;
    private LocalDate startDate;
    private LocalDate endDate;
    private String paymentMethod;
    public BookingRequest(List<Long> carIds, LocalDate startDate, LocalDate endDate) {
        this.carIds = carIds;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public BookingRequest() {
    }
}
