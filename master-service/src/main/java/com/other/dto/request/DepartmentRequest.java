package com.other.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DepartmentRequest {
    @NotNull(message = "Department name required")
    private String departmentName;
}
