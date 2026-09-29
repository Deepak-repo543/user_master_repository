package com.master.service;

import com.master.exceptions.AppException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Slf4j
@Service
public class FileStorageService {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    public String store(MultipartFile file, String subFolder) {
        try {
            Path uploadPath = Paths.get(uploadDir, subFolder);
            Files.createDirectories(uploadPath);
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".") ? originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
            String fileName = UUID.randomUUID() + extension;
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);
            return subFolder + "/" + fileName;
        } catch (IOException e) {
            log.error("File storage failed", e);
            throw new AppException(500, "Failed to store file", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}