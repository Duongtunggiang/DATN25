package com.api.API32025.controller;

import com.api.API32025.dto.ProfileDTO;
import com.api.API32025.service.ProfileService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
            @RequestParam("file") MultipartFile file,
            @RequestParam("firstName") String firstName,
            @RequestParam("lastName") String lastName,
            @RequestParam("dateOfBirth") String dateOfBirth,
            @RequestParam("nationalId") String nationalId,
            @RequestParam("drivingLicense") String drivingLicense,
            @RequestParam("phoneNumber") String phoneNumber,
            @RequestParam(value = "avatar", required = false) MultipartFile avatar,
            HttpSession session) {

        Long accountId = (Long) session.getAttribute("userId");
        if (accountId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Chưa đăng nhập");
        }

        ProfileDTO profileDTO = new ProfileDTO();
        profileDTO.setFirstName(firstName);
        profileDTO.setLastName(lastName);
        profileDTO.setDateOfBirth(dateOfBirth);
        profileDTO.setNationalId(nationalId);
        profileDTO.setDrivingLicense(drivingLicense);
        profileDTO.setPhoneNumber(phoneNumber);

        if (avatar != null && !avatar.isEmpty()) {
            // xử lý lưu file avatar vào server, giống uploadAvatar
            // ví dụ:
            String filename = UUID.randomUUID() + "_" + avatar.getOriginalFilename();
            Path filePath = Paths.get("Images/avatars", filename);
            try {
                Files.createDirectories(filePath.getParent());
                Files.write(filePath, avatar.getBytes());
                profileDTO.setAvatarPath("/uploads/avatars/" + filename);
            } catch (IOException e) {
                e.printStackTrace(); // log lỗi cụ thể
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi upload ảnh: " + e.getMessage());            }
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

