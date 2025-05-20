package com.api.API32025.respository;

import com.api.API32025.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfileRepository extends JpaRepository<Profile, Long> {
    boolean existsByNationalIdAndAccountIdNot(String nationalId, Long accountId);

}
