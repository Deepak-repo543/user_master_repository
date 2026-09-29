package com.other.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BranchRequest {
    @NotNull(message = "Branch name required")
    private String branchName;
}
