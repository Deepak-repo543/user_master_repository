package com.master.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserSearchRequestDto {
    private String search;
    private Boolean status;
    private Long departmentId;
    private Long designationId;
    private Long roleId;
    private String employeeName;
    private String branch;
    private Integer page = 0;
    private Integer size = 10;
    private String sortBy = "id";
    private String direction = "asc";
    private String fromDate;
    private String toDate;
}