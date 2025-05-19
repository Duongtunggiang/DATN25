package com.api.API32025.initializer;

import com.api.API32025.entity.Account;
import com.api.API32025.entity.Role;
import com.api.API32025.respository.AccountRepository;
import com.api.API32025.respository.RoleRepository;
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
            accountRepository.save(admin);
            System.out.println("Admin account created.");
        } else {
            System.out.println("Admin account already exists.");
        }
    }
}
