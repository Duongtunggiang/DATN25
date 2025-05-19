package com.api.API32025.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class ImageUploadController {

    @Value("${upload.path}")
    private String uploadPath;

    @PostMapping("/avatar")
    public ResponseEntity<String> uploadAvatar(@RequestParam("file") MultipartFile file) {
        try {
            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path folderPath = Paths.get(uploadPath, "avatars");
            Files.createDirectories(folderPath);

            Path filePath = folderPath.resolve(filename);
            Files.write(filePath, file.getBytes());

            String urlPath = "/uploads/avatars/" + filename;
            return ResponseEntity.ok(urlPath);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi upload ảnh");
        }
    }
}


