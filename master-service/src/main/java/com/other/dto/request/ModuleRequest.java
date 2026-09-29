package com.other.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ModuleRequest {
    @NotNull(message = "Module name required")
    private String moduleName;
}
