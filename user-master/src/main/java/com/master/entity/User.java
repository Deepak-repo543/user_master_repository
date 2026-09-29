package com.master.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;


import java.time.LocalDateTime;
import java.util.List;

@EntityListeners(AuditingEntityListener.class)
@Entity
@Table(name = "user_master")
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(length = 50, nullable = false, unique = true)
    private String userId;
    @Column(nullable = false, unique = true)
    private Long employeeId;
    @Column(length = 20, nullable = false, unique = true)
    private String employeeCode;
    @Column(length = 150, nullable = false, unique = true)
    private String email;
    @Column(length = 15, nullable = false, unique = true)
    private String mobileNumber;
    @Column(length = 150, nullable = false)
    private String fullName;
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json", nullable = false)
    private List<Long> branchIds;
    private Long reportingManager;
    @Column(length = 100)
    private String Dashboard;
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private List<Long> accessibleModules;
    @Column(length = 20)
    private String language;
    private String profileImage;
    private String digitalSignature;
    private String profileImageOriginalName;
    private String digitalSignatureOriginalName;
    @Column(length = 50)
    private String timeZone;
    @Column(length = 20, nullable = false)
    private String loginType;
    private String password;
    private Integer passwordExpiry;
    private Boolean twoFactorAuthentication;
    @Column(columnDefinition = "text")
    private String remarks;
    private LocalDateTime lastLogin;
    private Integer loginAttempt;
    private Boolean isLocked;
    private boolean status;
    @CreatedBy
    private String createdBy;
    @CreationTimestamp
    private LocalDateTime createdAt;
    @LastModifiedBy
    private String updatedBy;
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    private boolean isDeleted;
    private Long departmentId;
    private Long designationId;
    private Long roleId;
}
