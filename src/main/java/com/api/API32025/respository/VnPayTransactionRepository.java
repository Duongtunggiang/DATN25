package com.api.API32025.respository;

import com.api.API32025.entity.VnPayTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VnPayTransactionRepository extends JpaRepository<VnPayTransaction, Long> {
    Optional<VnPayTransaction> findByVnpTxnRef(String vnpTxnRef);
}

