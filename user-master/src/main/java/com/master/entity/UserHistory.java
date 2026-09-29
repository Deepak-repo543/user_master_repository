package com.master.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_history")
@Getter
@Setter
public class UserHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;
    @Column(length = 20, nullable = false)
    private String employeeCode;
    @Column(length = 30, nullable = false)
    private String action;
    @Column(length = 150)
    private String performedBy;
    @Column(length = 50)
    private String performedByRole;
    @Column(nullable = false)
    private LocalDateTime performedAt;
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private String newData;
}