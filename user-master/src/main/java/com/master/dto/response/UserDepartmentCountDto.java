package com.master.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class UserDepartmentCountDto {
    private Long departmentId;
    private String departmentName;
    private Long activeCount;
    private Long inactiveCount;
}