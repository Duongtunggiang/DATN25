package com.api.API32025.controller.auth;

import com.api.API32025.dto.auth.ProfileDTO;
import com.api.API32025.entity.Account;
import com.api.API32025.service.ProfileService;
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
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @GetMapping("/provinces")
    public ResponseEntity<?> getAllProvinces() {
        return ResponseEntity.ok(profileService.getAllProvinces());
    }

    @PutMapping("/update-info")
    public ResponseEntity<?> updateProfileInfo(
            @RequestParam("firstName") String firstName,
            @RequestParam("lastName") String lastName,
            @RequestParam("dateOfBirth") String dateOfBirth,
            @RequestParam("nationalId") String nationalId,
            @RequestParam("drivingLicense") String drivingLicense,
            @RequestParam("phoneNumber") String phoneNumber,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "provinceCode", required = false) String provinceCode,
            Authentication authentication
    ) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Account)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Không xác thực được người dùng.");
        }

        Account account = (Account) authentication.getPrincipal();
        Long accountId = account.getId();

        ProfileDTO profileDTO = new ProfileDTO();
        profileDTO.setFirstName(firstName);
        profileDTO.setLastName(lastName);
        profileDTO.setDateOfBirth(dateOfBirth);
        profileDTO.setNationalId(nationalId);
        profileDTO.setDrivingLicense(drivingLicense);
        profileDTO.setPhoneNumber(phoneNumber);
        profileDTO.setAddress(address);
        profileDTO.setProvinceCode(provinceCode);

        profileService.updateProfileInfo(accountId, profileDTO);
        return ResponseEntity.ok("Cập nhật thông tin cá nhân thành công!");
    }

    @PutMapping("/update-avatar")
    public ResponseEntity<?> updateAvatar(
            @RequestParam("avatar") MultipartFile avatar,
            Authentication authentication
    ) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Account)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Không xác thực được người dùng.");
        }

        Account account = (Account) authentication.getPrincipal();
        Long accountId = account.getId();

        try {
            String filename = UUID.randomUUID() + "_" + avatar.getOriginalFilename();
            Path filePath = Paths.get("Images/avatars", filename);
            Files.createDirectories(filePath.getParent());
            Files.write(filePath, avatar.getBytes());

            String avatarPath = "/Images/avatars/" + filename;
            profileService.updateAvatar(accountId, avatarPath);
            
            return ResponseEntity.ok("Cập nhật ảnh đại diện thành công!");
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi upload ảnh: " + e.getMessage());
        }
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

    @GetMapping("/chat/{accountId}")
    public ResponseEntity<?> getChatPartnerProfile(@PathVariable Long accountId) {
        ProfileDTO profileDTO = profileService.getProfileByAccountId(accountId);
        if (profileDTO == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(profileDTO);
    }

    @GetMapping("/account-status")
    public ResponseEntity<?> getAccountStatus(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Account)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Không xác thực được người dùng.");
        }

        Account account = (Account) authentication.getPrincipal();
        return ResponseEntity.ok(Map.of("status", account.getStatus().toString()));
    }

    @GetMapping("/province")
    public ResponseEntity<?> getUserProvince(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Account)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Không xác thực được người dùng.");
        }

        Account account = (Account) authentication.getPrincipal();
        ProfileDTO profileDTO = profileService.getProfileByAccountId(account.getId());
        
        if (profileDTO == null || profileDTO.getProvinceCode() == null) {
            return ResponseEntity.ok(Map.of(
                "hasProvince", false
            ));
        }

        return ResponseEntity.ok(Map.of(
            "hasProvince", true,
            "provinceCode", profileDTO.getProvinceCode(),
            "provinceName", profileDTO.getProvinceName()
        ));
    }

}

