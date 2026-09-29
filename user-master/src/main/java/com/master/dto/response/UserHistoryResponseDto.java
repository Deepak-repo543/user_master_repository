package com.master.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class UserHistoryResponseDto {
    private Long id;
    private Long userId;
    private String employeeCode;
    private String action;
    private String performedBy;
    private String performedByRole;
    private LocalDateTime performedAt;
    private String oldData;
    private String newData;
}