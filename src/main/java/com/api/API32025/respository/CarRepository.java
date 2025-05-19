package com.api.API32025.respository;


import com.api.API32025.entity.Car;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CarRepository extends JpaRepository<Car, Long> {

    List<Car> findByStatus(String status);

    //    List<Car> findByCarOwner(CarOwner carOwner);
    Optional<Car> findByLicensePlate(String licensePlate);


    // Tìm xe theo License Plate
//    Car findByLicensePlate(String licensePlate);
}
