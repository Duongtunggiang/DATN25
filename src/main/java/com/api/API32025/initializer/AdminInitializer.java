package com.api.API32025.initializer;

import com.api.API32025.entity.Account;
import com.api.API32025.entity.Role;
import com.api.API32025.entity.Profile;
import com.api.API32025.respository.AccountRepository;
import com.api.API32025.respository.RoleRepository;
import com.api.API32025.respository.ProfileRepository;
import org.springframework.beans.factory.annotation.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminInitializer implements CommandLineRunner {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "admin@gmail.com";
        if (!accountRepository.existsByEmail(adminEmail)) {
            Role adminRole = roleRepository.findByRoleName("ADMIN");
            if (adminRole == null) {
                adminRole = new Role();
                adminRole.setRoleName("ADMIN");
                roleRepository.save(adminRole);
            }

            Account admin = new Account();
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("Admin12345"));
            admin.setUsername("Admin");
            admin.setRole(adminRole);
            admin.setStatus(Account.AccountStatus.ACTIVE);
            accountRepository.save(admin);

            // Tạo profile cho admin
            Profile adminProfile = new Profile();
            adminProfile.setAccount(admin);
            adminProfile.setEmail(adminEmail);
            adminProfile.setFirstName("System");
            adminProfile.setLastName("Admin");
            adminProfile.setAvatarPath("/Images/avatars/default-avatar.png");
            adminProfile.setPhoneNumber("0123456789");
            profileRepository.save(adminProfile);

            System.out.println("Admin account and profile created.");
        } else {
            Account admin = accountRepository.findByEmail(adminEmail);
            if (admin != null && profileRepository.findByAccount(admin) == null) {
                Profile adminProfile = new Profile();
                adminProfile.setAccount(admin);
                adminProfile.setFirstName("System");
                adminProfile.setLastName("Admin");
                adminProfile.setAvatarPath("/Images/avatars/default-avatar.png");
                adminProfile.setPhoneNumber("0123456789");
                profileRepository.save(adminProfile);
                System.out.println("Admin profile created for existing account.");
            } else {
                System.out.println("Admin account and profile already exist.");
            }
        }
    }
}
