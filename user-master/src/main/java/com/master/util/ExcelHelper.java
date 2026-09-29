package com.master.util;

import com.master.dto.request.UserRequestDto;
import com.master.dto.response.ExcelFailedRowDto;
import com.master.dto.response.ExcelRowResultDto;
import com.master.dto.response.UserResponseDto;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.DataFormatter;
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
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class ExcelHelper {

    private static final String[] HEADERS = {"User ID", "Employee ID", "Employee Code", "Full Name", "Email", "Mobile Number", "Department", "Designation", "Branch", "Role", "Reporting Manager", "Language", "Time Zone", "Login Type", "Password Expiry", "Two Factor Auth", "Remarks", "Dashboard", "Accessible Modules"};
    private static final String[] COLUMN_TYPES = {"MANDATORY", "MANDATORY", "MANDATORY", "MANDATORY", "MANDATORY", "MANDATORY", "MANDATORY", "MANDATORY", "MANDATORY", "MANDATORY", "OPTIONAL", "MANDATORY", "OPTIONAL", "MANDATORY", "OPTIONAL", "OPTIONAL", "OPTIONAL", "OPTIONAL", "OPTIONAL"};

    public Workbook getWorkbook(MultipartFile file) throws IOException {
        return new XSSFWorkbook(file.getInputStream());
    }

    public UserRequestDto mapRowToDto(Row row, Map<String, Long> departmentMap, Map<String, Long> designationMap, Map<String, Long> roleMap, Map<String, Long> branchMap, Map<String, Long> moduleMap) {
        DataFormatter formatter = new DataFormatter();
        UserRequestDto dto = new UserRequestDto();
        dto.setUserId(getString(row, 0, formatter));
        dto.setEmployeeId(getLong(row, 1, formatter));
        dto.setEmployeeCode(getString(row, 2, formatter));
        dto.setFullName(getString(row, 3, formatter));
        dto.setEmail(getString(row, 4, formatter));
        dto.setMobileNumber(getString(row, 5, formatter));
        dto.setDepartmentId(parseIdOrName(getString(row, 6, formatter), departmentMap));
        dto.setDesignationId(parseIdOrName(getString(row, 7, formatter), designationMap));
        dto.setBranchIds(parseNamesToIds(getString(row, 8, formatter), branchMap));
        dto.setRoleId(parseIdOrName(getString(row, 9, formatter), roleMap));
        dto.setReportingManager(getLong(row, 10, formatter));
        dto.setLanguage(getString(row, 11, formatter));
        dto.setTimeZone(getString(row, 12, formatter));
        dto.setLoginType(getString(row, 13, formatter));
        dto.setPasswordExpiry(getInteger(row, formatter));
        dto.setTwoFactorAuthentication(parseBoolean(getString(row, 15, formatter)));
        dto.setRemarks(getString(row, 16, formatter));
        dto.setDashboard(getString(row, 17, formatter));
        dto.setAccessibleModules(parseNamesToIds(getString(row, 18, formatter), moduleMap));
        return dto;
    }

    public byte[] createResultExcel(List<ExcelRowResultDto> rows) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Upload Result");
        String[] headers = {"Row Number", "User ID", "Employee ID", "Employee Code", "Full Name", "Email", "Mobile Number", "Department", "Designation", "Branch", "Role", "Reporting Manager", "Language", "Time Zone", "Login Type", "Password Expiry", "Two Factor Auth", "Remarks", "Dashboard", "Accessible Modules", "Validation Status", "Result", "Reason"};
        CellStyle headerStyle = createNormalHeaderStyle(workbook);
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        int rowIndex = 1;
        if (rows != null) {
            for (ExcelRowResultDto item : rows) {
                Row row = sheet.createRow(rowIndex++);
                row.createCell(0).setCellValue(item.getRowNumber());
                row.createCell(1).setCellValue(value(item.getUserId()));
                row.createCell(2).setCellValue(item.getEmployeeId() != null ? item.getEmployeeId() : 0);
                row.createCell(3).setCellValue(value(item.getEmployeeCode()));
                row.createCell(4).setCellValue(value(item.getFullName()));
                row.createCell(5).setCellValue(value(item.getEmail()));
                row.createCell(6).setCellValue(value(item.getMobileNumber()));
                row.createCell(7).setCellValue(value(item.getDepartmentName()));
                row.createCell(8).setCellValue(value(item.getDesignationName()));
                row.createCell(9).setCellValue(value(item.getBranchIds()));
                row.createCell(10).setCellValue(value(item.getRoleName()));
                row.createCell(11).setCellValue(item.getReportingManager() != null ? item.getReportingManager() : 0);
                row.createCell(12).setCellValue(value(item.getLanguage()));
                row.createCell(13).setCellValue(value(item.getTimeZone()));
                row.createCell(14).setCellValue(value(item.getLoginType()));
                row.createCell(15).setCellValue(item.getPasswordExpiry() != null ? item.getPasswordExpiry() : 0);
                row.createCell(16).setCellValue(item.getTwoFactorAuthentication() != null ? String.valueOf(item.getTwoFactorAuthentication()) : "");
                row.createCell(17).setCellValue(value(item.getRemarks()));
                row.createCell(18).setCellValue(value(item.getDashboard()));
                row.createCell(19).setCellValue(value(item.getAccessibleModules()));
                row.createCell(20).setCellValue(value(item.getValidationStatus()));
                row.createCell(21).setCellValue(value(item.getResult()));
                row.createCell(22).setCellValue(value(item.getMessage()));
            }
        }
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
            if (sheet.getColumnWidth(i) > 15000) {
                sheet.setColumnWidth(i, 15000);
            }
        }
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();
        return outputStream.toByteArray();
    }

    private String value(String value) {
        return value == null || value.trim().isEmpty() ? "N/A" : value;
    }

    public boolean isRowEmpty(Row row) {
        if (row == null) {
            return true;
        }
        DataFormatter formatter = new DataFormatter();
        for (int i = 0; i < HEADERS.length; i++) {
            Cell cell = row.getCell(i);
            if (cell != null) {
                String value = formatter.formatCellValue(cell);
                if (value != null && !value.trim().isEmpty()) {
                    return false;
                }
            }
        }
        return true;
    }

    private String getString(Row row, int index, DataFormatter formatter) {
        Cell cell = row.getCell(index);
        if (cell == null) {
            return null;
        }
        String value = formatter.formatCellValue(cell);
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }

    private Long getLong(Row row, int index, DataFormatter formatter) {
        String value = getString(row, index, formatter);
        if (value == null) {
            return null;
        }
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException e) {
            try {
                return Double.valueOf(value).longValue();
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
    }

    private Integer getInteger(Row row, DataFormatter formatter) {
        String value = getString(row, 14, formatter);
        if (value == null) {
            return null;
        }
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            try {
                return Double.valueOf(value).intValue();
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
    }

    private Long parseIdOrName(String value, Map<String, Long> map) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        String trimmed = value.trim();
        try {
            return Long.parseLong(trimmed);
        } catch (NumberFormatException ignored) {
        }
        if (map == null || map.isEmpty()) {
            return null;
        }
        return map.get(trimmed.toLowerCase());
    }

    private List<Long> parseNamesToIds(String value, Map<String, Long> map) {
        if (value == null || value.trim().isEmpty()) {
            return new ArrayList<>();
        }
        List<Long> ids = new ArrayList<>();
        String[] values = value.split(",");
        for (String item : values) {
            String trimmed = item.trim();
            if (trimmed.isEmpty()) {
                continue;
            }
            try {
                ids.add(Long.parseLong(trimmed));
                continue;
            } catch (NumberFormatException ignored) {
            }
            if (map != null && !map.isEmpty()) {
                Long id = map.get(trimmed.toLowerCase());
                if (id != null) {
                    ids.add(id);
                }
            }
        }
        return ids;
    }

    private Boolean parseBoolean(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        String normalized = value.trim().toLowerCase();
        return switch (normalized) {
            case "true", "yes", "1", "active" -> true;
            case "false", "no", "0", "inactive" -> false;
            default -> null;
        };
    }

    public ByteArrayOutputStream createTemplateWorkbook() throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Users");
        CellStyle mandatoryStyle = createHeaderStyle(workbook, IndexedColors.RED);
        CellStyle optionalStyle = createHeaderStyle(workbook, IndexedColors.YELLOW);
        CellStyle headerStyle = createNormalHeaderStyle(workbook);
        Row typeRow = sheet.createRow(0);
        Row headerRow = sheet.createRow(1);
        Row exampleRow = sheet.createRow(2);
        for (int i = 0; i < HEADERS.length; i++) {
            Cell typeCell = typeRow.createCell(i);
            typeCell.setCellValue(COLUMN_TYPES[i]);
            if ("MANDATORY".equals(COLUMN_TYPES[i])) {
                typeCell.setCellStyle(mandatoryStyle);
            } else {
                typeCell.setCellStyle(optionalStyle);
            }
            Cell headerCell = headerRow.createCell(i);
            headerCell.setCellValue(HEADERS[i]);
            headerCell.setCellStyle(headerStyle);
        }

        String[] exampleValues = {"U1001", "1001", "EMP1001", "John Doe", "john.doe@example.com", "9876543210", "Information Technology", "Senior Software Engineer", "Main Office", "Employee", "1005", "English", "Asia/Kolkata", "Password", "3", "Yes", "Sample remarks", "Default", "User Management"};
        for (int i = 0; i < exampleValues.length; i++) {
            exampleRow.createCell(i).setCellValue(exampleValues[i]);
        }
        sheet.createFreezePane(0, 2);
        sheet.setAutoFilter(new CellRangeAddress(1, 1, 0, HEADERS.length - 1));
        autoSizeColumns(sheet);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();
        return outputStream;
    }

    public ByteArrayOutputStream createUserWorkbook(List<UserResponseDto> users, Map<Long, String> departmentMap, Map<Long, String> designationMap, Map<Long, String> roleMap, Map<Long, String> branchMap, Map<Long, String> moduleMap) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Users");
        CellStyle mandatoryStyle = createHeaderStyle(workbook, IndexedColors.RED);
        CellStyle optionalStyle = createHeaderStyle(workbook, IndexedColors.YELLOW);
        CellStyle headerStyle = createNormalHeaderStyle(workbook);
        Row typeRow = sheet.createRow(0);
        Row headerRow = sheet.createRow(1);
        for (int i = 0; i < HEADERS.length; i++) {
            Cell typeCell = typeRow.createCell(i);
            typeCell.setCellValue(COLUMN_TYPES[i]);
            if ("MANDATORY".equals(COLUMN_TYPES[i])) {
                typeCell.setCellStyle(mandatoryStyle);
            } else {
                typeCell.setCellStyle(optionalStyle);
            }
            Cell headerCell = headerRow.createCell(i);
            headerCell.setCellValue(HEADERS[i]);
            headerCell.setCellStyle(headerStyle);
        }

        if (users != null) {
            int rowIndex = 2;
            for (UserResponseDto user : users) {
                Row row = sheet.createRow(rowIndex++);
                setCell(row, 0, user.getUserId());
                setCell(row, 1, user.getEmployeeId());
                setCell(row, 2, user.getEmployeeCode());
                setCell(row, 3, user.getFullName());
                setCell(row, 4, user.getEmail());
                setCell(row, 5, user.getMobileNumber());
                setCell(row, 6, getValueOrNA(departmentMap.get(user.getDepartmentId())));
                setCell(row, 7, getValueOrNA(designationMap.get(user.getDesignationId())));
                setCell(row, 8, getBranchNames(user.getBranchIds(), branchMap));
                setCell(row, 9, getValueOrNA(roleMap.get(user.getRoleId())));
                setCell(row, 10, user.getReportingManager());
                setCell(row, 11, user.getLanguage());
                setCell(row, 12, user.getTimeZone());
                setCell(row, 13, user.getLoginType());
                setCell(row, 14, user.getPasswordExpiry());
                setCell(row, 15, user.getTwoFactorAuthentication());
                setCell(row, 16, user.getRemarks());
                setCell(row, 17, user.getDashboard());
                setCell(row, 18, getModuleNames(user.getAccessibleModules(), moduleMap));
            }
        }
        sheet.createFreezePane(0, 2);
        sheet.setAutoFilter(new CellRangeAddress(1, 1, 0, HEADERS.length - 1));
        autoSizeColumns(sheet);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();
        return outputStream;
    }

    public ExcelFailedRowDto createFailedRow(Row row, int rowNumber, String failureReason) {
        return new ExcelFailedRowDto(rowNumber, getRowValues(row), failureReason);
    }

    public byte[] createFailedExcel(List<ExcelFailedRowDto> failedRows) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Failed Users");
        CellStyle headerStyle = createNormalHeaderStyle(workbook);
        String[] failedHeaders = {"Row Number", "User ID", "Employee ID", "Employee Code", "Full Name", "Email", "Mobile Number", "Department", "Designation", "Branch", "Role", "Reporting Manager", "Language", "Time Zone", "Login Type", "Password Expiry", "Two Factor Auth", "Remarks", "Dashboard", "Accessible Modules", "Failure Reason"};
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < failedHeaders.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(failedHeaders[i]);
            cell.setCellStyle(headerStyle);
        }
        if (failedRows != null) {
            int rowIndex = 1;
            for (ExcelFailedRowDto failedRow : failedRows) {
                Row row = sheet.createRow(rowIndex++);
                row.createCell(0).setCellValue(failedRow.getRowNumber());
                List<String> values = failedRow.getValues();
                for (int i = 0; i < values.size(); i++) {
                    row.createCell(i + 1).setCellValue(values.get(i) == null ? "" : values.get(i));
                }
                row.createCell(values.size() + 1).setCellValue(failedRow.getFailureReason() == null ? "" : failedRow.getFailureReason());
            }
        }
        for (int i = 0; i < failedHeaders.length; i++) {
            sheet.autoSizeColumn(i);
            if (sheet.getColumnWidth(i) > 15000) sheet.setColumnWidth(i, 15000);
        }
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();
        return outputStream.toByteArray();
    }

    public List<String> getRowValues(Row row) {
        List<String> values = new ArrayList<>();
        DataFormatter formatter = new DataFormatter();
        for (int i = 0; i < HEADERS.length; i++) {
            Cell cell = row.getCell(i);
            if (cell == null) {
                values.add("");
            } else {
                values.add(formatter.formatCellValue(cell));
            }
        }
        return values;
    }

    private String getBranchNames(List<Long> branchIds, Map<Long, String> branchMap) {
        if (branchIds == null || branchIds.isEmpty()) {
            return "N/A";
        }
        String result = branchIds.stream().map(branchMap::get).filter(name -> name != null && !name.isBlank()).collect(Collectors.joining(", "));
        return result.isBlank() ? "N/A" : result;
    }

    private String getModuleNames(List<Long> moduleIds, Map<Long, String> moduleMap) {
        if (moduleIds == null || moduleIds.isEmpty()) {
            return "N/A";
        }
        String result = moduleIds.stream().map(moduleMap::get).filter(name -> name != null && !name.isBlank()).collect(Collectors.joining(", "));
        return result.isBlank() ? "N/A" : result;
    }

    private String getValueOrNA(String value) {
        return value == null || value.isBlank() ? "N/A" : value;
    }

    private void setCell(Row row, int index, Object value) {
        Cell cell = row.createCell(index);
        switch (value) {
            case null -> {
                cell.setCellValue("N/A");
                return;
            }
            case Number number -> {
                cell.setCellValue(number.doubleValue());
                return;
            }
            case Boolean bool -> {
                cell.setCellValue(bool);
                return;
            }
            default -> {
            }
        }
        String stringValue = value.toString();
        cell.setCellValue(stringValue.isBlank() ? "N/A" : stringValue);
    }

    private CellStyle createHeaderStyle(Workbook workbook, IndexedColors color) {
        CellStyle style = workbook.createCellStyle();
        style.setFillForegroundColor(color.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        return style;
    }

    private CellStyle createNormalHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        return style;
    }

    private void autoSizeColumns(Sheet sheet) {
        for (int i = 0; i < HEADERS.length + 1; i++) {
            sheet.autoSizeColumn(i);
            if (sheet.getColumnWidth(i) > 15000) {
                sheet.setColumnWidth(i, 15000);
            }
        }
    }
}