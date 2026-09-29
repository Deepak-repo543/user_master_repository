package com.master.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserFilterRequest {
    private String search;
    private int page = 0;
    private int size = 10;
    private String sortBy = "id";
    private String direction = "asc";
    private Boolean status;
    private Long departmentId;
    private Long designationId;
    private Long roleId;
    private String branch;
    private String employeeName;
    private String fromDate;
    private String toDate;
}