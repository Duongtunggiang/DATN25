package com.api.API32025.service;

import com.api.API32025.entity.Booking;
import com.api.API32025.entity.Car;
import com.api.API32025.respository.BookingRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FeedbackService {

    @Autowired
    private BookingRepository bookingRepository;

    @Data
    @AllArgsConstructor
    public static class FeedbackDTO {
        private Long bookingId;
        private Double rating;
        private String comment;
        private LocalDateTime bookingDate;
        private String customerName;
    }
//    public FeedbackDTO returnFeedback(Long carId){
//        List<Booking> bookings = bookingRepository.findByStatusAndCars_IdAndNumberFeedbackIsNotNull(
//                Car.CarStatus.RETURNED,
//                carId
//        );
//        return (FeedbackDTO) bookings.stream()
//                .map(booking -> new FeedbackDTO(
//                        booking.setStatus(dto.getStatus()),
//                        booking.setContentFeedback(dto.get),
//                        booking.getBookingDate(),
//                        String.format("%s %s",
//                                booking.getCustomer().getAccount().getProfile().getFirstName(),
//                                booking.getCustomer().getAccount().getProfile().getLastName())
//                ))
//                .collect(Collectors.toList());
//    }

    public List<FeedbackDTO> getFeedbacksByCar(Long carId) {
        List<Booking> bookings = bookingRepository.findByStatusAndCars_IdAndNumberFeedbackIsNotNull(
            Car.CarStatus.RETURNED,
            carId
        );

        return bookings.stream()
            .map(booking -> new FeedbackDTO(
                booking.getId(),
                booking.getNumberFeedback(),
                booking.getContentFeedback(),
                booking.getBookingDate(),
                String.format("%s %s", 
                    booking.getCustomer().getAccount().getProfile().getFirstName(),
                    booking.getCustomer().getAccount().getProfile().getLastName())
            ))
            .collect(Collectors.toList());
    }

    public Double getAverageRatingForCar(Long carId) {
        List<Booking> bookings = bookingRepository.findByStatusAndCars_IdAndNumberFeedbackIsNotNull(
            Car.CarStatus.RETURNED,
            carId
        );

        if (bookings.isEmpty()) {
            return 0.0;
        }

        return bookings.stream()
            .mapToDouble(Booking::getNumberFeedback)
            .average()
            .orElse(0.0);
    }
}
