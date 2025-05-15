package com.api.API32025.service;

import com.api.API32025.dto.ChangePasswordDTO;
import com.api.API32025.dto.LoginDTO;
import com.api.API32025.dto.RegisterDTO;
import com.api.API32025.entity.*;
import com.api.API32025.jwt.JwtUtil;
import com.api.API32025.respository.AccountRepository;
import com.api.API32025.respository.CarOwnerRepository;
import com.api.API32025.respository.CustomerRepository;
import com.api.API32025.respository.RoleRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AccountService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private CarOwnerRepository carOwnerRepository;

    @Autowired
    private CustomerRepository customerRepository;

    public String register(RegisterDTO registerDTO) {
        if (accountRepository.findByEmail(registerDTO.getEmail()) != null) {
            throw new RuntimeException("Email đã tồn tại!");
        }

        if (!registerDTO.getPassword().equals(registerDTO.getConfirmPassword())) {
            throw new RuntimeException("Mật khẩu nhập lại không khớp!");
        }

        Role role = roleRepository.findByRoleName(registerDTO.getRoleName());
        if (role == null) {
            throw new RuntimeException("Vai trò không hợp lệ!");
        }

        Account account = new Account();
        account.setUsername(registerDTO.getUsername());
        account.setEmail(registerDTO.getEmail());
        account.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        account.setStatus("active");
        account.setRole(role);

        // Tạo profile mặc định
        Profile profile = new Profile();
        profile.setFirstName("");
        profile.setLastName("");
        profile.setDateOfBirth(null);
        profile.setNationalId(null);
        profile.setDrivingLicense(null);
        profile.setPhoneNumber("");
        profile.setEmail(registerDTO.getEmail());
        profile.setAvatarPath("/Images/avatars/default-avatar.png");
        profile.setAccount(account);
        account.setProfile(profile);

        // Lưu Account trước (để có ID)
        Account savedAccount = accountRepository.save(account);

        // Nếu là CHỦ XE
        if ("CAROWNER".equals(role.getRoleName())) {
            CarOwner carOwner = new CarOwner();
            carOwner.setAccount(savedAccount);
            carOwnerRepository.save(carOwner);

            savedAccount.setCarOwner(carOwner);
            accountRepository.save(savedAccount);
        }

        // Nếu là KHÁCH HÀNG
        if ("CUSTOMER".equals(role.getRoleName())) {
            Customer customer = new Customer();
            customer.setAccount(savedAccount);
            customerRepository.save(customer);

            savedAccount.setCustomer(customer);
            accountRepository.save(savedAccount);
        }

        return "Đăng ký thành công!";
    }


    public Map<String, Object> login(LoginDTO loginDTO) {
        Account account = accountRepository.findByEmail(loginDTO.getEmail());

        if (account == null || !passwordEncoder.matches(loginDTO.getPassword(), account.getPassword())) {
            throw new RuntimeException("Email hoặc mật khẩu không đúng!");
        }
        if (!account.getStatus().equals("active")) {
            throw new RuntimeException("Tài khoản của bạn đã bị vô hiệu hóa!");
        }

        String token = jwtUtil.generateToken(account);

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", Map.of(
                "id", account.getId(),
                "username", account.getUsername(),
                "email", account.getEmail(),
                "roles", List.of(account.getRole().getRoleName()) // đảm bảo frontend có .includes("CUSTOMER")
        ));

        return response;
    }


    public void logout(HttpSession session) {
        session.invalidate();
    }
    public void changePassword(ChangePasswordDTO changePasswordDTO) {
        // Lấy tài khoản hiện tại từ SecurityContext
        Account account = (Account) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // Kiểm tra mật khẩu cũ có đúng không
        if (!passwordEncoder.matches(changePasswordDTO.getOldPassword(), account.getPassword())) {
            throw new RuntimeException("Mật khẩu cũ không đúng!");
        }

        // Kiểm tra mật khẩu mới và xác nhận mật khẩu mới có khớp không
        if (!changePasswordDTO.getNewPassword().equals(changePasswordDTO.getConfirmPassword())) {
            throw new RuntimeException("Mật khẩu mới và xác nhận mật khẩu không khớp!");
        }

        // Cập nhật mật khẩu mới
        account.setPassword(passwordEncoder.encode(changePasswordDTO.getNewPassword()));
        accountRepository.save(account);

        SecurityContextHolder.clearContext(); // log out
    }

}

