package com.api.API32025.respository;

import com.api.API32025.entity.Car;
import com.api.API32025.entity.CarDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CarDetailRepository extends JpaRepository<CarDetail, Long> {
    Optional<CarDetail> findByCar(Car car);
}
