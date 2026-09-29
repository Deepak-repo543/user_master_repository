package com.other.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class AppException extends RuntimeException {
    private final int status;
    private final HttpStatus httpStatus;

    public AppException(int status, String message, HttpStatus httpStatus) {
        super(message);
        this.status = status;
        this.httpStatus = httpStatus;
    }
}