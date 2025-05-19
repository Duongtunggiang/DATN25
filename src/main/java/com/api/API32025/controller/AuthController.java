package com.api.API32025.controller;

import com.api.API32025.dto.ChangePasswordDTO;
import com.api.API32025.dto.LoginDTO;
import com.api.API32025.dto.RegisterDTO;
import com.api.API32025.service.AccountService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AccountService accountService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterDTO registerDTO) {
        return ResponseEntity.ok(accountService.register(registerDTO));
    }

//    @PostMapping("/login")
//    public ResponseEntity<?> login(@Valid @RequestBody LoginDTO loginDTO, HttpSession session) {
//        return ResponseEntity.ok(accountService.login(loginDTO, session));
//    }
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginDTO loginDTO) {
        Map<String, Object> response = accountService.login(loginDTO); // ✅ trả về Map
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok("Đã đăng xuất thành công. Token đã được xóa.");
    }
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordDTO changePasswordDTO) {
        try {
            accountService.changePassword(changePasswordDTO);
            return ResponseEntity.ok("Mật khẩu đã được thay đổi thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}

