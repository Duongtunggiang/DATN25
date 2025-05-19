package com.api.API32025.service;

import com.api.API32025.entity.Brand;
import com.api.API32025.entity.Car;
import com.api.API32025.respository.CarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BrandService {
    @Autowired
    private CarRepository carRepository;
    public Brand getBrandByCarId(Long carId){
        Car car = carRepository.findById(carId)
                .orElseThrow(()-> new RuntimeException("Không tìm thấy xe!"));
        return car.getBrand();
    }
}
