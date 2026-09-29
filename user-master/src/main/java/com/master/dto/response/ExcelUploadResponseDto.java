package com.master.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class ExcelUploadResponseDto {
    private int totalRows;
    private int successCount;
    private int failureCount;
    private List<String> errors;
    private List<String> successfulEmployeeCodes;
}