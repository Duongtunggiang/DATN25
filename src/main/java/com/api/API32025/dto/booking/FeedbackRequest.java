package com.api.API32025.dto.booking;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class FeedbackRequest {
    private Double numberFeedback;
    private String contentFeedback;

    public FeedbackRequest() {
    }

    public FeedbackRequest(Double numberFeedback, String contentFeedback) {
        this.numberFeedback = numberFeedback;
        this.contentFeedback = contentFeedback;
    }
}
