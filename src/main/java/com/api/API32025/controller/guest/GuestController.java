package com.api.API32025.controller.guest;

import com.api.API32025.dto.car.CarDTO;
import com.api.API32025.dto.car.CarDetailDTO;
import com.api.API32025.entity.Car;
import com.api.API32025.entity.Car_images;
import com.api.API32025.respository.CarRepository;
import com.api.API32025.service.CarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/guest")
public class GuestController {

    @Autowired
    private CarService carService;

    @Autowired
    private CarRepository carRepository;

    @GetMapping("/car/list")
    public ResponseEntity<List<CarDTO>> getAllCars() {
        try {
            List<CarDTO> cars = carService.getAllCars();
            return ResponseEntity.ok(cars);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }
    @GetMapping("/car/{carId}")
    public ResponseEntity<CarDTO> getCarById(@PathVariable Long carId) {
        try {
            CarDTO carDTO = carService.getCarById(carId);
            return ResponseEntity.ok(carDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }
    @GetMapping("/car-detail/{carId}")
    public ResponseEntity<CarDetailDTO> getCarDetail(@PathVariable Long carId) {
        try {
            CarDetailDTO detail = carService.getDetailByCar(carId);
            return ResponseEntity.ok(detail);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @GetMapping("/car-images/{carId}")
    public ResponseEntity<List<String>> getCarImages(@PathVariable Long carId) {
        try {
            Car car = carRepository.findById(carId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy xe với id: " + carId));

            List<String> imagePaths = car.getCarImages()
                    .stream()
                    .map(Car_images::getImagePath)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(imagePaths);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }
}
