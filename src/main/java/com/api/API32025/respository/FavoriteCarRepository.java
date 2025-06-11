package com.api.API32025.respository;

import com.api.API32025.entity.*;
import com.api.API32025.entity.FavoriteCar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteCarRepository extends JpaRepository<FavoriteCar, Long> {
    Optional<FavoriteCar> findByCustomerAndCar(Customer customer, Car car);
    boolean existsByCustomerAndCar(Customer customer, Car car);
    List<FavoriteCar> findByCustomer(Customer customer);
}