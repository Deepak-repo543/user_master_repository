package com.master.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeeRequestDto {
    @NotBlank(message = "Employee Code is required")
    @Size(max = 20, message = "Employee Code must not exceed 20 characters")
    @Pattern(regexp = "^[a-zA-Z0-9]+$", message = "Employee Code must be alphanumeric without spaces")
    private String employeeCode;
    @NotBlank(message = "Full Name is required")
    @Size(max = 150, message = "Full Name must not exceed 150 characters")
    private String fullName;
    @Email(message = "Invalid email format")
    @Size(max = 150, message = "Email must not exceed 150 characters")
    private String email;
    @Pattern(regexp = "^[6-9][0-9]{9,14}$", message = "Mobile must start with 6, 7, 8 or 9")
    private String mobile;
}