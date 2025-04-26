package com.api.API32025.respository;

import com.api.API32025.entity.Account;
import com.api.API32025.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {

    Optional<Wallet> findByAccount(Account account);
}

