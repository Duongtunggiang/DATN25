package com.api.API32025.service;

import com.api.API32025.controller.car.SegmentController;
import com.api.API32025.dto.car.*;
import com.api.API32025.entity.*;
import com.api.API32025.respository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
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

    @Autowired
    private CarDetailRepository carDetailRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private AccountService accountService;

    public Long addCarForOwner(Long accountId, CarDTO carDTO, MultipartFile carImage) {
        Account account = carOwnerRepository.findByAccountId(accountId)
                .map(CarOwner::getAccount)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));
        
        accountService.checkAccountStatus(account);
        
        CarOwner carOwner = carOwnerRepository.findByAccountId(accountId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chủ xe"));

        Brand brand = brandRepository.findById(carDTO.getBrandId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thương hiệu"));

        Segment segment = segmentRepository.findById(carDTO.getSegmentId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phân khúc"));

        Category category = categoryRepository.findById(carDTO.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));

        // Validate biển số
        if (carRepository.findByLicensePlate(carDTO.getLicensePlate()).isPresent()) {
            throw new RuntimeException("Biển số đã tồn tại.");
        }

        // Lưu ảnh
        String imagePath = null;
        if (carImage != null && !carImage.isEmpty()) {
            String filename = UUID.randomUUID() + "_" + carImage.getOriginalFilename();
            Path filePath = Paths.get("Images/carimage", filename);
            try {
                Files.createDirectories(filePath.getParent());
                Files.write(filePath, carImage.getBytes());
                imagePath = "/Images/carimage/" + filename;
            } catch (IOException e) {
                throw new RuntimeException("Lỗi lưu ảnh xe: " + e.getMessage());
            }
        }

        Car car = new Car();
        car.setCarOwner(carOwner);
        car.setLicensePlate(carDTO.getLicensePlate());
        car.setCarName(carDTO.getCarName());
        car.setModel(carDTO.getModel());
        car.setYear(carDTO.getYear());
        car.setColor(carDTO.getColor());
        car.setSeats(carDTO.getSeats());
        car.setPricePerDay(carDTO.getPricePerDay());
        car.setImageUrl(imagePath);
        car.setFuel(carDTO.getFuel());
        car.setTransmission(carDTO.getTransmission());
        car.setAddress(carDTO.getAddress());
        car.setStatus(Car.CarStatus.PENDING);

        car.setBrand(brand);
        car.setSegment(segment);
        car.setCategory(category);

        carRepository.save(car);

        // Tạo carDetail
        CarDetail carDetail = new CarDetail();
        carDetail.setCar(car);
        carDetailRepository.save(carDetail);

        return car.getId();
    }
    public List<CategoryDTO> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();

        return categories.stream().map(category -> {
            CategoryDTO dto = new CategoryDTO();
            dto.setId(category.getId());
            dto.setName(category.getName());
            dto.setCategoryImage(category.getCategoryImage());
            return dto;
        }).collect(Collectors.toList());
    }


    public List<SegmentDTO> getAllSegments() {
        List<Segment> segments = segmentRepository.findAll();

        return segments.stream().map(segment -> {
            SegmentDTO dto = new SegmentDTO();
            dto.setId(segment.getId());
            dto.setName(segment.getName());
            dto.setDescription(segment.getDescription());
            return dto;
        }).collect(Collectors.toList());
    }

    public List<BrandDTO> getAllBrands() {
        List<Brand> brands = brandRepository.findAll();

        return brands.stream().map(brand -> {
            BrandDTO dto = new BrandDTO();
            dto.setId(brand.getId());
            dto.setBrandName(brand.getBrandName());
            return dto;
        }).collect(Collectors.toList());
    }


    public void addCarDetail(Long carId, CarDetailDTO carDetailDTO){
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));

        Account account = car.getCarOwner().getAccount();
        accountService.checkAccountStatus(account);

        CarDetail carDetail = car.getCarDetail();

        if (carDetail == null) {
            throw new RuntimeException("Chi tiết xe chưa được tạo");
        }
        carDetail.setCar(car);
        carDetail.setBluetooth(carDetailDTO.isBluetooth());
        carDetail.setCamera(carDetailDTO.isCamera());
        carDetail.setMileage(carDetailDTO.getMileage());
        carDetail.setFuelCommission(carDetailDTO.getFuelCommission());
        carDetail.setSunRoof(carDetailDTO.isSunRoof());
        carDetail.setChildLock(carDetailDTO.isChildLock());
        carDetail.setChildSeat(carDetailDTO.isChildSeat());
        carDetail.setDvd(carDetailDTO.isDvd());
        carDetail.setDescription(carDetailDTO.getDescription());
        carDetail.setUsb(carDetailDTO.isUsb());
        carDetail.setGps(carDetailDTO.isGps());

        // Set car usage terms
        carDetail.setNoSmoking(carDetailDTO.isNoSmoking());
        carDetail.setNoPets(carDetailDTO.isNoPets());
        carDetail.setNoEating(carDetailDTO.isNoEating());
        carDetail.setReturnFullTank(carDetailDTO.isReturnFullTank());
        carDetail.setNoOffroad(carDetailDTO.isNoOffroad());
        carDetail.setCleanCar(carDetailDTO.isCleanCar());
        carDetail.setNoDeliveryService(carDetailDTO.isNoDeliveryService());

        carDetailRepository.save(carDetail);
    }
    public void setCarSuccessfully(CarDTO carDTO){
        Car car = carRepository.findById(carDTO.getId())
                        .orElseThrow(()-> new RuntimeException("Không tìm thấy xe"));
        
        Account account = car.getCarOwner().getAccount();
        accountService.checkAccountStatus(account);
        
        car.setStatus(Car.CarStatus.PENDING);
        carRepository.save(car);
    }
    public CarDetailDTO getDetailByCar(Long carId) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));

        CarDetail carDetail = carDetailRepository.findByCar(car)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin chi tiết của xe"));

        CarDetailDTO dto = new CarDetailDTO();
        dto.setCarId(car.getId());
        dto.setDescription(carDetail.getDescription());
        dto.setMileage(carDetail.getMileage());
        dto.setFuelCommission(carDetail.getFuelCommission());
        dto.setBluetooth(carDetail.isBluetooth());
        dto.setCamera(carDetail.isCamera());
        dto.setChildLock(carDetail.isChildLock());
        dto.setChildSeat(carDetail.isChildSeat());
        dto.setDvd(carDetail.isDvd());
        dto.setGps(carDetail.isGps());
        dto.setSunRoof(carDetail.isSunRoof());
        dto.setUsb(carDetail.isUsb());

        // Get car usage terms
        dto.setNoSmoking(carDetail.isNoSmoking());
        dto.setNoPets(carDetail.isNoPets());
        dto.setNoEating(carDetail.isNoEating());
        dto.setReturnFullTank(carDetail.isReturnFullTank());
        dto.setNoOffroad(carDetail.isNoOffroad());
        dto.setCleanCar(carDetail.isCleanCar());
        dto.setNoDeliveryService(carDetail.isNoDeliveryService());

        // Add segment and category information from Car entity
        if (car.getSegment() != null) {
            dto.setSegmentId(car.getSegment().getId());
            dto.setSegmentName(car.getSegment().getName());
        }
        if (car.getCategory() != null) {
            dto.setCategoryId(car.getCategory().getId());
            dto.setCategoryName(car.getCategory().getName());
        }

        return dto;
    }


    public Car updateCar(Long accountId, Long carId, CarDTO carDTO) {
        Account account = carOwnerRepository.findByAccountId(accountId)
                .map(CarOwner::getAccount)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));
        
        accountService.checkAccountStatus(account);

        CarOwner carOwner = carOwnerRepository.findByAccountId(accountId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chủ xe"));

        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));

        if (!car.getCarOwner().getId().equals(carOwner.getId())) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa xe này.");
        }

        Optional<Car> existingCar = carRepository.findByLicensePlate(carDTO.getLicensePlate());
        if (existingCar.isPresent() && !existingCar.get().getId().equals(carId)) {
            throw new RuntimeException("Biển số xe đã tồn tại, vui lòng kiểm tra lại.");
        }

        Brand brand = brandRepository.findById(carDTO.getBrandId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thương hiệu"));

        Segment segment = segmentRepository.findById(carDTO.getSegmentId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phân khúc"));

        Category category = categoryRepository.findById(carDTO.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));

        car.setLicensePlate(carDTO.getLicensePlate());
        car.setModel(carDTO.getModel());
        car.setYear(carDTO.getYear());
        car.setColor(carDTO.getColor());
        car.setSeats(carDTO.getSeats());
        car.setPricePerDay(carDTO.getPricePerDay());
        car.setTransmission(carDTO.getTransmission());
        car.setFuel(carDTO.getFuel());
        car.setAddress(carDTO.getAddress());
        car.setCarName(carDTO.getCarName());

        car.setBrand(brand);
        car.setSegment(segment);
        car.setCategory(category);

        return carRepository.save(car);
    }
    public void updateCarImage(Long carId, MultipartFile newImage) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe với ID: " + carId));

        Account account = car.getCarOwner().getAccount();
        accountService.checkAccountStatus(account);

        if (newImage != null && !newImage.isEmpty()) {
            // Xóa ảnh cũ nếu có
            if (car.getImageUrl() != null) {
                Path oldImagePath = Paths.get("." + car.getImageUrl()); // nối "." để dùng đúng path tương đối
                try {
                    Files.deleteIfExists(oldImagePath);
                } catch (IOException e) {
                    throw new RuntimeException("Không thể xóa ảnh cũ: " + e.getMessage());
                }
            }

            // Lưu ảnh mới
            String filename = UUID.randomUUID() + "_" + newImage.getOriginalFilename();
            Path newImagePath = Paths.get("Images/carimage", filename);
            try {
                Files.createDirectories(newImagePath.getParent());
                Files.write(newImagePath, newImage.getBytes());
                car.setImageUrl("/Images/carimage/" + filename);
            } catch (IOException e) {
                throw new RuntimeException("Lỗi lưu ảnh mới: " + e.getMessage());
            }

            carRepository.save(car);
        } else {
            throw new RuntimeException("Ảnh mới không hợp lệ.");
        }
    }


    public void updateCarDetail(Long accountId, Long carId, CarDetailDTO carDetailDTO) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));
        
        Account account = car.getCarOwner().getAccount();
        accountService.checkAccountStatus(account);

        CarDetail carDetail = carDetailRepository.findByCar(car)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chi tiết xe."));

        carDetail.setBluetooth(carDetailDTO.isBluetooth());
        carDetail.setCamera(carDetailDTO.isCamera());
        carDetail.setMileage(carDetailDTO.getMileage());
        carDetail.setFuelCommission(carDetailDTO.getFuelCommission());
        carDetail.setSunRoof(carDetailDTO.isSunRoof());
        carDetail.setChildLock(carDetailDTO.isChildLock());
        carDetail.setChildSeat(carDetailDTO.isChildSeat());
        carDetail.setDvd(carDetailDTO.isDvd());
        carDetail.setDescription(carDetailDTO.getDescription());
        carDetail.setUsb(carDetailDTO.isUsb());
        carDetail.setGps(carDetailDTO.isGps());

        carDetail.setNoSmoking(carDetailDTO.isNoSmoking());
        carDetail.setNoPets(carDetailDTO.isNoPets());
        carDetail.setNoEating(carDetailDTO.isNoEating());
        carDetail.setReturnFullTank(carDetailDTO.isReturnFullTank());
        carDetail.setNoOffroad(carDetailDTO.isNoOffroad());
        carDetail.setCleanCar(carDetailDTO.isCleanCar());
        carDetail.setNoDeliveryService(carDetailDTO.isNoDeliveryService());

        carDetailRepository.save(carDetail);
    }
    public void deleteCarImage(Long accountId, Long imageId) {
        Account account = carOwnerRepository.findByAccountId(accountId)
                .map(CarOwner::getAccount)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));
        
        accountService.checkAccountStatus(account);

        Car_images image = carImgRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ảnh"));

        if (!image.getCar().getCarOwner().getId().equals(account.getId())) {
            throw new RuntimeException("Bạn không có quyền xóa ảnh này.");
        }

        String realPath = image.getImagePath().replace("/Images", "Images");
        Path filePath = Paths.get(realPath);
        try {
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Không thể xóa file: " + e.getMessage());
        }

        carImgRepository.delete(image);
    }


    public void addCarImage(Long carId, MultipartFile carImage) {
        if (carImage == null || carImage.isEmpty()) {
            throw new IllegalArgumentException("Ảnh không được để trống.");
        }

        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe với id: " + carId));

        Account account = car.getCarOwner().getAccount();
        accountService.checkAccountStatus(account);

        String filename = UUID.randomUUID() + "_" + carImage.getOriginalFilename();
        Path filePath = Paths.get("Images/carimage", filename);

        try {
            Files.createDirectories(filePath.getParent());
            Files.write(filePath, carImage.getBytes());
        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi lưu ảnh: " + e.getMessage());
        }

        Car_images carImg = new Car_images();
        carImg.setImagePath("/Images/carimage/" + filename);
        carImg.setCar(car);

        carImgRepository.save(carImg);
    }
    public List<CarDTO> getCarsByOwner(Long accountId) {
        CarOwner carOwner = carOwnerRepository.findByAccountId(accountId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chủ xe"));

        List<Car> cars = carRepository.findByCarOwner(carOwner);

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
            dto.setFuel(car.getFuel());
            dto.setTransmission(car.getTransmission());
            dto.setAddress(car.getAddress());

            return dto;
        }).collect(Collectors.toList());
    }

    public void deleteCar(Long accountId, Long carId, String role) {
        Account account = carOwnerRepository.findByAccountId(accountId)
                .map(CarOwner::getAccount)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));
        
        accountService.checkAccountStatus(account);

        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));

        if ("ADMIN".equals(role)) {
            car.setStatus(Car.CarStatus.DELETED);
            carRepository.save(car);
            return;
        }

        CarOwner carOwner = carOwnerRepository.findByAccountId(accountId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chủ xe"));


        car.setStatus(Car.CarStatus.DELETED);
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
            dto.setAddress(car.getAddress());
            dto.setTransmission(car.getTransmission());
            dto.setFuel(car.getFuel());
            
            // Add brand information
            if (car.getBrand() != null) {
                dto.setBrandId(car.getBrand().getId());
                dto.setBrandName(car.getBrand().getBrandName());
            }
            
            // Add segment information
            if (car.getSegment() != null) {
                dto.setSegmentId(car.getSegment().getId());
                dto.setSegmentName(car.getSegment().getName());
            }
            
            // Add category information
            if (car.getCategory() != null) {
                dto.setCategoryId(car.getCategory().getId());
                dto.setCategoryName(car.getCategory().getName());
            }

            return dto;
        }).collect(Collectors.toList());
    }
    public List<CarImageDOT> getCarImageByCar(Long carId) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));

        return car.getCarImages().stream()
                .map(carImage -> {
                    CarImageDOT dto = new CarImageDOT();
                    dto.setId(carImage.getId());
                    dto.setCarId(carId);
                    dto.setImgPath(carImage.getImagePath());
                    return dto;
                })
                .collect(Collectors.toList());
    }
    public CarDTO getCarById(Long carId) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));
        return convertToDTO(car);
    }

    public Car getCarEntityById(Long carId) {
        return carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));
    }

    private CarDTO convertToDTO(Car car) {
        CarDTO dto = new CarDTO();
        dto.setId(car.getId());
        dto.setCarName(car.getCarName());
        dto.setModel(car.getModel());
        dto.setColor(car.getColor());
        dto.setImagePaths(car.getImageUrl());
        dto.setLicensePlate(car.getLicensePlate());
        dto.setAddress(car.getAddress());
        dto.setPricePerDay(car.getPricePerDay());
        dto.setSeats(car.getSeats());
        dto.setStatus(car.getStatus());
        dto.setTransmission(car.getTransmission());
        dto.setFuel(car.getFuel());
        dto.setYear(car.getYear());

        if (car.getBookings() != null && !car.getBookings().isEmpty()) {
            Optional<Booking> currentBooking = car.getBookings().stream()
                .filter(booking -> booking.getStatus() == Car.CarStatus.DEPOSIT)
                .findFirst();
            
            currentBooking.ifPresent(booking -> dto.setCurrentBookingId(booking.getId()));
        }
        
        return dto;
    }


    public Car setCarAvailableAfterRefund(Long carId) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));

        if (!car.getStatus().equals(Car.CarStatus.CANCEL)) {
            throw new RuntimeException("Xe phải ở trạng thái đã hủy mới có thể đặt về trạng thái sẵn sàng");
        }

        Booking latestBooking = bookingRepository.findFirstByCars_IdOrderByBookingDateDesc(carId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin đặt xe"));

        if (!latestBooking.getStatus().equals(Car.CarStatus.REFUND)) {
            throw new RuntimeException("Booking phải được hoàn tiền trước khi đặt xe về trạng thái sẵn sàng");
        }

        car.setStatus(Car.CarStatus.AVAILABLE);
        return carRepository.save(car);
    }

    public Car setCarAvaliable(Long carId){
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));

        car.setStatus(Car.CarStatus.AVAILABLE);
        return carRepository.save(car);
    }

    public void updateCarSegmentAndCategory(Long carId, Long segmentId, Long categoryId) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));

        Segment segment = segmentRepository.findById(segmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phân khúc"));

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));

        car.setSegment(segment);
        car.setCategory(category);
        carRepository.save(car);
    }

    public void updateAllCarsSegmentAndCategory() {
        List<Car> cars = carRepository.findAll();
        for (Car car : cars) {
            if (car.getSegment() == null || car.getCategory() == null) {
                // Set default segment and category based on car type
                if (car.getSegment() == null) {
                    segmentRepository.findByName("B")
                            .ifPresentOrElse(
                                car::setSegment,
                                () -> { throw new RuntimeException("Không tìm thấy phân khúc mặc định"); }
                            );
                }
                if (car.getCategory() == null) {
                    categoryRepository.findByName("Sedan")
                            .ifPresentOrElse(
                                car::setCategory,
                                () -> { throw new RuntimeException("Không tìm thấy danh mục mặc định"); }
                            );
                }
                carRepository.save(car);
            }
        }
    }

}
