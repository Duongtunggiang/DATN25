package com.api.API32025.respository;

import com.api.API32025.entity.Account;
import com.api.API32025.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByAccount(Account account);
    Optional<Customer> findByAccountId(Long accountId);

}
