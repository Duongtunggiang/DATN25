package com.api.API32025.controller;

import com.api.API32025.dto.CarDTO;
import com.api.API32025.entity.Car;
import com.api.API32025.jwt.JwtUtil;
import com.api.API32025.service.CarService;
import org.springframework.beans.factory.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cars")
public class CarController {

    @Autowired
    private CarService carService;

    @Autowired
    private JwtUtil jwtUtil;

    // Thêm xe cho chủ xe
    @PostMapping("/add")
    public ResponseEntity<String> addCar(@RequestHeader("Authorization") String token,
                                         @RequestBody CarDTO carDTO) {
        try {
            // Lấy userId từ token JWT
            Long accountId = jwtUtil.extractUserId(token.substring(7)); // Loại bỏ 'Bearer ' khỏi token
            carService.addCarForOwner(accountId, carDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body("Thêm xe thành công.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Lỗi: " + e.getMessage());
        }
    }

    // Lấy danh sách xe của chủ xe
    @GetMapping("/owner/{accountId}")
    public ResponseEntity<List<Car>> getCarsByOwner(@PathVariable Long accountId) {
        try {
            List<Car> cars = carService.getCarsByOwner(accountId);
            return ResponseEntity.ok(cars);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    // Cập nhật thông tin xe của chủ xe
    @PutMapping("/update/{carId}")
    public ResponseEntity<String> updateCar(@RequestHeader("Authorization") String token,
                                            @PathVariable Long carId,
                                            @RequestBody CarDTO carDTO) {
        try {
            Long accountId = jwtUtil.extractUserId(token.substring(7)); // Loại bỏ 'Bearer ' khỏi token
            carService.updateCar(accountId, carId, carDTO);
            return ResponseEntity.status(HttpStatus.OK).body("Cập nhật xe thành công.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Lỗi: " + e.getMessage());
        }
    }

    // Xóa xe của chủ xe
    @DeleteMapping("/delete/{carId}")
    public ResponseEntity<String> deleteCar(@RequestHeader("Authorization") String token,
                                            @PathVariable Long carId) {
        try {
            Long accountId = jwtUtil.extractUserId(token.substring(7)); // Loại bỏ 'Bearer ' khỏi token
            carService.deleteCar(accountId, carId);
            return ResponseEntity.status(HttpStatus.OK).body("Xóa xe thành công.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Lỗi: " + e.getMessage());
        }
    }
    // Lấy danh sách tất cả xe cho trang chủ khách hàng
    @GetMapping("/list")
    public ResponseEntity<List<CarDTO>> getAllCars() {
        try {
            List<CarDTO> cars = carService.getAllCars();
            return ResponseEntity.ok(cars);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }
    // Lấy chi tiết xe theo id
    @GetMapping("/{carId}")
    public ResponseEntity<CarDTO> getCarById(@PathVariable Long carId) {
        try {
            CarDTO carDTO = carService.getCarById(carId);
            return ResponseEntity.ok(carDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

}

