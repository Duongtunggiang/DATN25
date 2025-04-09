package com.api.API32025.service;

import com.api.API32025.dto.LoginDTO;
import com.api.API32025.dto.RegisterDTO;
import com.api.API32025.entity.Account;
import com.api.API32025.entity.Profile;
import com.api.API32025.entity.Role;
import com.api.API32025.respository.AccountRepository;
import com.api.API32025.respository.RoleRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AccountService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public String register(RegisterDTO registerDTO) {
        // Kiểm tra email đã tồn tại chưa
        if (accountRepository.findByEmail(registerDTO.getEmail()) != null) {
            throw new RuntimeException("Email đã tồn tại!");
        }

        // Kiểm tra mật khẩu nhập lại
        if (!registerDTO.getPassword().equals(registerDTO.getConfirmPassword())) {
            throw new RuntimeException("Mật khẩu nhập lại không khớp!");
        }

        // Tìm role
        Role role = roleRepository.findByRoleName(registerDTO.getRoleName());
        if (role == null) {
            throw new RuntimeException("Vai trò không hợp lệ!");
        }

        // Tạo tài khoản mới
        Account account = new Account();
        account.setUsername(registerDTO.getUsername());
        account.setEmail(registerDTO.getEmail());
        account.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        account.setStatus("active");
        account.setRole(role);

        // Tạo profile trống ban đầu
        Profile profile = new Profile();
        profile.setFirstName("");
        profile.setLastName("");
        profile.setDateOfBirth(null);
        profile.setNationalId("");
        profile.setDrivingLicense("");
        profile.setPhoneNumber("");
        profile.setEmail(registerDTO.getEmail());
        profile.setAvatarPath("/images/default-avatar.png"); // nếu bạn muốn có ảnh mặc định

        profile.setAccount(account);
        account.setProfile(profile);

        accountRepository.save(account);
        return "Đăng ký thành công!";
    }

    public Map<String, Object> login(LoginDTO loginDTO, HttpSession session) {
        Account account = accountRepository.findByEmail(loginDTO.getEmail());

        if (account == null || !passwordEncoder.matches(loginDTO.getPassword(), account.getPassword())) {
            throw new RuntimeException("Email hoặc mật khẩu không đúng!");
        }
        if (!account.getStatus().equals("active")) {
            throw new RuntimeException("Tài khoản của bạn đã bị vô hiệu hóa!");
        }


        // Lưu thông tin vào session
        session.setAttribute("userId", account.getId());
        session.setAttribute("username", account.getUsername());
        session.setAttribute("role", account.getRole().getRoleName());

        // Tạo response trả về
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Đăng nhập thành công!");
        response.put("user", Map.of(
                "id", account.getId(),
                "username", account.getUsername(),
                "email", account.getEmail(),
                "role", account.getRole().getRoleName()
        ));

        return response;
    }

    public void logout(HttpSession session) {
        session.invalidate();
    }


}

