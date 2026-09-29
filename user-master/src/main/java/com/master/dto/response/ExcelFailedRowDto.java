package com.master.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class ExcelFailedRowDto {
    private int rowNumber;
    private List<String> values;
    private String failureReason;
}