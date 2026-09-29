package com.other.exception;

import com.other.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
@SuppressWarnings("unused")
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleApp(AppException ex) {
        log.error("Business error: {}", ex.getMessage());
        return ResponseEntity.status(ex.getHttpStatus()).body(new ApiResponse<>(ex.getStatus(), ex.getMessage(), null, ex.getMessage()));
    }
}