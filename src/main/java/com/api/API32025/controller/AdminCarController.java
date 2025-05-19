package com.api.API32025.controller;

import com.api.API32025.dto.CarAdminDTO;
import com.api.API32025.entity.Car;
import com.api.API32025.respository.CarRepository;
import com.api.API32025.service.AdminCarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminCarController {

    @Autowired
    private AdminCarService adminCarService;

    @Autowired
    private CarRepository carRepository;

    @GetMapping("/cars/pending")
    public ResponseEntity<List<CarAdminDTO>> getPendingCars() {
        List<Car> pendingCars = carRepository.findByStatus("PENDING");
        List<CarAdminDTO> dtoList = pendingCars.stream()
                .map(CarAdminDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }


    @PutMapping("/cars/approve/{carId}")
    public ResponseEntity<?> approveCar(@PathVariable Long carId) {
        Car approvedCar = adminCarService.approveCar(carId);
        return ResponseEntity.ok("Xe " + approvedCar.getCarName() + " đã được phê duyệt.");
    }
}

