package com.api.API32025.dto;

import jakarta.validation.constraints.*;

public class RegisterDTO {
    @NotBlank(message = "Username không được để trống")
    private String username;

    @Email(message = "Email không hợp lệ")
    @NotBlank(message = "Email không được để trống")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    private String password;

    @NotBlank(message = "Nhập lại mật khẩu không được để trống")
    private String confirmPassword;

    @NotBlank(message = "Vai trò không được để trống")
    private String roleName;

    public @NotBlank(message = "Username không được để trống") String getUsername() {
        return username;
    }

    public void setUsername(@NotBlank(message = "Username không được để trống") String username) {
        this.username = username;
    }

    public @Email(message = "Email không hợp lệ") @NotBlank(message = "Email không được để trống") String getEmail() {
        return email;
    }

    public void setEmail(@Email(message = "Email không hợp lệ") @NotBlank(message = "Email không được để trống") String email) {
        this.email = email;
    }

    public @NotBlank(message = "Mật khẩu không được để trống") @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự") String getPassword() {
        return password;
    }

    public void setPassword(@NotBlank(message = "Mật khẩu không được để trống") @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự") String password) {
        this.password = password;
    }

    public @NotBlank(message = "Nhập lại mật khẩu không được để trống") String getConfirmPassword() {
        return confirmPassword;
    }

    public void setConfirmPassword(@NotBlank(message = "Nhập lại mật khẩu không được để trống") String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }

    public @NotBlank(message = "Vai trò không được để trống") String getRoleName() {
        return roleName;
    }

    public void setRoleName(@NotBlank(message = "Vai trò không được để trống") String roleName) {
        this.roleName = roleName;
    }

    public RegisterDTO(String username, String email, String password, String confirmPassword, String roleName) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.confirmPassword = confirmPassword;
        this.roleName = roleName;
    }

    public RegisterDTO() {
    }
}
