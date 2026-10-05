package com.master.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExcelRowResultDto {
    private int rowNumber;
    private String userId;
    private Long employeeId;
    private String employeeCode;
    private String fullName;
    private String email;
    private String mobileNumber;
    private String departmentName;
    private String designationName;
    private String branchIds;
    private String roleName;
    private Long reportingManager;
    private String language;
    private String timeZone;
    private String loginType;
    private Integer passwordExpiry;
    private Boolean twoFactorAuthentication;
    private String remarks;
    private String dashboard;
    private String accessibleModules;
    private String validationStatus;
    private String result;
    private String message;
    private boolean status;
}