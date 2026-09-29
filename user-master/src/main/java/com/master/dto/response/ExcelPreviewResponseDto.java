package com.master.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class ExcelPreviewResponseDto {
    private int totalRows;
    private int validCount;
    private int invalidCount;
    private int duplicateCount;
    private List<ExcelRowResultDto> rows;
}