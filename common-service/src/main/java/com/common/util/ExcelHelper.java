package com.common.util;

import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Component("commonExcelHelper")
public class ExcelHelper {

    public Workbook createWorkbook(String sheetName, List<String> headers, List<String> mandatoryColumns, List<List<String>> rows) {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet(sheetName != null && !sheetName.isBlank() ? sheetName : "Sheet1");
        CellStyle mandatoryStyle = createMandatoryStyle(workbook);
        CellStyle optionalStyle = createOptionalStyle(workbook);
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle dataStyle = createDataStyle(workbook);
        Row labelRow = sheet.createRow(0);
        Row headerRow = sheet.createRow(1);
        for (int i = 0; i < headers.size(); i++) {
            String header = headers.get(i);
            boolean mandatory = mandatoryColumns != null && mandatoryColumns.stream().anyMatch(column -> column.equalsIgnoreCase(header));
            Cell labelCell = labelRow.createCell(i);
            labelCell.setCellValue(mandatory ? "MANDATORY" : "OPTIONAL");
            labelCell.setCellStyle(mandatory ? mandatoryStyle : optionalStyle);
            Cell headerCell = headerRow.createCell(i);
            headerCell.setCellValue(header);
            headerCell.setCellStyle(headerStyle);
        }

        int rowIndex = 2;
        if (rows != null) {
            for (List<String> values : rows) {
                Row row = sheet.createRow(rowIndex++);
                for (int i = 0; i < headers.size(); i++) {
                    String value = "";
                    if (values != null && i < values.size() && values.get(i) != null && !values.get(i).isBlank())
                        value = values.get(i);
                    else value = "N/A";
                    setCell(row, i, value, dataStyle);
                }
            }
        }
        sheet.createFreezePane(0, 2);
        if (rowIndex > 2) sheet.setAutoFilter(new CellRangeAddress(1, rowIndex - 1, 0, headers.size() - 1));
        autoSizeColumns(sheet, headers.size());
        sheet.setDefaultRowHeightInPoints(22);
        return workbook;
    }

    public Workbook createTemplateWorkbook(String sheetName, List<String> headers, List<String> mandatoryColumns, List<String> exampleData) {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet(sheetName != null && !sheetName.isBlank() ? sheetName : "Sheet1");
        CellStyle mandatoryStyle = createMandatoryStyle(workbook);
        CellStyle optionalStyle = createOptionalStyle(workbook);
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle exampleStyle = createExampleStyle(workbook);
        Row labelRow = sheet.createRow(0);
        Row headerRow = sheet.createRow(1);
        Row exampleRow = sheet.createRow(2);
        for (int i = 0; i < headers.size(); i++) {
            String header = headers.get(i);
            boolean mandatory = mandatoryColumns != null && mandatoryColumns.stream().anyMatch(column -> column.equalsIgnoreCase(header));
            Cell labelCell = labelRow.createCell(i);
            labelCell.setCellValue(mandatory ? "MANDATORY" : "OPTIONAL");
            labelCell.setCellStyle(mandatory ? mandatoryStyle : optionalStyle);
            Cell headerCell = headerRow.createCell(i);
            headerCell.setCellValue(header);
            headerCell.setCellStyle(headerStyle);
            String example = exampleData != null && i < exampleData.size() && exampleData.get(i) != null ? exampleData.get(i) : "N/A";
            Cell exampleCell = exampleRow.createCell(i);
            exampleCell.setCellValue(example);
            exampleCell.setCellStyle(exampleStyle);
        }
        sheet.createFreezePane(0, 3);
        sheet.setAutoFilter(new CellRangeAddress(1, 2, 0, headers.size() - 1));
        autoSizeColumns(sheet, headers.size());
        sheet.setDefaultRowHeightInPoints(22);
        return workbook;
    }

    public byte[] createErrorReport(String sheetName, List<String> headers, List<List<String>> rows, String failureReasonHeader) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet(sheetName != null && !sheetName.isBlank() ? sheetName : "Failed Rows");
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle dataStyle = createDataStyle(workbook);
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.size(); i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers.get(i));
            cell.setCellStyle(headerStyle);
        }
        int rowIndex = 1;
        if (rows != null) {
            for (List<String> values : rows) {
                Row row = sheet.createRow(rowIndex++);
                for (int i = 0; i < headers.size(); i++) {
                    String value = "N/A";
                    if (values != null && i < values.size() && values.get(i) != null && !values.get(i).isBlank())
                        value = values.get(i);
                    setCell(row, i, value, dataStyle);
                }
            }
        }
        sheet.createFreezePane(0, 1);
        if (rowIndex > 1) sheet.setAutoFilter(new CellRangeAddress(0, rowIndex - 1, 0, headers.size() - 1));
        autoSizeColumns(sheet, headers.size());
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();
        return outputStream.toByteArray();
    }

    public byte[] workbookToBytes(Workbook workbook) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();
        return outputStream.toByteArray();
    }

    private void setCell(Row row, int columnIndex, Object value, CellStyle style) {
        Cell cell = row.createCell(columnIndex);
        if (value == null) cell.setCellValue("N/A");
        else cell.setCellValue(String.valueOf(value));
        cell.setCellStyle(style);
    }

    private void autoSizeColumns(Sheet sheet, int columnCount) {
        for (int i = 0; i < columnCount; i++) {
            sheet.autoSizeColumn(i);
            if (sheet.getColumnWidth(i) > 12000) sheet.setColumnWidth(i, 12000);
        }
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        setBorders(style);
        return style;
    }

    private CellStyle createMandatoryStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.RED.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        setBorders(style);
        return style;
    }

    private CellStyle createOptionalStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.YELLOW.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        setBorders(style);
        return style;
    }

    private CellStyle createExampleStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setItalic(true);
        font.setColor(IndexedColors.GREY_50_PERCENT.getIndex());
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        setBorders(style);
        return style;
    }

    private CellStyle createDataStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setWrapText(true);
        setBorders(style);
        return style;
    }

    private void setBorders(CellStyle style) {
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
    }
}