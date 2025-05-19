package com.api.API32025.respository;

import com.api.API32025.entity.Brand;
import com.api.API32025.entity.CarOwner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BrandRepository extends JpaRepository<Brand, Long> {
    List<Brand> findByCarOwner(CarOwner carOwner);
}
