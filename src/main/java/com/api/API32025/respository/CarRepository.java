package com.api.API32025.respository;


import com.api.API32025.entity.Brand;
import com.api.API32025.entity.Car;
import com.api.API32025.entity.CarOwner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CarRepository extends JpaRepository<Car, Long> {

    List<Car> findByStatus(Car.CarStatus status);
    List<Car> findByCarOwner(CarOwner carOwner);
    long countByStatus(Car.CarStatus status);
    //    List<Car> findByCarOwner(CarOwner carOwner);
    Optional<Car> findByLicensePlate(String licensePlate);

//    Car findByLicensePlate(String licensePlate);
}
