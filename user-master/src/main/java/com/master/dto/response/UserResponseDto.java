package com.master.dto.response;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@ToString
public class UserResponseDto {
    private Long id;
    private String userId;
    private Long employeeId;
    private String employeeCode;
    private String fullName;
    private String email;
    private String mobileNumber;
    private Long departmentId;
    private Long designationId;
    private String departmentName;
    private String designationName;
    private List<Long> branchIds;
    private List<String> branchNames;
    private Long roleId;
    private String roleName;
    private Long reportingManager;
    private String dashboard;
    private List<Long> accessibleModules;
    private List<String> moduleNames;
    private String language;
    private String timeZone;
    private String loginType;
    private Integer passwordExpiry;
    private String profileImageOriginalName;
    private String digitalSignatureOriginalName;
    private Boolean twoFactorAuthentication;
    private String profileImage;
    private String digitalSignature;
    private String remarks;
    private Boolean status;
    private String createdBy;
    private LocalDateTime createdAt;
    private String updatedBy;
    private LocalDateTime updatedAt;
}