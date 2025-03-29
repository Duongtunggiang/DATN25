package com.api.API32025.controller;

import com.api.API32025.dto.LoginDTO;
import com.api.API32025.dto.RegisterDTO;
import com.api.API32025.service.AccountService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
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
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginDTO loginDTO, HttpSession session) {
        return ResponseEntity.ok(accountService.login(loginDTO, session));
    }



    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        accountService.logout(session);
        return ResponseEntity.ok("Đăng xuất thành công!");
    }
}

