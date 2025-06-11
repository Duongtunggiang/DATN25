package com.api.API32025.controller.admin;

import com.api.API32025.dto.auth.AccountDTO;
import com.api.API32025.dto.auth.CarAdminDTO;
import com.api.API32025.dto.auth.ProfileDTO;
import com.api.API32025.entity.Account;
import com.api.API32025.entity.Car;
import com.api.API32025.respository.CarRepository;
import com.api.API32025.service.AdminCarService;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminCarController {

    @Autowired
    private AdminCarService adminCarService;

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private ProfileService profileService;

    //Profile Admin
    @PutMapping("/update-profile")
    public ResponseEntity<?> updateProfileInfo(
            @RequestParam("firstName") String firstName,
            @RequestParam("lastName") String lastName,
            @RequestParam("dateOfBirth") String dateOfBirth,
            @RequestParam("nationalId") String nationalId,
            @RequestParam("drivingLicense") String drivingLicense,
            @RequestParam("phoneNumber") String phoneNumber,
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

        profileService.updateProfileInfo(accountId, profileDTO);
        return ResponseEntity.ok("Cập nhật thông tin cá nhân thành công!");
    }
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        Account account = (Account) authentication.getPrincipal(); // Lấy từ JWT
        ProfileDTO profileDTO = profileService.getProfileByAccountId(account.getId());

        return ResponseEntity.ok(profileDTO);
    }

    @GetMapping("/cars/pending")
    public ResponseEntity<List<CarAdminDTO>> getPendingCars() {
        List<Car> pendingCars = carRepository.findByStatus(Car.CarStatus.PENDING);
        List<CarAdminDTO> dtoList = pendingCars.stream()
                .map(CarAdminDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }

    @GetMapping("/all-cars")
    public ResponseEntity<List<CarAdminDTO>> getAllCars() {
        List<Car> cars = carRepository.findAll();
        List<CarAdminDTO> dtoList = cars.stream()
                .map(CarAdminDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }
    @GetMapping("/cars/stats")
    public ResponseEntity<Map<String, Long>> getCarStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", carRepository.count());
        stats.put("active", carRepository.countByStatus(Car.CarStatus.INACTIVE));
        stats.put("pending", carRepository.countByStatus(Car.CarStatus.PENDING));
//        stats.put("maintenance", carRepository.countByStatus(Car.CarStatus.MAINTENANCE));
        return ResponseEntity.ok(stats);
    }

    @PutMapping("/cars/approve/{carId}")
    public ResponseEntity<?> approveCar(@PathVariable Long carId) {
        Car approvedCar = adminCarService.approveCar(carId);
        return ResponseEntity.ok("Xe " + approvedCar.getCarName() + " đã được phê duyệt.");
    }


    @GetMapping("/accounts")
    public ResponseEntity<List<AccountDTO>> getAllAccounts() {
        return ResponseEntity.ok(adminCarService.getAllAccounts());
    }

    @PutMapping("/accounts/block/{accountId}")
    public ResponseEntity<?> blockAccount(@PathVariable Long accountId) {
        AccountDTO blocked = adminCarService.blockAccount(accountId);
        return ResponseEntity.ok("Tài khoản " + blocked.getEmail() + " đã bị khóa.");
    }



}

