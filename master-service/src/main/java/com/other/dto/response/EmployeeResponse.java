package com.other.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeeResponse {
    private Long id;
    private String employeeCode;
    private String fullName;
    private String email;
    private String mobile;
}