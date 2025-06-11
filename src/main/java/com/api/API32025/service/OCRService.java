package com.api.API32025.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import com.api.API32025.entity.Profile;
import com.api.API32025.respository.ProfileRepository;
import com.api.API32025.entity.Account;
import com.api.API32025.respository.AccountRepository;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Service
public class OCRService {
    
    private final String OCR_API_URL = "http://localhost:5001/api/ocr";
    private final RestTemplate restTemplate;
    private final ProfileRepository profileRepository;
    private final AccountRepository accountRepository;

    @Autowired
    public OCRService(ProfileRepository profileRepository, AccountRepository accountRepository) {
        this.restTemplate = new RestTemplate();
        this.profileRepository = profileRepository;
        this.accountRepository = accountRepository;
    }

    public Map<String, Object> processCCCDImage(MultipartFile file, Profile profile) {
        try {
            // Chuẩn bị file để gửi đến API Python
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            
            // Tạo request body với file
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            });

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            // Gọi API Python OCR
            ResponseEntity<Map> response = restTemplate.exchange(
                OCR_API_URL,
                HttpMethod.POST,
                requestEntity,
                Map.class
            );

            Map<String, Object> ocrResult = response.getBody();
            
            if (ocrResult != null) {
                // Cập nhật thông tin từ CCCD vào profile
                if (ocrResult.get("cccd") != null) {
                    String cccdNumber = (String) ocrResult.get("cccd");
                    profile.setNationalId(cccdNumber);
                    profile.setCccdVerified(true);
                }
                
                if (ocrResult.get("name") != null) {
                    String fullName = (String) ocrResult.get("name");
                    // Tách họ và tên
                    String[] nameParts = fullName.split(" ");
                    if (nameParts.length > 1) {
                        profile.setLastName(nameParts[nameParts.length - 1]);
                        profile.setFirstName(String.join(" ", java.util.Arrays.copyOfRange(nameParts, 0, nameParts.length - 1)));
                    } else {
                        profile.setFirstName(fullName);
                    }
                }

                if (ocrResult.get("dob") != null) {
                    String dobStr = (String) ocrResult.get("dob");
                    try {
                        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
                        LocalDate dob = LocalDate.parse(dobStr, formatter);
                        profile.setDateOfBirth(dob);
                    } catch (Exception e) {
                        // Xử lý lỗi parse ngày tháng
                    }
                }

                // Cập nhật trạng thái tài khoản từ VERIFY sang ACTIVE
                Account account = profile.getAccount();
                if (account != null && account.getStatus() == Account.AccountStatus.VERIFY) {
                    account.setStatus(Account.AccountStatus.ACTIVE);
                    accountRepository.save(account);
                }
                
                profileRepository.save(profile);
            }

            return ocrResult;

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi xử lý ảnh CCCD: " + e.getMessage());
        }
    }
} 