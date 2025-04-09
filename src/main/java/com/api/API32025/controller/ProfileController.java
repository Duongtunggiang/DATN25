package com.api.API32025.controller;

import com.api.API32025.dto.ProfileDTO;
import com.api.API32025.service.ProfileService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(@RequestBody ProfileDTO profileDTO, HttpSession session) {
        Long accountId = (Long) session.getAttribute("userId");
        if (accountId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Chưa đăng nhập");
        }

        profileService.updateProfile(accountId, profileDTO);
        return ResponseEntity.ok("Cập nhật thông tin cá nhân thành công!");
    }

    @GetMapping
    public ResponseEntity<?> getProfile(HttpSession session) {
        Long accountId = (Long) session.getAttribute("userId");
        if (accountId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Chưa đăng nhập");
        }

        ProfileDTO profileDTO = profileService.getProfileByAccountId(accountId);
        return ResponseEntity.ok(profileDTO);
    }
}

