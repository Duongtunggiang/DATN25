package com.api.API32025.service;

import com.api.API32025.dto.car.*;
import com.api.API32025.entity.*;
import com.api.API32025.respository.*;
import com.api.API32025.respository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FavoriteCarService {
    @Autowired
    private FavoriteCarRepository favoriteCarRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private CarRepository carRepository;

    // Thêm xe vào danh sách yêu thích
    public FavoriteCar addFavoriteCar(Long customerId, Long carId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));

        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));

        // Kiểm tra xem đã yêu thích chưa
        if (favoriteCarRepository.existsByCustomerAndCar(customer, car)) {
            throw new RuntimeException("Xe đã có trong danh sách yêu thích");
        }

        FavoriteCar favoriteCar = new FavoriteCar();
        favoriteCar.setCustomer(customer);
        favoriteCar.setCar(car);
        favoriteCar.setCreatedAt(LocalDateTime.now());

        return favoriteCarRepository.save(favoriteCar);
    }

    // Xóa xe khỏi danh sách yêu thích
    public void removeFavoriteCar(Long customerId, Long carId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));

        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));

        FavoriteCar favoriteCar = favoriteCarRepository.findByCustomerAndCar(customer, car)
                .orElseThrow(() -> new RuntimeException("Xe không có trong danh sách yêu thích"));

        favoriteCarRepository.delete(favoriteCar);
    }

    // Lấy danh sách xe yêu thích của khách hàng
    public List<CarDTO> getFavoriteCars(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));

        List<FavoriteCar> favoriteCars = favoriteCarRepository.findByCustomer(customer);

        return favoriteCars.stream()
                .map(favoriteCar -> {
                    Car car = favoriteCar.getCar();
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
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // Kiểm tra xe có trong danh sách yêu thích không
    public boolean isCarFavorite(Long customerId, Long carId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));

        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));

        return favoriteCarRepository.existsByCustomerAndCar(customer, car);
    }
}
