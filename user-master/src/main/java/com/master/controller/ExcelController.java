package com.master.controller;

import com.master.dto.ApiResponse;
import com.master.dto.request.UserDownloadRequest;
import com.master.dto.request.UserFilterRequest;
import com.master.dto.response.ExcelPreviewResponseDto;
import com.master.dto.response.ExcelUploadResponseDto;
import com.master.service.UserExcelService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class ExcelController {

    private final UserExcelService userExcelService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ExcelUploadResponseDto>> uploadExcel(@RequestParam("file") MultipartFile file) {
        return userExcelService.uploadExcel(file);
    }

    @PostMapping(value = "/preview-upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ExcelPreviewResponseDto>> previewExcel(@RequestParam("file") MultipartFile file) {
        return userExcelService.previewExcel(file);
    }

    @GetMapping("/download-template")
    public ResponseEntity<InputStreamResource> downloadTemplate() {
        return userExcelService.downloadTemplate();
    }

    @GetMapping("/download")
    public ResponseEntity<?> downloadExcel(UserFilterRequest filter) {
        return userExcelService.downloadExcel(filter);
    }

    @PostMapping("/download/email")
    public ResponseEntity<?> downloadExcelByEmail(@RequestBody UserDownloadRequest request) {
        return userExcelService.sendExcelByEmail(request);
    }

    @GetMapping("/export/{id}/download")
    public ResponseEntity<?> downloadExportFile(@PathVariable Long id) {
        return userExcelService.downloadExportFile(id);
    }
}