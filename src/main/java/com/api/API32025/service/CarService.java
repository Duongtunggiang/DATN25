package com.api.API32025.service;

import com.api.API32025.dto.BrandDTO;
import com.api.API32025.dto.CarDTO;
import com.api.API32025.dto.CarImageDOT;
import com.api.API32025.entity.*;
import com.api.API32025.respository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CarService {
    @Autowired
    private CarRepository carRepository;

    @Autowired
    private CarOwnerRepository carOwnerRepository;

    @Autowired
    private CarImgRepository carImgRepository;
    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private SegmentRepository segmentRepository;
    @Autowired
    private CategoryRepository categoryRepository;

    public void addBrand(Long accountId, BrandDTO brandDTO){
        CarOwner carOwner = carOwnerRepository.findByAccountId(accountId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chủ xe"));
        Category category = categoryRepository.findById(brandDTO.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục (category)"));
        Segment segment = segmentRepository.findById(brandDTO.getSegmentId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phân khúc xe"));
        Brand brand = new Brand();
        brand.setBrandName(brandDTO.getBrandName());
        brand.setCarOwner(carOwner);
        brand.setCategory(category);
        brand.setSegment(segment);
        brandRepository.save(brand);
    }

    public void addCarForOwner(Long accountId, CarDTO carDTO, MultipartFile carImage) {
        CarOwner carOwner = carOwnerRepository.findByAccountId(accountId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chủ xe"));

        Brand brand = brandRepository.findById(carDTO.getBrandId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thương hiệu"));

        if (carImage != null && !carImage.isEmpty()) {
            String filename = UUID.randomUUID() + "_" + carImage.getOriginalFilename();
            Path filePath = Paths.get("Images/carimage", filename);
            try {
                Files.createDirectories(filePath.getParent());
                Files.write(filePath, carImage.getBytes());
                carDTO.setImagePaths("/Images/carimage/" + filename);
            } catch (IOException e) {
                throw new RuntimeException("Lỗi lưu ảnh xe: " + e.getMessage());
            }
        }

        Optional<Car> existingCar = carRepository.findByLicensePlate(carDTO.getLicensePlate());
        if (existingCar.isPresent()) {
            throw new RuntimeException("Biển số xe đã tồn tại, vui lòng kiểm tra lại.");
        }

        Car car = new Car();
        car.setLicensePlate(carDTO.getLicensePlate());
        car.setBrand(brand);
        car.setCarName(carDTO.getCarName());
        car.setModel(carDTO.getModel());
        car.setYear(carDTO.getYear());
        car.setColor(carDTO.getColor());
        car.setSeats(carDTO.getSeats());
        car.setPricePerDay(carDTO.getPricePerDay());
        car.setImageUrl(carDTO.getImagePaths());

        carRepository.save(car);

        Car_images carImages = new Car_images();
        carImages.setCar(car);
        carImgRepository.save(carImages);
    }

    public Car updateCar(Long accountId, Long carId, CarDTO carDTO) {
        CarOwner carOwner = carOwnerRepository.findByAccountId(accountId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chủ xe"));

        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));

        // Kiểm tra biển số xe trùng nhưng không tính chiếc xe hiện tại
        Optional<Car> existingCar = carRepository.findByLicensePlate(carDTO.getLicensePlate());
        if (existingCar.isPresent() && !existingCar.get().getId().equals(carId)) {
            throw new RuntimeException("Biển số xe đã tồn tại, vui lòng kiểm tra lại.");
        }

        car.setLicensePlate(carDTO.getLicensePlate());
        car.setModel(carDTO.getModel());
        car.setYear(carDTO.getYear());
        car.setColor(carDTO.getColor());
        car.setSeats(carDTO.getSeats());
        car.setPricePerDay(carDTO.getPricePerDay());

        return carRepository.save(car);
    }


    public void addCarImg(Long accountId, CarImageDOT carImageDto){
        Car car = carRepository.findById(carImageDto.getCarId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));
        Car_images carImages = new Car_images();
        carImages.setImagePath(carImageDto.getImgPath());
        carImages.setCar(car);
        carImgRepository.save(carImages);
    }
    public List<CarDTO> getCarsByOwner(Long accountId) {
        CarOwner carOwner = carOwnerRepository.findByAccountId(accountId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chủ xe"));

        List<Brand> brands = brandRepository.findByCarOwner(carOwner);

        List<Car> cars = brands.stream()
                .flatMap(brand -> brand.getCars().stream())
                .collect(Collectors.toList());

        return cars.stream().map(car -> {
            CarDTO dto = new CarDTO();
            dto.setId(car.getId());
            dto.setModel(car.getModel());
            dto.setLicensePlate(car.getLicensePlate());
            dto.setPricePerDay(car.getPricePerDay());
            dto.setYear(car.getYear());
            dto.setColor(car.getColor());
            dto.setSeats(car.getSeats());
            dto.setStatus(car.getStatus());
            dto.setImagePaths(car.getImageUrl());
            dto.setCarName(car.getCarName());

            return dto;
        }).collect(Collectors.toList());
    }

    public List<BrandDTO> getAllBrands() {
        List<Brand> brands = brandRepository.findAll();

        return brands.stream().map(brand -> {
            BrandDTO dto = new BrandDTO();
            dto.setId(brand.getId());
            dto.setBrandName(brand.getBrandName());
            dto.setCategoryId(brand.getCategory().getId());
            dto.setSegmentId(brand.getSegment().getId());
            return dto;
        }).collect(Collectors.toList());
    }

    //Car car = carRepository.findById(id).orElseThrow(...);
    //String brandName = car.getSegment().getBrand().getBrandName();
//    public List<Car> getCarsByOwner(Long accountId) {
//        CarOwner carOwner = carOwnerRepository.findByAccountId(accountId)
//                .orElseThrow(() -> new RuntimeException("Không tìm thấy chủ xe"));
//
//        return carRepository.findByCarOwner(carOwner);
//    }

//    public Car updateCar(Long accountId, Long carId, CarDTO carDTO) {
//        CarOwner carOwner = carOwnerRepository.findByAccountId(accountId)
//                .orElseThrow(() -> new RuntimeException("Không tìm thấy chủ xe"));
//
//        Car car = carRepository.findById(carId).orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));
//
//
//
//        car.setLicensePlate(carDTO.getLicensePlate());
//        car.setModel(carDTO.getModel());
//        car.setYear(carDTO.getYear());
//        car.setColor(carDTO.getColor());
//        car.setSeats(carDTO.getSeats());
//        car.setPricePerDay(carDTO.getPricePerDay());
//
//        return carRepository.save(car);
//    }

    public void deleteCar(Long accountId, Long carId, String role) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));

        if ("ROLE_ADMIN".equals(role)) {
            car.setStatus("DELETED");
            carRepository.save(car);
            return;
        }

        CarOwner carOwner = carOwnerRepository.findByAccountId(accountId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chủ xe"));

        if (!car.getBrand().getCarOwner().getId().equals(carOwner.getId())) {
            throw new RuntimeException("Bạn không có quyền xóa xe này");
        }

        car.setStatus("DELETED");
        carRepository.save(car);
    }


    public List<CarDTO> getAllCars() {
        List<Car> cars = carRepository.findAll();
        return cars.stream().map(car -> {
            CarDTO dto = new CarDTO();
            dto.setId(car.getId());
            dto.setModel(car.getModel());
            dto.setLicensePlate(car.getLicensePlate());
            dto.setPricePerDay(car.getPricePerDay());
            dto.setYear(car.getYear());
            dto.setColor(car.getColor());
            dto.setSeats(car.getSeats());
            dto.setImagePaths(car.getImageUrl());
            dto.setStatus(car.getStatus());
            dto.setCarName(car.getCarName());

            return dto;
        }).collect(Collectors.toList());
    }
    public CarDTO getCarById(Long carId) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));

        CarDTO dto = new CarDTO();
        dto.setId(car.getId());
        dto.setCarName(car.getCarName());
        dto.setLicensePlate(car.getLicensePlate());
        dto.setModel(car.getModel());
        dto.setYear(car.getYear());
        dto.setColor(car.getColor());
        dto.setSeats(car.getSeats());
        dto.setPricePerDay(car.getPricePerDay());
        dto.setImagePaths(car.getImageUrl());


        return dto;
    }


}
