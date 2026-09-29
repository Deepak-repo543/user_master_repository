package com.master.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeeResponseDto {
    private Long id;
    private String employeeCode;
    private String fullName;
    private String email;
    private String mobile;
}