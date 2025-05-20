package com.api.API32025.controller;

import com.api.API32025.dto.ProfileDTO;
import com.api.API32025.entity.Account;
import com.api.API32025.service.ProfileService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(
            @RequestParam("firstName") String firstName,
            @RequestParam("lastName") String lastName,
            @RequestParam("dateOfBirth") String dateOfBirth,
            @RequestParam("nationalId") String nationalId,
            @RequestParam("drivingLicense") String drivingLicense,
            @RequestParam("phoneNumber") String phoneNumber,
            @RequestParam(value = "avatar", required = false) MultipartFile avatar,
            Authentication authentication
    ) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Account)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Không xác thực được người dùng.");
        }

        Account account = (Account) authentication.getPrincipal();
        Long accountId = account.getId(); // Lấy từ JWT

        ProfileDTO profileDTO = new ProfileDTO();
        profileDTO.setFirstName(firstName);
        profileDTO.setLastName(lastName);
        profileDTO.setDateOfBirth(dateOfBirth);
        profileDTO.setNationalId(nationalId);
        profileDTO.setDrivingLicense(drivingLicense);
        profileDTO.setPhoneNumber(phoneNumber);

        if (avatar != null && !avatar.isEmpty()) {
            String filename = UUID.randomUUID() + "_" + avatar.getOriginalFilename();
            Path filePath = Paths.get("Images/avatars", filename);
            try {
                Files.createDirectories(filePath.getParent());
                Files.write(filePath, avatar.getBytes());
                profileDTO.setAvatarPath("/Images/avatars/" + filename);
            } catch (IOException e) {
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi upload ảnh: " + e.getMessage());
            }
        }

        profileService.updateProfile(accountId, profileDTO);
        return ResponseEntity.ok("Cập nhật thông tin cá nhân thành công!");
    }
    @GetMapping("/check-nationalId")
    public ResponseEntity<?> checkNationalIdExists(@RequestParam String nationalId, Authentication auth) {
        Long accountId = ((Account) auth.getPrincipal()).getId();

        boolean exists = profileService.isNationalIdExistForOtherAccount(nationalId, accountId);
        return ResponseEntity.ok(exists);
    }



    @GetMapping
    public ResponseEntity<?> getProfile(Authentication authentication) {
        Account account = (Account) authentication.getPrincipal(); // Lấy từ JWT
        ProfileDTO profileDTO = profileService.getProfileByAccountId(account.getId());

        return ResponseEntity.ok(profileDTO);
    }

}

