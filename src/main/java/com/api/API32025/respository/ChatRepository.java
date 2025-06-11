package com.api.API32025.respository;

import com.api.API32025.entity.CarOwner;
import com.api.API32025.entity.Chat;
import com.api.API32025.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {

    // Tìm chat giữa 1 customer và 1 carOwner
    Optional<Chat> findByCustomerAndCarOwner(Customer customer, CarOwner carOwner);

    // Tìm tất cả cuộc chat của một customer
    List<Chat> findByCustomer(Customer customer);

    // Tìm tất cả cuộc chat của một carOwner
    List<Chat> findByCarOwner(CarOwner carOwner);
}
