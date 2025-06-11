package com.api.API32025.respository;

import com.api.API32025.entity.CarOwner;
import com.api.API32025.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category,Long> {
    Optional<Category> findById(Long id);
    boolean existsByName(String name);
    Optional<Category> findByName(String name);

}
