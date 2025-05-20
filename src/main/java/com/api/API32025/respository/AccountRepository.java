package com.api.API32025.respository;

import com.api.API32025.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {
    Account findByEmail(String email);
//    Account findByUsername(String username);
    boolean existsByEmail (String email);
    Optional<Account> findByUsername(String username);
}
