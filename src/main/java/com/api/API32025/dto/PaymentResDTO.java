package com.api.API32025.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentResDTO {
    private String status;
    private  String message;
    private String URL;

    public PaymentResDTO() {
    }

    public PaymentResDTO(String status, String message, String URL) {
        this.status = status;
        this.message = message;
        this.URL = URL;
    }
}
