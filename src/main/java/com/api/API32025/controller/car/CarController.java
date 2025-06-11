package com.api.API32025.controller.car;

import com.api.API32025.dto.car.BrandDTO;
import com.api.API32025.dto.car.CarDTO;
import com.api.API32025.dto.car.CarDetailDTO;
import com.api.API32025.dto.car.CarImageDOT;
import com.api.API32025.entity.Car;
import com.api.API32025.entity.Car_images;
import com.api.API32025.jwt.JwtUtil;
import com.api.API32025.respository.CarRepository;
import com.api.API32025.service.BrandService;
import com.api.API32025.service.CarService;
import org.springframework.beans.factory.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cars")
public class CarController {

    @Autowired
    private CarService carService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private BrandService brandService;

    @PostMapping("/add-brand")
    public ResponseEntity<String> addBrand(@RequestHeader("Authorization") String token,
                                           @RequestBody BrandDTO brandDTO) {
        try {
            Long accountId = jwtUtil.extractUserId(token.substring(7));
            brandService.addBrand(brandDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body("Thêm thành công");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Lỗi thêm brand: " + e.getMessage());
        }
    }

    @PostMapping("/add-car")
    public ResponseEntity<Long> addCar(
            @RequestHeader("Authorization") String token,
            @RequestParam("carName") String carName,
            @RequestParam("licensePlate") String licensePlate,
            @RequestParam("brandId") Long brandId,
            @RequestParam("segmentId") Long segmentId,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam("model") String model,
            @RequestParam("year") int year,
            @RequestParam("color") String color,
            @RequestParam("seats") int seats,
            @RequestParam("pricePerDay") double pricePerDay,
            @RequestParam("address") String address,
            @RequestParam("transmission") String transmission,
            @RequestParam("fuel") String fuel,
            @RequestParam(value = "carImage", required = false) MultipartFile carImage
    ) {
        try {
            Long accountId = jwtUtil.extractUserId(token.substring(7));

            CarDTO carDTO = new CarDTO();
            carDTO.setCarName(carName);
            carDTO.setLicensePlate(licensePlate);
            carDTO.setBrandId(brandId);
            carDTO.setSegmentId(segmentId);
            carDTO.setCategoryId(categoryId);
            carDTO.setModel(model);
            carDTO.setYear(year);
            carDTO.setColor(color);
            carDTO.setSeats(seats);
            carDTO.setPricePerDay(pricePerDay);
            carDTO.setAddress(address);
            carDTO.setTransmission(Car.Transmission.valueOf(transmission));
            carDTO.setFuel(fuel);

            Long carId = carService.addCarForOwner(accountId, carDTO, carImage);
            return ResponseEntity.ok(carId);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
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

    @GetMapping("/{carId}")
    public ResponseEntity<CarDTO> getCarById(@PathVariable Long carId) {
        try {
            CarDTO carDTO = carService.getCarById(carId);
            return ResponseEntity.ok(carDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @GetMapping("/car-detail/{carId}")
    public ResponseEntity<CarDetailDTO> getCarDetail(@PathVariable Long carId){
        try {
            CarDetailDTO carDetailDTO = carService.getDetailByCar(carId);
            return ResponseEntity.ok(carDetailDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @PostMapping("/addCarDetail/{carId}")
    public ResponseEntity<String> addCarDetail(@RequestHeader("Authorization") String token,
                                               @PathVariable Long carId,
                                               @RequestBody CarDetailDTO carDetailDTO) {
        try {
            Long accountId = jwtUtil.extractUserId(token.substring(7));
            carService.addCarDetail(carId, carDetailDTO);
            return ResponseEntity.ok("Thêm chi tiết xe thành công");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Lỗi: " + e.getMessage());
        }
    }

    @PostMapping("/add-images/{carId}")
    public ResponseEntity<?> addImage(@RequestHeader("Authorization") String token,
                                      @PathVariable Long carId,
                                      @RequestParam("carImage") MultipartFile carImage) {
        try {
            carService.addCarImage(carId, carImage);
            return ResponseEntity.ok("Thêm ảnh thành công!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
    @GetMapping("/{carId}/car-images")
    public ResponseEntity<List<Car_images>> getCarImagesWithId(@PathVariable Long carId) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe với id: " + carId));

        List<Car_images> images = car.getCarImages();
        return ResponseEntity.ok(images);
    }
    @GetMapping("/car-images/{carId}")
    public ResponseEntity<List<String>> getCarImages(@RequestHeader("Authorization") String token,
                                                     @PathVariable Long carId) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe với id: " + carId));

        List<String> imagePaths = car.getCarImages()
                .stream()
                .map(Car_images::getImagePath)
                .collect(Collectors.toList());

        return ResponseEntity.ok(imagePaths);
    }

    @PostMapping("/success")
    public ResponseEntity<?> confirmRegister(@RequestBody CarDTO carDTO) {
        carService.setCarSuccessfully(carDTO);
        return ResponseEntity.ok("Xe đã được gửi duyệt thành công.");
    }

    @PutMapping("/{carId}/set-available-after-refund")
    public ResponseEntity<?> setCarAvailableAfterRefund(@PathVariable Long carId) {
        try {
            Car updatedCar = carService.setCarAvailableAfterRefund(carId);
            return ResponseEntity.ok(updatedCar);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{carId}/set-available")
    public ResponseEntity<?> setCarAvailable(@PathVariable Long carId){
        try{
            Car updateStatus = carService.setCarAvaliable(carId);
            return  ResponseEntity.ok(updateStatus);
        }catch (RuntimeException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{carId}/image")
    public ResponseEntity<String> updateCarImage(
            @PathVariable Long carId,
            @RequestParam("image") MultipartFile newImage) {
        carService.updateCarImage(carId, newImage);
        return ResponseEntity.ok("Cập nhật ảnh xe thành công.");
    }

    @PutMapping("/update-car-detail/{carId}")
    public ResponseEntity<String> updateCarDetail(@RequestHeader("Authorization") String token,
                                                  @PathVariable Long carId,
                                                  @RequestBody CarDetailDTO carDetailDTO) {
        try {
            Long accountId = jwtUtil.extractUserId(token.substring(7));
            carService.updateCarDetail(accountId, carId, carDetailDTO);
            return ResponseEntity.ok("Cập nhật chi tiết xe thành công.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Lỗi: " + e.getMessage());
        }
    }
    @DeleteMapping("/delete-car-image/{imageId}")
    public ResponseEntity<String> deleteCarImage(@RequestHeader("Authorization") String token,
                                                 @PathVariable Long imageId) {
        try {
            Long accountId = jwtUtil.extractUserId(token.substring(7));
            carService.deleteCarImage(accountId, imageId);
            return ResponseEntity.ok("Xóa ảnh thành công.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Lỗi: " + e.getMessage());
        }
    }

    @PostMapping("/update-segment-category")
    public ResponseEntity<String> updateAllCarsSegmentAndCategory() {
        try {
            carService.updateAllCarsSegmentAndCategory();
            return ResponseEntity.ok("Đã cập nhật segment và category cho tất cả xe");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }

}

