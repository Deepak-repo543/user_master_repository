package com.master.dto.request;

import com.fasterxml.jackson.annotation.JsonSetter;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UserRequestDto {
    private Long id;
    @NotBlank(message = "User ID is required")
    @Size(max = 50, message = "User ID must not exceed 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9]+$", message = "User ID must contain only letters and numbers")
    private String userId;
    @NotNull(message = "Employee is required")
    private Long employeeId;
    @NotBlank(message = "Employee code is required")
    @Size(max = 20, message = "Employee code must not exceed 20 characters")
    @Pattern(regexp = "^[a-zA-Z0-9]+$", message = "Employee code must contain only letters and numbers")
    private String employeeCode;
    @NotBlank(message = "Full name is required")
    @Size(max = 150, message = "Full name must not exceed 150 characters")
    private String fullName;
    @NotBlank(message = "Email is required")
    @Pattern(regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$", message = "Invalid email format")
    @Size(max = 150, message = "Email must not exceed 150 characters")
    private String email;
    @NotBlank(message = "Mobile number is required")
    @Size(min = 10, max = 10, message = "Mobile number must be 10 digits")
    @Pattern(regexp = "^[6-9][0-9]*$", message = "Mobile number must start with 6, 7, 8 or 9")
    private String mobileNumber;
    @NotNull(message = "Department is required")
    private Long departmentId;
    @NotNull(message = "Designation is required")
    private Long designationId;
    @NotEmpty(message = "At least one branch is required")
    private List<Long> branchIds;
    @NotNull(message = "Role is required")
    private Long roleId;
    private Long reportingManager;
    @Size(max = 100, message = "Dashboard must not exceed 100 characters")
    private String dashboard;
    private List<Long> accessibleModules;
    @NotBlank(message = "Language is required")
    @Size(max = 20, message = "Language must not exceed 20 characters")
    @Pattern(regexp = "^(English|Arabic|Hindi)$", message = "Language must be English, Arabic or Hindi")
    private String language;
    @Size(max = 50, message = "Time zone must not exceed 50 characters")
    private String timeZone;
    @NotBlank(message = "Login type is required")
    @Size(max = 20, message = "Login type must not exceed 20 characters")
    @Pattern(regexp = "^(Password|SSO|LDAP)$", message = "Login type must be Password, SSO or LDAP")
    private String loginType;
    @Min(value = 0, message = "Password expiry cannot be negative")
    @Max(value = 3, message = "Password expiry must not exceed 3 Days")
    private Integer passwordExpiry;
    private Boolean twoFactorAuthentication;
    @Size(max = 1000, message = "Remarks must not exceed 1000 characters")
    private String remarks;
    private boolean status;

    @JsonSetter
    public void setUserId(String userId) {
        this.userId = userId != null ? userId.trim() : null;
    }

    @JsonSetter
    public void setEmployeeCode(String employeeCode) {
        this.employeeCode = employeeCode != null ? employeeCode.trim() : null;
    }

    @JsonSetter
    public void setFullName(String fullName) {
        this.fullName = fullName != null ? fullName.trim() : null;
    }

    @JsonSetter
    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber != null ? mobileNumber.trim() : null;
    }

    @JsonSetter
    public void setEmail(String email) {
        this.email = email != null ? email.trim() : null;
    }

    @JsonSetter
    public void setDashboard(String dashboard) {
        this.dashboard = dashboard != null ? dashboard.trim() : null;
    }

    @JsonSetter
    public void setTimeZone(String timeZone) {
        this.timeZone = timeZone != null ? timeZone.trim() : null;
    }

    @JsonSetter
    public void setRemarks(String remarks) {
        this.remarks = remarks != null ? remarks.trim() : null;
    }
}