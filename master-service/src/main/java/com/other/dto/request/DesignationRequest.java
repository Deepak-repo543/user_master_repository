package com.other.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DesignationRequest {
    @NotNull(message = "Designation name required")
    private String designationName;
}
