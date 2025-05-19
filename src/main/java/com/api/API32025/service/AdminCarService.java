package com.api.API32025.service;

import com.api.API32025.entity.Car;
import com.api.API32025.respository.CarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminCarService {

    @Autowired
    private CarRepository carRepository;

    public List<Car> getPendingCars() {
        return carRepository.findByStatus("PENDING");
    }

    public Car approveCar(Long carId) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));
        car.setStatus("AVAILABLE");
        return carRepository.save(car);
    }
}
