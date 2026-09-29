package com.other.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeeRequest {
    @NotNull(message = "Employee code required")
    private String employeeCode;
    @NotNull(message = "Full name required")
    private String fullName;
    @NotNull(message = "Email is required")
    private String email;
    @NotNull(message = "Mobile number is required")
    private String mobile;
}
