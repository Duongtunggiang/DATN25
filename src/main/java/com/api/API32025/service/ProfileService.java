package com.api.API32025.service;

import com.api.API32025.dto.ProfileDTO;
import com.api.API32025.entity.Account;
import com.api.API32025.entity.Profile;
import com.api.API32025.respository.AccountRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Service
public class ProfileService {

    @Autowired
    private AccountRepository accountRepository;

    public void updateProfile(Long accountId, ProfileDTO profileDTO) {
        Optional<Account> optionalAccount = accountRepository.findById(accountId);
        if (optionalAccount.isEmpty()) {
            throw new RuntimeException("Tài khoản không tồn tại!");
        }

        Account account = optionalAccount.get();
        Profile profile = account.getProfile();
        if (profile == null) {
            profile = new Profile();
            profile.setAccount(account);
            account.setProfile(profile);
        }

        profile.setFirstName(profileDTO.getFirstName());
        profile.setLastName(profileDTO.getLastName());

        if (profileDTO.getDateOfBirth() != null && !profileDTO.getDateOfBirth().isEmpty()) {
            profile.setDateOfBirth(LocalDate.parse(profileDTO.getDateOfBirth())); // yyyy-MM-dd
        }


        profile.setNationalId(profileDTO.getNationalId());
        profile.setDrivingLicense(profileDTO.getDrivingLicense());
        profile.setPhoneNumber(profileDTO.getPhoneNumber());
        profile.setAvatarPath(profileDTO.getAvatarPath());

        accountRepository.save(account);
    }
    @Transactional
    public ProfileDTO getProfileByAccountId(Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

        Profile profile = account.getProfile();
        if (profile == null) return null;

        ProfileDTO dto = new ProfileDTO();
        dto.setFirstName(profile.getFirstName());
        dto.setLastName(profile.getLastName());
        if (profile.getDateOfBirth() != null) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
            dto.setDateOfBirth(profile.getDateOfBirth().format(formatter));
        } else {
            dto.setDateOfBirth(null);
        }
        dto.setNationalId(profile.getNationalId());
        dto.setDrivingLicense(profile.getDrivingLicense());
        dto.setPhoneNumber(profile.getPhoneNumber());
        dto.setAvatarPath(profile.getAvatarPath());
        dto.setRole(account.getRole().getRoleName());


        dto.setEmail(profile.getEmail());
        dto.setUsername(profile.getAccount().getUsername());


        return dto;
    }
}

