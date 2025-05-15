package com.api.API32025.service;

import com.api.API32025.dto.CarDTO;
import com.api.API32025.entity.Car;
import com.api.API32025.entity.CarOwner;
import com.api.API32025.entity.Car_images;
import com.api.API32025.respository.CarImgRepository;
import com.api.API32025.respository.CarOwnerRepository;
import com.api.API32025.respository.CarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CarService {
    @Autowired
    private CarRepository carRepository;

    @Autowired
    private CarOwnerRepository carOwnerRepository;

    @Autowired
    private CarImgRepository carImgRepository;

    public void addCarForOwner(Long accountId, CarDTO carDTO) {
        CarOwner carOwner = carOwnerRepository.findByAccountId(accountId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chủ xe"));

        Car car = new Car();
        car.setLicensePlate(carDTO.getLicensePlate());
        car.setBrand(carDTO.getBrand());
        car.setModel(carDTO.getModel());
        car.setYear(carDTO.getYear());
        car.setColor(carDTO.getColor());
        car.setSeats(carDTO.getSeats());
        car.setPricePerDay(carDTO.getPricePerDay());
        car.setCarOwner(carOwner);

        carRepository.save(car);
        Car_images carImages = new Car_images();
        carImages.setCar(car);
        carImgRepository.save(carImages);
    }

    public List<Car> getCarsByOwner(Long accountId) {
        CarOwner carOwner = carOwnerRepository.findByAccountId(accountId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chủ xe"));

        return carRepository.findByCarOwner(carOwner);
    }

    public Car updateCar(Long accountId, Long carId, CarDTO carDTO) {
        CarOwner carOwner = carOwnerRepository.findByAccountId(accountId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chủ xe"));

        Car car = carRepository.findById(carId).orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));

        if (!car.getCarOwner().equals(carOwner)) {
            throw new RuntimeException("Bạn không có quyền sửa xe này.");
        }

        car.setLicensePlate(carDTO.getLicensePlate());
        car.setBrand(carDTO.getBrand());
        car.setModel(carDTO.getModel());
        car.setYear(carDTO.getYear());
        car.setColor(carDTO.getColor());
        car.setSeats(carDTO.getSeats());
        car.setPricePerDay(carDTO.getPricePerDay());

        return carRepository.save(car);
    }

    public void deleteCar(Long accountId, Long carId) {
        CarOwner carOwner = carOwnerRepository.findByAccountId(accountId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chủ xe"));

        Car car = carRepository.findById(carId).orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));

        if (!car.getCarOwner().equals(carOwner)) {
            throw new RuntimeException("Bạn không có quyền xóa xe này.");
        }

        carRepository.delete(car);
    }
    public List<CarDTO> getAllCars() {
        List<Car> cars = carRepository.findAll();
        return cars.stream().map(car -> {
            CarDTO dto = new CarDTO();
            dto.setId(car.getId());
            dto.setBrand(car.getBrand());
            dto.setModel(car.getModel());
            dto.setLicensePlate(car.getLicensePlate());
            dto.setPricePerDay(car.getPricePerDay());
            dto.setYear(car.getYear());
            dto.setColor(car.getColor());
            dto.setSeats(car.getSeats());
            return dto;
        }).collect(Collectors.toList());
    }
    public CarDTO getCarById(Long carId) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));

        CarDTO dto = new CarDTO();
        dto.setId(car.getId());
        dto.setLicensePlate(car.getLicensePlate());
        dto.setBrand(car.getBrand());
        dto.setModel(car.getModel());
        dto.setYear(car.getYear());
        dto.setColor(car.getColor());
        dto.setSeats(car.getSeats());
        dto.setPricePerDay(car.getPricePerDay());
        return dto;
    }


}
