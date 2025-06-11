package com.api.API32025.service;

import com.api.API32025.dto.auth.ProfileDTO;
import com.api.API32025.entity.Account;
import com.api.API32025.entity.Profile;
import com.api.API32025.entity.Province;
import com.api.API32025.respository.AccountRepository;
import com.api.API32025.respository.ProfileRepository;
import com.api.API32025.respository.ProvinceRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class ProfileService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private ProvinceRepository provinceRepository;

    public List<Province> getAllProvinces() {
        return provinceRepository.findAllByOrderByNameAsc();
    }

    public void updateProfileInfo(Long accountId, ProfileDTO profileDTO) {
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
            try {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
                LocalDate dateOfBirth = LocalDate.parse(profileDTO.getDateOfBirth(), formatter);
                profile.setDateOfBirth(dateOfBirth);
            } catch (Exception e) {
                throw new RuntimeException("Định dạng ngày sinh không hợp lệ. Vui lòng sử dụng định dạng dd-MM-yyyy");
            }
        }

        profile.setNationalId(profileDTO.getNationalId());
        profile.setDrivingLicense(profileDTO.getDrivingLicense());
        profile.setPhoneNumber(profileDTO.getPhoneNumber());
        profile.setAddress(profileDTO.getAddress());

        if (profileDTO.getProvinceCode() != null) {
            Optional<Province> province = provinceRepository.findById(profileDTO.getProvinceCode());
            province.ifPresent(profile::setProvince);
        }

        accountRepository.save(account);
    }

    public void updateAvatar(Long accountId, String avatarPath) {
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

        profile.setAvatarPath(avatarPath);
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
        dto.setAddress(profile.getAddress());
        
        if (profile.getProvince() != null) {
            dto.setProvinceCode(profile.getProvince().getCode());
            dto.setProvinceName(profile.getProvince().getName());
        }

        return dto;
    }

    public boolean isNationalIdExistForOtherAccount(String nationalId, Long currentAccountId) {
        return profileRepository.existsByNationalIdAndAccountIdNot(nationalId, currentAccountId);
    }

    public Account.AccountStatus getAccountStatusByProfileId(Long profileId) {
        Profile profile = profileRepository.findById(profileId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy profile"));
        return profile.getAccount().getStatus();
    }

}

