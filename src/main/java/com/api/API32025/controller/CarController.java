package com.api.API32025.controller;

import com.api.API32025.dto.BrandDTO;
import com.api.API32025.dto.CarDTO;
import com.api.API32025.entity.Brand;
import com.api.API32025.entity.Car;
import com.api.API32025.jwt.JwtUtil;
import com.api.API32025.service.CarService;
import org.springframework.beans.factory.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/cars")
public class CarController {

    @Autowired
    private CarService carService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/add-brand")
    public ResponseEntity<String> addBrand(@RequestHeader("Authorization") String token,
                                           @RequestBody BrandDTO brandDTO) {
        try {
            Long accountId = jwtUtil.extractUserId(token.substring(7)); // Loại bỏ 'Bearer ' khỏi token
            carService.addBrand(accountId, brandDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body("Thêm thành công");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Lỗi thêm brand: " + e.getMessage());
        }
    }

    // Thêm xe cho chủ xe
    @PostMapping("/add-car")
    public ResponseEntity<String> addCar(
            @RequestHeader("Authorization") String token,
            @RequestParam("carName") String carName,
            @RequestParam("licensePlate") String licensePlate,
            @RequestParam("brandId") Long brandId,
            @RequestParam("model") String model,
            @RequestParam("year") int year,
            @RequestParam("color") String color,
            @RequestParam("seats") int seats,
            @RequestParam("pricePerDay") double pricePerDay,
            @RequestParam(value = "carImage", required = false) MultipartFile carImage
    ) {
        try {
            Long accountId = jwtUtil.extractUserId(token.substring(7));

            CarDTO carDTO = new CarDTO();
            carDTO.setCarName(carName);
            carDTO.setLicensePlate(licensePlate);
            carDTO.setBrandId(brandId);
            carDTO.setModel(model);
            carDTO.setYear(year);
            carDTO.setColor(color);
            carDTO.setSeats(seats);
            carDTO.setPricePerDay(pricePerDay);

            carService.addCarForOwner(accountId, carDTO, carImage);

            return ResponseEntity.status(HttpStatus.CREATED).body("Thêm xe thành công.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Lỗi backend: " + e.getMessage());
        }
    }


    @GetMapping("/my-cars")
    public ResponseEntity<List<CarDTO>> getMyCars(@RequestHeader("Authorization") String token) {
        try {
            Long accountId = jwtUtil.extractUserId(token.substring(7));
            List<CarDTO> cars = carService.getCarsByOwner(accountId);
            return ResponseEntity.ok(cars);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }


    // Lấy danh sách xe của chủ xe
//    @GetMapping("/owner/{accountId}")
//    public ResponseEntity<List<Car>> getCarsByOwner(@PathVariable Long accountId) {
//        try {
//            List<Car> cars = carService.getCarsByOwner(accountId);
//            return ResponseEntity.ok(cars);
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
//        }
//    }

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
            Long accountId = jwtUtil.extractUserId(token.substring(7));
            String role = jwtUtil.extractRole(token.substring(7));
            carService.deleteCar(accountId, carId, role);


            return ResponseEntity.ok("Xóa xe thành công.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
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
    // Lấy danh sách xe của chủ xe từ token
//    @GetMapping("/my-cars")
//    public ResponseEntity<List<Car>> getMyCars(@RequestHeader("Authorization") String token) {
//        try {
//            Long accountId = jwtUtil.extractUserId(token.substring(7));
//            List<Car> cars = carService.getCarsByOwner(accountId);
//            return ResponseEntity.ok(cars);
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
//        }
//    }


}

