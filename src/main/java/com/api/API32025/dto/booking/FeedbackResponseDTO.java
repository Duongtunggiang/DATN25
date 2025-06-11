package com.api.API32025.dto.booking;

import com.api.API32025.entity.Booking;
import lombok.*;

@Getter
@Setter
public class FeedbackResponseDTO {
    private Double numberFeedback;
    private String contentFeedback;
    private Long bookingId;
    private String status;

    public FeedbackResponseDTO(Booking booking) {
        this.numberFeedback = booking.getNumberFeedback();
        this.contentFeedback = booking.getContentFeedback();
        this.bookingId = booking.getId();
        this.status = booking.getStatus().toString();
    }
}
