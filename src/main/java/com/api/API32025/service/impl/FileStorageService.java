package com.api.API32025.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    public String saveFile(MultipartFile file) {
        try {
            // Tạo thư mục nếu chưa có
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Tạo tên file ngẫu nhiên để tránh trùng
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(filename);

            // Lưu file
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            return "/Images/uploads/" + filename; // dùng để trả về URL frontend có thể gọi
        } catch (IOException e) {
            log.error("Lỗi khi lưu file: {}", e.getMessage());
            throw new RuntimeException("Lỗi khi lưu file");
        }
    }
}
