package com.api.API32025.respository;

import com.api.API32025.entity.Car;
import com.api.API32025.entity.Car_images;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CarImgRepository extends JpaRepository<Car_images, Long> {
    List<Car_images> findByCar (Car car);
}
