package com.master.exceptions;

import com.master.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSourceResolvable;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Slf4j
@RestControllerAdvice
@SuppressWarnings("unused")
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleApp(AppException ex) {
        log.error("Business error: {}", ex.getMessage());
        return ResponseEntity.status(ex.getHttpStatus()).body(new ApiResponse<>(ex.getStatus(), ex.getMessage(), null, ex.getMessage()));
    }

    @ExceptionHandler(AuthorizationDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuthorizationDenied(AuthorizationDeniedException ex) {
        log.warn("Authorization denied: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ApiResponse<>(403, "Access Denied", null, "You do not have permission to perform this action"));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValid(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(fieldError -> errors.putIfAbsent(fieldError.getField(), fieldError.getDefaultMessage()));
        log.error("Validation failed: {}", errors);
        String message = errors.values().stream().filter(Objects::nonNull).findFirst().orElse("Validation failed");
        return ResponseEntity.badRequest().body(new ApiResponse<>(400, message, null, errors));
    }

    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<ApiResponse<Void>> handleMethodValidation(HandlerMethodValidationException ex) {
        String message = ex.getParameterValidationResults().stream().flatMap(result -> result.getResolvableErrors().stream()).map(MessageSourceResolvable::getDefaultMessage).filter(Objects::nonNull).findFirst().orElse("Validation failed");
        log.error("Method validation failed: {}", message);
        return ResponseEntity.badRequest().body(new ApiResponse<>(400, message, null, null));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Void>> handleMaxSize(MaxUploadSizeExceededException ex) {
        log.warn("File upload size exceeded");
        return ResponseEntity.status(HttpStatus.CONTENT_TOO_LARGE).body(new ApiResponse<>(413, "File size exceeds allowed limit", null, null));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrity(DataIntegrityViolationException ex) {
        String rootMessage = ex.getMostSpecificCause().getMessage();
        String message = "Duplicate entry. Please check the values you entered.";
        if (rootMessage != null) {
            String lower = rootMessage.toLowerCase();
            if (lower.contains("user_id") || lower.contains("userid") || lower.contains("user id")) {
                message = "User ID already exists. Please choose a different User ID.";
            } else if (lower.contains("email")) {
                message = "Email already exists. Please use a different email.";
            } else if (lower.contains("mobile_number") || lower.contains("mobile")) {
                message = "Mobile number already exists.";
            } else if (lower.contains("employee_code") || lower.contains("employee code")) {
                message = "Employee code already exists.";
            } else if (lower.contains("employee_id") || lower.contains("employee id")) {
                message = "Employee ID already exists.";
            }
        }
        log.warn("Data integrity violation: {}", rootMessage);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ApiResponse<>(409, message, null, rootMessage));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleUnknown(Exception ex) {
        log.error("Unexpected error", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(500, "Internal server error", null, ex.getMessage()));
    }
}