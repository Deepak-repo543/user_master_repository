package com.master.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class UserDownloadRequest {
    private LocalDate fromDate;
    private LocalDate toDate;
    private String status;
    private Long department;
    private Long designation;
    private Long branch;
    private Long role;
    private String employeeName;
    private String globalSearch;
}