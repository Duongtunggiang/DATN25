package com.api.API32025.respository;

import com.api.API32025.entity.Car;
import com.api.API32025.entity.CarOwner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CarRepository extends JpaRepository<Car, Long> {

    // Tìm xe của một CarOwner
    List<Car> findByCarOwner(CarOwner carOwner);

    // Tìm xe theo License Plate
    Car findByLicensePlate(String licensePlate);
}
