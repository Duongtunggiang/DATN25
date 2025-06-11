package com.api.API32025.service;

import com.api.API32025.controller.car.SegmentController;
import com.api.API32025.dto.auth.ChangePasswordDTO;
import com.api.API32025.dto.auth.LoginDTO;
import com.api.API32025.dto.auth.RegisterDTO;
import com.api.API32025.entity.*;
import com.api.API32025.jwt.JwtUtil;
import com.api.API32025.respository.*;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

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

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private JavaMailSender mailSender;

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
        account.setStatus(Account.AccountStatus.PENDING);
        account.setRole(role);

        // Tạo verification token
        String token = UUID.randomUUID().toString();
        account.setVerificationToken(token);
        account.setVerificationTokenExpiry(LocalDateTime.now().plusHours(24)); // Token hết hạn sau 24h

        Profile profile = new Profile();
        profile.setFirstName(account.getUsername());
        profile.setLastName("");
        profile.setDateOfBirth(null);
        profile.setNationalId(null);
        profile.setDrivingLicense(null);
        profile.setPhoneNumber("");
        profile.setEmail(registerDTO.getEmail());
        profile.setAvatarPath("/Images/avatars/default-avatar.png");
        profile.setAccount(account);
        account.setProfile(profile);

        Wallet wallet = new Wallet();
        wallet.setAccount(account);
        wallet.setBalance(0);
        wallet.setCurrency("VND");
        wallet.setStatus("ACTIVE");
        wallet.setCreatedAt(LocalDateTime.now());

        Transaction transaction = new Transaction();
        transaction.setWallet(wallet);
        transaction.setAmount(0);
        transaction.setType(null);
        transaction.setTransactionTime(LocalDateTime.now());
        transaction.setDescription("Khởi tạo ví khi đăng ký tài khoản");

        wallet.getTransactions().add(transaction);
        account.setWallet(wallet);

        Account savedAccount = accountRepository.save(account);

        if ("CAROWNER".equals(role.getRoleName())) {
            CarOwner carOwner = new CarOwner();
            carOwner.setAccount(savedAccount);
            carOwnerRepository.save(carOwner);
            savedAccount.setCarOwner(carOwner);
            accountRepository.save(savedAccount);
        }

        if ("CUSTOMER".equals(role.getRoleName())) {
            Customer customer = new Customer();
            customer.setAccount(savedAccount);
            customerRepository.save(customer);
            savedAccount.setCustomer(customer);
            accountRepository.save(savedAccount);
        }

        // Gửi email xác thực
        sendVerificationEmail(savedAccount.getEmail(), token);

        return "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.";
    }

    private void sendVerificationEmail(String email, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(email);
            helper.setSubject("Xác thực tài khoản của bạn");

            String verificationLink = "http://localhost:8080/api/auth/verify?token=" + token;
            String emailContent = String.format(
                "<div style='font-family: Arial, sans-serif;'>" +
                "<h2>Xác thực tài khoản của bạn</h2>" +
                "<p>Cảm ơn bạn đã đăng ký! Để hoàn tất quá trình đăng ký, vui lòng nhấp vào liên kết dưới đây:</p>" +
                "<p>Link xác thực: <a href='%s'>%s</a></p>" +
                "<p>Hoặc copy link sau và paste vào trình duyệt: %s</p>" +
                "<p>Liên kết này sẽ hết hạn sau 24 giờ.</p>" +
                "<p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>" +
                "</div>",
                verificationLink, verificationLink, verificationLink
            );

            helper.setText(emailContent, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Không thể gửi email xác thực: " + e.getMessage());
        }
    }

    public String verifyAccount(String token) {
        Account account = accountRepository.findByVerificationToken(token)
            .orElseThrow(() -> new RuntimeException("Token không hợp lệ!"));

        if (account.getVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token đã hết hạn!");
        }

        if (account.getStatus() == Account.AccountStatus.ACTIVE || 
            account.getStatus() == Account.AccountStatus.VERIFY) {
            throw new RuntimeException("Tài khoản đã được xác thực!");
        }

        account.setStatus(Account.AccountStatus.VERIFY);
        account.setVerificationToken(null);
        account.setVerificationTokenExpiry(null);
        accountRepository.save(account);

        return "Xác thực email thành công! Vui lòng xác thực CCCD để kích hoạt đầy đủ tính năng.";
    }

    public Map<String, Object> login(LoginDTO loginDTO) {
        Account account = accountRepository.findByEmail(loginDTO.getEmail());

        if (account == null || !passwordEncoder.matches(loginDTO.getPassword(), account.getPassword())) {
            throw new RuntimeException("Email hoặc mật khẩu không đúng!");
        }

        if (account.getStatus() == Account.AccountStatus.PENDING) {
            throw new RuntimeException("Tài khoản chưa được xác thực! Vui lòng kiểm tra email để xác thực.");
        }

        if (account.getStatus() == Account.AccountStatus.BLOCK) {
            throw new RuntimeException("Tài khoản của bạn đã bị khóa!");
        }

        // Cho phép đăng nhập với cả VERIFY và ACTIVE
        if (account.getStatus() != Account.AccountStatus.VERIFY && 
            account.getStatus() != Account.AccountStatus.ACTIVE) {
            throw new RuntimeException("Trạng thái tài khoản không hợp lệ!");
        }

        String token = jwtUtil.generateToken(account);

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", Map.of(
                "id", account.getId(),
                "username", account.getUsername(),
                "email", account.getEmail(),
                "roles", List.of(account.getRole().getRoleName())
        ));

        return response;
    }

    public void logout(HttpSession session) {
        session.invalidate();
    }
    public void changePassword(ChangePasswordDTO changePasswordDTO) {
        Account account = (Account) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (!passwordEncoder.matches(changePasswordDTO.getOldPassword(), account.getPassword())) {
            throw new RuntimeException("Mật khẩu cũ không đúng!");
        }

        if (!changePasswordDTO.getNewPassword().equals(changePasswordDTO.getConfirmPassword())) {
            throw new RuntimeException("Mật khẩu mới và xác nhận mật khẩu không khớp!");
        }

        account.setPassword(passwordEncoder.encode(changePasswordDTO.getNewPassword()));
        accountRepository.save(account);

        SecurityContextHolder.clearContext();
    }

    public Account getAccountById(Long id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));
    }

    public void checkAccountStatus(Account account) {
        if (account == null) {
            throw new RuntimeException("Tài khoản không tồn tại!");
        }

        if (account.getStatus() == Account.AccountStatus.BLOCK) {
            throw new RuntimeException("Tài khoản của bạn đã bị khóa bởi Admin");
        }

        if (account.getStatus() != Account.AccountStatus.ACTIVE) {
            throw new RuntimeException("Tài khoản của bạn chưa được kích hoạt. Vui lòng xác thực tài khoản để sử dụng dịch vụ.");
        }
    }
}

