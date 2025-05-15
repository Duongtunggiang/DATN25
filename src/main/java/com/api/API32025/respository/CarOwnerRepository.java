package com.api.API32025.respository;

import com.api.API32025.entity.CarOwner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CarOwnerRepository extends JpaRepository<CarOwner, Long> {

    Optional<CarOwner> findByAccountId(Long accountId);
}
