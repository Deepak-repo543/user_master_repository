package com.common.service;

import com.common.util.ExcelHelper;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommonExcelService {

    private final ExcelHelper excelHelper;

    public byte[] generateExcel(String sheetName, List<String> headers, List<String> mandatoryColumns, List<List<String>> rows) throws IOException {
        Workbook workbook = excelHelper.createWorkbook(sheetName, headers, mandatoryColumns, rows);
        return excelHelper.workbookToBytes(workbook);
    }

    public byte[] generateTemplate(String sheetName, List<String> headers, List<String> mandatoryColumns, List<String> exampleData) throws IOException {
        Workbook workbook = excelHelper.createTemplateWorkbook(sheetName, headers, mandatoryColumns, exampleData);
        return excelHelper.workbookToBytes(workbook);
    }

    public byte[] generateErrorReport(String sheetName, List<String> headers, List<List<String>> rows, String failureReasonHeader) throws IOException {
        return excelHelper.createErrorReport(sheetName, headers, rows, failureReasonHeader);
    }
}