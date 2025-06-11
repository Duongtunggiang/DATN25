package com.api.API32025.controller;

import com.api.API32025.service.OCRService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.api.API32025.entity.Account;
import com.api.API32025.entity.Profile;

import java.util.Map;

@RestController
@RequestMapping("/api/ocr")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class OCRController {

    @Autowired
    private OCRService ocrService;

    @PostMapping("/verify-cccd")
    public ResponseEntity<?> verifyCCCD(@RequestParam("file") MultipartFile file, Authentication authentication) {
        try {
            Account account = (Account) authentication.getPrincipal();
            Profile profile = account.getProfile();
            if (profile == null) {
                return ResponseEntity.badRequest().body("Người dùng chưa có profile");
            }
            Map<String, Object> result = ocrService.processCCCDImage(file, profile);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/verification-status")
    public ResponseEntity<?> getVerificationStatus(Authentication authentication) {
        Account account = (Account) authentication.getPrincipal();
        Profile profile = account.getProfile();
        if (profile == null) {
            return ResponseEntity.badRequest().body("Người dùng chưa có profile");
        }
        return ResponseEntity.ok(Map.of(
            "cccdVerified", profile.isCccdVerified(),
            "nationalId", profile.getNationalId()
        ));
    }
} 