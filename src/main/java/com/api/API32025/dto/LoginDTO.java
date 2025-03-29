package com.api.API32025.dto;

import jakarta.validation.constraints.*;

public class LoginDTO {
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;

    public LoginDTO() {
    }

    public @NotBlank(message = "Email không được để trống") @Email(message = "Email không hợp lệ") String getEmail() {
        return email;
    }

    public void setEmail(@NotBlank(message = "Email không được để trống") @Email(message = "Email không hợp lệ") String email) {
        this.email = email;
    }

    public @NotBlank(message = "Mật khẩu không được để trống") String getPassword() {
        return password;
    }

    public void setPassword(@NotBlank(message = "Mật khẩu không được để trống") String password) {
        this.password = password;
    }

    public LoginDTO(String email, String password) {
        this.email = email;
        this.password = password;
    }
}
