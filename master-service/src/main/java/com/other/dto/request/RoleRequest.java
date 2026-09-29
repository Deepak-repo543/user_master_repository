package com.other.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RoleRequest {
    @NotNull(message = "Role name required")
    private String roleName;
}
