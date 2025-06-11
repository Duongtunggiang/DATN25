package com.api.API32025.dto.wallet;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class PaymentRequest {
    @NotNull
    private int amount;

    @NotBlank
    private String bankCode;

    @NotBlank
    private String locale;

    // getters/setters

    public @NotNull int getAmount() {
        return amount;
    }

    public void setAmount(@NotNull int amount) {
        this.amount = amount;
    }

    public @NotBlank String getBankCode() {
        return bankCode;
    }

    public void setBankCode(@NotBlank String bankCode) {
        this.bankCode = bankCode;
    }

    public @NotBlank String getLocale() {
        return locale;
    }

    public void setLocale(@NotBlank String locale) {
        this.locale = locale;
    }
}

