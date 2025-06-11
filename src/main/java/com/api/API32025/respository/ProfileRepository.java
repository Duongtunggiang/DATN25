package com.api.API32025.respository;

import com.api.API32025.entity.Account;
import com.api.API32025.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, Long> {
    Profile findByAccount(Account account);

    boolean existsByNationalIdAndAccountIdNot(String nationalId, Long accountId);
}
