package com.master.service;

import com.common.service.CommonExcelService;
import com.common.service.EmailService;
import com.common.service.NotificationService;
import com.master.client.MasterServiceClient;
import com.master.dto.ApiResponse;
import com.master.dto.master.BranchResponse;
import com.master.dto.master.DepartmentResponse;
import com.master.dto.master.DesignationResponse;
import com.master.dto.master.ModuleResponse;
import com.master.dto.master.RoleResponse;
import com.master.dto.request.UserDownloadRequest;
import com.master.dto.request.UserFilterRequest;
import com.master.dto.request.UserRequestDto;
import com.master.dto.response.EmailExportPromptDto;
import com.master.dto.response.ExcelFailedRowDto;
import com.master.dto.response.ExcelPreviewResponseDto;
import com.master.dto.response.ExcelRowResultDto;
import com.master.dto.response.ExcelUploadResponseDto;
import com.master.dto.response.UserResponseDto;
import com.master.entity.ExportFile;
import com.master.entity.User;
import com.master.repository.ExportFileRepository;
import com.master.repository.UserRepository;
import com.master.util.ExcelHelper;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class UserExcelService {

    private final UserRepository userRepository;
    private final ExcelHelper excelHelper;
    private final Validator validator;
    private final MasterServiceClient masterServiceClient;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final CommonExcelService commonExcelService;
    private final ExportFileRepository exportFileRepository;
    @Value("${excel.notification-email}")
    private String notificationEmail;

    public ResponseEntity<ApiResponse<ExcelUploadResponseDto>> uploadExcel(MultipartFile file) {
        try {
            if (file == null || file.isEmpty())
                return ResponseEntity.badRequest().body(new ApiResponse<>(400, "Excel file is required", null, "Excel file is required"));
            Map<String, Long> departmentMap = getDepartmentMap();
            Map<String, Long> designationMap = getDesignationMap();
            Map<String, Long> roleMap = getRoleMap();
            Map<String, Long> branchMap = getBranchMap();
            Map<String, Long> moduleMap = getModuleMap();
            Map<Long, String> branchNameMap = getBranchNameMap();
            Map<Long, String> moduleNameMap = getModuleNameMap();
            List<UserRequestDto> validUsers = new ArrayList<>();
            List<ExcelRowResultDto> allRows = new ArrayList<>();
            List<ExcelFailedRowDto> failedRows = new ArrayList<>();
            Set<String> userIds = new HashSet<>();
            Set<Long> employeeIds = new HashSet<>();
            Set<String> employeeCodes = new HashSet<>();
            Set<String> emails = new HashSet<>();
            Set<String> mobiles = new HashSet<>();
            Workbook workbook = excelHelper.getWorkbook(file);
            Sheet sheet = workbook.getSheetAt(0);
            int totalRows = 0;
            for (int rowIndex = 2; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
                Row row = sheet.getRow(rowIndex);
                if (excelHelper.isRowEmpty(row))
                    continue;
                totalRows++;
                ExcelRowResultDto result = new ExcelRowResultDto();
                result.setRowNumber(rowIndex + 1);
                try {
                    UserRequestDto dto = excelHelper.mapRowToDto(row, departmentMap, designationMap, roleMap, branchMap, moduleMap);
                    result.setUserId(dto.getUserId());
                    result.setEmployeeId(dto.getEmployeeId());
                    result.setEmployeeCode(dto.getEmployeeCode());
                    result.setFullName(dto.getFullName());
                    result.setEmail(dto.getEmail());
                    result.setMobileNumber(dto.getMobileNumber());
                    result.setDepartmentName(getDepartmentName(dto.getDepartmentId(), departmentMap));
                    result.setDesignationName(getDesignationName(dto.getDesignationId(), designationMap));
                    result.setBranchIds(getBranchNames(dto.getBranchIds(), branchNameMap));
                    result.setRoleName(getRoleName(dto.getRoleId(), roleMap));
                    result.setReportingManager(dto.getReportingManager());
                    result.setLanguage(dto.getLanguage());
                    result.setTimeZone(dto.getTimeZone());
                    result.setLoginType(dto.getLoginType());
                    result.setPasswordExpiry(dto.getPasswordExpiry());
                    result.setTwoFactorAuthentication(dto.getTwoFactorAuthentication());
                    result.setRemarks(dto.getRemarks());
                    result.setDashboard(dto.getDashboard());
                    result.setAccessibleModules(getModuleNames(dto.getAccessibleModules(), moduleNameMap));
                    String validationError = validateUser(dto);
                    if (validationError != null) {
                        result.setValidationStatus("INCORRECT");
                        result.setResult("INVALID");
                        result.setMessage(validationError);
                        failedRows.add(excelHelper.createFailedRow(row, rowIndex + 1, validationError));
                        allRows.add(result);
                        continue;
                    }
                    String masterError = validateMasterData(dto, departmentMap, designationMap, roleMap, branchMap, moduleMap);
                    if (masterError != null) {
                        result.setValidationStatus("INVALID");
                        result.setResult("INVALID");
                        result.setMessage(masterError);
                        failedRows.add(excelHelper.createFailedRow(row, rowIndex + 1, masterError));
                        allRows.add(result);
                        continue;
                    }
                    String duplicateError = validateDuplicateUser(dto, userIds, employeeIds, employeeCodes, emails, mobiles);
                    if (duplicateError != null) {
                        result.setValidationStatus("DUPLICATE");
                        result.setResult("DUPLICATE");
                        result.setMessage(duplicateError);
                        failedRows.add(excelHelper.createFailedRow(row, rowIndex + 1, duplicateError));
                        allRows.add(result);
                        continue;
                    }
                    validUsers.add(dto);
                    userIds.add(dto.getUserId());
                    employeeIds.add(dto.getEmployeeId());
                    employeeCodes.add(dto.getEmployeeCode());
                    emails.add(dto.getEmail());
                    mobiles.add(dto.getMobileNumber());
                    result.setValidationStatus("VALID");
                    result.setResult("VALID");
                    result.setMessage("User saved successfully");
                    allRows.add(result);
                } catch (Exception e) {
                    String errorMessage = e.getMessage() != null ? e.getMessage() : "Invalid row";
                    result.setValidationStatus("INVALID");
                    result.setResult("INVALID");
                    result.setMessage(errorMessage);
                    failedRows.add(excelHelper.createFailedRow(row, rowIndex + 1, errorMessage));
                    allRows.add(result);
                }
            }
            workbook.close();
            int successCount = validUsers.size();
            int failureCount = failedRows.size();
            List<String> successfulEmployeeCodes = validUsers.stream().map(UserRequestDto::getEmployeeCode).filter(StringUtils::hasText).toList();
            if (!validUsers.isEmpty()) {
                List<User> users = validUsers.stream().map(this::mapToEntity).collect(Collectors.toList());
                userRepository.saveAll(users);
            }
            List<String> errors = failedRows.stream().map(ExcelFailedRowDto::getFailureReason).toList();
            byte[] resultExcel = excelHelper.createResultExcel(allRows);
            String emailBody;
            if (failureCount == 0)
                emailBody = "Excel upload completed successfully. " + successCount + " users uploaded successfully. " + "Please find the result Excel attached.";
            else
                emailBody = "Excel upload completed. " + successCount + " users uploaded successfully and " + failureCount + " rows failed. " + "Please find the result Excel attached.";
            emailService.sendEmailWithAttachment(notificationEmail, "Excel Upload Completed", emailBody, "user-upload-result.xlsx", resultExcel);
            ExcelUploadResponseDto response = new ExcelUploadResponseDto(totalRows, successCount, failureCount, errors, successfulEmployeeCodes);
            if (successCount == 0) {
                notificationService.createNotification("Excel Upload Failed", "Excel upload failed. No valid users found. " + "Total rows: " + totalRows + ", Failed rows: " + failureCount, "EXCEL_UPLOAD", null);
                return ResponseEntity.badRequest().body(new ApiResponse<>(400, "No valid users found", response, null));
            }
            String notificationMessage;
            if (failureCount == 0)
                notificationMessage = "Excel upload completed successfully. " + successCount + " users uploaded.";
            else
                notificationMessage = "Excel upload completed. " + successCount + " users uploaded successfully and " + failureCount + " rows failed.";
            notificationService.createNotification("Excel Upload Completed", notificationMessage, "EXCEL_UPLOAD", null);
            return ResponseEntity.status(201).body(new ApiResponse<>(201, "Users uploaded successfully", response, null));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(new ApiResponse<>(500, "Failed to process Excel file", null, e.getMessage()));
        }
    }

    public ResponseEntity<ApiResponse<ExcelPreviewResponseDto>> previewExcel(MultipartFile file) {
        try {
            if (file == null || file.isEmpty())
                return ResponseEntity.badRequest().body(new ApiResponse<>(400, "Excel file is required", null, "Excel file is required"));
            Map<String, Long> departmentMap = getDepartmentMap();
            Map<String, Long> designationMap = getDesignationMap();
            Map<String, Long> roleMap = getRoleMap();
            Map<String, Long> branchMap = getBranchMap();
            Map<String, Long> moduleMap = getModuleMap();
            Map<Long, String> branchNameMap = getBranchNameMap();
            Map<Long, String> moduleNameMap = getModuleNameMap();
            Workbook workbook = excelHelper.getWorkbook(file);
            Sheet sheet = workbook.getSheetAt(0);
            List<ExcelRowResultDto> rows = new ArrayList<>();
            Set<String> userIds = new HashSet<>();
            Set<Long> employeeIds = new HashSet<>();
            Set<String> employeeCodes = new HashSet<>();
            Set<String> emails = new HashSet<>();
            Set<String> mobiles = new HashSet<>();
            int totalRows = 0;
            int validCount = 0;
            int invalidCount = 0;
            int duplicateCount = 0;
            for (int rowIndex = 2; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
                Row row = sheet.getRow(rowIndex);
                if (excelHelper.isRowEmpty(row))
                    continue;
                totalRows++;
                ExcelRowResultDto result = new ExcelRowResultDto();
                result.setRowNumber(rowIndex + 1);
                try {
                    UserRequestDto dto = excelHelper.mapRowToDto(row, departmentMap, designationMap, roleMap, branchMap, moduleMap);
                    result.setUserId(dto.getUserId());
                    result.setEmployeeId(dto.getEmployeeId());
                    result.setEmployeeCode(dto.getEmployeeCode());
                    result.setFullName(dto.getFullName());
                    result.setEmail(dto.getEmail());
                    result.setMobileNumber(dto.getMobileNumber());
                    result.setDepartmentName(getDepartmentName(dto.getDepartmentId(), departmentMap));
                    result.setDesignationName(getDesignationName(dto.getDesignationId(), designationMap));
                    result.setBranchIds(getBranchNames(dto.getBranchIds(), branchNameMap));
                    result.setRoleName(getRoleName(dto.getRoleId(), roleMap));
                    result.setReportingManager(dto.getReportingManager());
                    result.setLanguage(dto.getLanguage());
                    result.setTimeZone(dto.getTimeZone());
                    result.setLoginType(dto.getLoginType());
                    result.setPasswordExpiry(dto.getPasswordExpiry());
                    result.setTwoFactorAuthentication(dto.getTwoFactorAuthentication());
                    result.setRemarks(dto.getRemarks());
                    result.setDashboard(dto.getDashboard());
                    result.setAccessibleModules(getModuleNames(dto.getAccessibleModules(), moduleNameMap));
                    Set<ConstraintViolation<UserRequestDto>> violations = validator.validate(dto);
                    if (!violations.isEmpty()) {
                        String validationMessage = violations.stream().map(ConstraintViolation::getMessage).distinct().collect(Collectors.joining(", "));
                        result.setValidationStatus("INCORRECT");
                        result.setResult("INCORRECT");
                        result.setMessage(validationMessage);
                        invalidCount++;
                        rows.add(result);
                        continue;
                    }
                    String masterError = validateMasterData(dto, departmentMap, designationMap, roleMap, branchMap, moduleMap);
                    if (masterError != null) {
                        result.setValidationStatus("INVALID");
                        result.setResult("INVALID");
                        result.setMessage(masterError);
                        invalidCount++;
                        rows.add(result);
                        continue;
                    }
                    String duplicateError = checkExistingDuplicate(dto);
                    String inFileDuplicateError = findInFileDuplicate(dto, userIds, employeeIds, employeeCodes, emails, mobiles);
                    List<String> allDuplicateErrors = new ArrayList<>();
                    if (duplicateError != null)
                        allDuplicateErrors.add(duplicateError);
                    if (inFileDuplicateError != null)
                        allDuplicateErrors.add(inFileDuplicateError);
                    if (!allDuplicateErrors.isEmpty()) {
                        result.setValidationStatus("DUPLICATE");
                        result.setResult("DUPLICATE");
                        result.setMessage(allDuplicateErrors.stream().flatMap(message -> Stream.of(message.split(", "))).distinct().collect(Collectors.joining(", ")));
                        duplicateCount++;
                        rows.add(result);
                        continue;
                    }
                    userIds.add(dto.getUserId());
                    employeeIds.add(dto.getEmployeeId());
                    employeeCodes.add(dto.getEmployeeCode());
                    emails.add(dto.getEmail());
                    mobiles.add(dto.getMobileNumber());
                    result.setValidationStatus("VALID");
                    result.setResult("VALID");
                    result.setMessage("Valid");
                    validCount++;
                } catch (Exception e) {
                    result.setValidationStatus("INVALID");
                    result.setResult("INVALID");
                    result.setMessage(e.getMessage() != null ? e.getMessage() : "Invalid row");
                    invalidCount++;
                }
                rows.add(result);
            }
            workbook.close();
            ExcelPreviewResponseDto response = new ExcelPreviewResponseDto(totalRows, validCount, invalidCount, duplicateCount, rows);
            return ResponseEntity.ok(new ApiResponse<>(200, "Excel preview generated successfully", response, null));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(new ApiResponse<>(500, "Unable to process Excel file", null, e.getMessage()));
        }
    }

    public ResponseEntity<InputStreamResource> downloadTemplate() {
        try {
            ByteArrayOutputStream outputStream = excelHelper.createTemplateWorkbook();
            ByteArrayInputStream inputStream = new ByteArrayInputStream(outputStream.toByteArray());
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=user-import-template.xlsx");
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentLength(outputStream.size());
            return ResponseEntity.ok().headers(headers).body(new InputStreamResource(inputStream));
        } catch (Exception e) {
            throw new RuntimeException("Unable to create Excel template", e);
        }
    }

    public ResponseEntity<?> downloadExcel(UserFilterRequest filter) {
        try {
            if (filter == null) {
                filter = new UserFilterRequest();
            }
            LocalDate fromDate = parseDate(filter.getFromDate());
            LocalDate toDate = parseDate(filter.getToDate());
            if (fromDate == null || toDate == null) {
                return ResponseEntity.badRequest().body(new ApiResponse<>(400, "From date and To date are required", null, "From date and To date are required"));
            }
            if (toDate.isBefore(fromDate)) {
                return ResponseEntity.badRequest().body(new ApiResponse<>(400, "To date cannot be before From date", null, "To date cannot be before From date"));
            }
            long days = ChronoUnit.DAYS.between(fromDate, toDate) + 1;
            if (days > 7) {
                EmailExportPromptDto prompt = new EmailExportPromptDto("Email Excel Export", "The selected date range is more than 7 days. Would you like to receive the Excel file by email?");
                return ResponseEntity.ok().body(new ApiResponse<>(200, "Date range exceeds limit", prompt, null));
            }
            int page = 0;
            int size = Integer.MAX_VALUE;
            Sort.Direction direction = filter.getDirection() != null && filter.getDirection().equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, filter.getSortBy() != null ? filter.getSortBy() : "id"));
            Long branchId = null;
            if (filter.getBranch() != null && !filter.getBranch().isBlank()) {
                try {
                    branchId = Long.parseLong(filter.getBranch());
                } catch (NumberFormatException ignored) {
                }
            }
            Page<User> pageResult = userRepository.searchUsersForFilter(filter.getSearch(), filter.getStatus(), filter.getDepartmentId(), filter.getDesignationId(), filter.getRoleId(), filter.getEmployeeName(), branchId, fromDate, toDate, pageable);
            List<UserResponseDto> users = pageResult.getContent().stream().map(this::mapToResponse).toList();
            Map<Long, String> departmentMap = getDepartmentNameMap();
            Map<Long, String> designationMap = getDesignationNameMap();
            Map<Long, String> roleMap = getRoleNameMap();
            Map<Long, String> branchMap = getBranchNameMap();
            Map<Long, String> moduleMap = getModuleNameMap();
            ByteArrayOutputStream outputStream = excelHelper.createUserWorkbook(users, departmentMap, designationMap, roleMap, branchMap, moduleMap);
            ByteArrayInputStream inputStream = new ByteArrayInputStream(outputStream.toByteArray());
            HttpHeaders headers = new HttpHeaders();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");
            String fileName = "user_master_export_" + LocalDateTime.now().format(formatter) + ".xlsx";
            headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"");
            headers.setAccessControlExposeHeaders(List.of(HttpHeaders.CONTENT_DISPOSITION));
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentLength(outputStream.size());
            return ResponseEntity.ok().headers(headers).body(new InputStreamResource(inputStream));
        } catch (Exception e) {
            throw new RuntimeException("Unable to download users Excel", e);
        }
    }

    public ResponseEntity<?> sendExcelByEmail(UserDownloadRequest request) {
        if (request == null)
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, "Export request is required", null, "Export request is required"));
        LocalDate fromDate = request.getFromDate();
        LocalDate toDate = request.getToDate();
        if (fromDate == null || toDate == null)
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, "From date and To date are required", null, "From date and To date are required"));
        if (toDate.isBefore(fromDate))
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, "To date cannot be before From date", null, "To date cannot be before From date"));
        Pageable pageable = PageRequest.of(0, Integer.MAX_VALUE, Sort.by(Sort.Direction.ASC, "id"));
        Page<User> pageResult = userRepository.searchUsersForFilter(request.getGlobalSearch(), convertStatus(request.getStatus()), request.getDepartment(), request.getDesignation(), request.getRole(), request.getEmployeeName(), request.getBranch(), fromDate, toDate, pageable);
        List<UserResponseDto> users = pageResult.getContent().stream().map(this::mapToResponse).toList();
        Map<Long, String> departmentMap = getDepartmentNameMap();
        Map<Long, String> designationMap = getDesignationNameMap();
        Map<Long, String> roleMap = getRoleNameMap();
        Map<Long, String> branchMap = getBranchNameMap();
        Map<Long, String> moduleMap = getModuleNameMap();
        List<String> headers = List.of("User ID", "Employee ID", "Employee Code", "Full Name", "Email", "Mobile Number", "Department", "Designation", "Branch", "Role", "Reporting Manager", "Language", "Time Zone", "Login Type", "Password Expiry", "Two Factor Auth", "Remarks", "Dashboard", "Accessible Modules", "Status");
        List<String> mandatoryColumns = List.of("User ID", "Employee ID", "Employee Code", "Full Name", "Email", "Mobile Number", "Department", "Designation", "Branch", "Role", "Language", "Login Type");
        List<List<String>> rows = mapUsersToExcelRows(users, departmentMap, designationMap, roleMap, branchMap, moduleMap);
        byte[] excelBytes;
        try {
            excelBytes = commonExcelService.generateExcel("Users", headers, mandatoryColumns, rows);
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel", e);
        }
        String fileName = "users_" + fromDate + "_to_" + toDate + ".xlsx";
        ExportFile exportFile = new ExportFile();
        exportFile.setFileName(fileName);
        exportFile.setFileData(excelBytes);
        exportFile = exportFileRepository.save(exportFile);
        String htmlBody = buildExportEmailTemplate(fromDate, toDate, users.size());
        emailService.sendEmailWithAttachment(notificationEmail, "User Data Export - " + fromDate + " to " + toDate, htmlBody, fileName, excelBytes);
        notificationService.createNotification("User Data Export Completed", "User data export of " + users.size() + " records from " + fromDate + " to " + toDate + " has been sent to your email.", "USER_EXPORT", String.valueOf(exportFile.getId()));
        return ResponseEntity.ok(new ApiResponse<>(200, "OK", new EmailExportPromptDto("Email Sent", "Excel sent to email successfully"), null));
    }

    private Boolean convertStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }
        return Boolean.valueOf(status);
    }

    private List<List<String>> mapUsersToExcelRows(List<UserResponseDto> users, Map<Long, String> departmentMap, Map<Long, String> designationMap, Map<Long, String> roleMap, Map<Long, String> branchMap, Map<Long, String> moduleMap) {
        return users.stream().map(user -> List.of(
                value(user.getUserId()),
                value(user.getEmployeeId()),
                value(user.getEmployeeCode()),
                value(user.getFullName()),
                value(user.getEmail()),
                value(user.getMobileNumber()),
                value(departmentMap.get(user.getDepartmentId())),
                value(designationMap.get(user.getDesignationId())),
                getBranchNames(user.getBranchIds(), branchMap),
                value(roleMap.get(user.getRoleId())),
                value(user.getReportingManager()),
                value(user.getLanguage()),
                value(user.getTimeZone()),
                value(user.getLoginType()),
                value(user.getPasswordExpiry()),
                value(user.getTwoFactorAuthentication()),
                value(user.getRemarks()),
                value(user.getDashboard()),
                getModuleNames(user.getAccessibleModules(), moduleMap),
                user.getStatus() ? "Inactive" : "Active"
        )).toList();
    }

    private String value(Object value) {
        if (value == null)
            return "N/A";
        String text = String.valueOf(value).trim();
        return text.isEmpty() ? "N/A" : text;
    }

    private String getBranchNames(List<Long> branchIds, Map<Long, String> branchMap) {
        if (branchIds == null || branchIds.isEmpty())
            return "N/A";
        String result = branchIds.stream().map(branchMap::get).filter(Objects::nonNull).filter(name -> !name.isBlank()).collect(Collectors.joining(", "));
        return result.isBlank() ? "N/A" : result;
    }

    private String getModuleNames(List<Long> moduleIds, Map<Long, String> moduleMap) {
        if (moduleIds == null || moduleIds.isEmpty())
            return "N/A";
        String result = moduleIds.stream().map(moduleMap::get).filter(Objects::nonNull).filter(name -> !name.isBlank()).collect(Collectors.joining(", "));
        return result.isBlank() ? "N/A" : result;
    }

    private String validateUser(UserRequestDto dto) {
        Set<ConstraintViolation<UserRequestDto>> violations = validator.validate(dto);
        if (violations.isEmpty())
            return null;
        return violations.stream().map(ConstraintViolation::getMessage).collect(Collectors.joining(", "));
    }

    private String validateDuplicateUser(UserRequestDto dto, Set<String> userIds, Set<Long> employeeIds, Set<String> employeeCodes, Set<String> emails, Set<String> mobiles) {
        if (userIds.contains(dto.getUserId()))
            return "Duplicate User ID found";
        if (employeeIds.contains(dto.getEmployeeId()))
            return "Duplicate Employee ID found";
        if (employeeCodes.contains(dto.getEmployeeCode()))
            return "Duplicate Employee Code found";
        if (emails.contains(dto.getEmail()))
            return "Duplicate Email found";
        if (mobiles.contains(dto.getMobileNumber()))
            return "Duplicate Mobile Number found";
        return checkExistingDuplicate(dto);
    }

    private String checkExistingDuplicate(UserRequestDto dto) {
        Set<String> userIds = dto.getUserId() != null ? Set.of(dto.getUserId()) : Set.of();
        Set<Long> employeeIds = dto.getEmployeeId() != null ? Set.of(dto.getEmployeeId()) : Set.of();
        Set<String> employeeCodes = dto.getEmployeeCode() != null ? Set.of(dto.getEmployeeCode()) : Set.of();
        Set<String> emails = dto.getEmail() != null ? Set.of(dto.getEmail()) : Set.of();
        Set<String> mobiles = dto.getMobileNumber() != null ? Set.of(dto.getMobileNumber()) : Set.of();
        List<User> duplicates = userRepository.findAllPossibleDuplicates(userIds, employeeIds, employeeCodes, emails, mobiles);
        if (duplicates.isEmpty())
            return null;
        List<String> duplicateFields = new ArrayList<>();
        for (User user : duplicates) {
            if (dto.getUserId() != null && dto.getUserId().equals(user.getUserId()))
                duplicateFields.add("Duplicate User ID found: " + dto.getUserId());
            if (dto.getEmployeeId() != null && dto.getEmployeeId().equals(user.getEmployeeId()))
                duplicateFields.add("Duplicate Employee ID found: " + dto.getEmployeeId());
            if (dto.getEmployeeCode() != null && dto.getEmployeeCode().equals(user.getEmployeeCode()))
                duplicateFields.add("Duplicate Employee Code found: " + dto.getEmployeeCode());
            if (dto.getEmail() != null && user.getEmail() != null && dto.getEmail().equalsIgnoreCase(user.getEmail()))
                duplicateFields.add("Duplicate Email found: " + dto.getEmail());
            if (dto.getMobileNumber() != null && dto.getMobileNumber().equals(user.getMobileNumber()))
                duplicateFields.add("Duplicate Mobile Number found: " + dto.getMobileNumber());
        }
        return duplicateFields.isEmpty() ? null : duplicateFields.stream().distinct().collect(Collectors.joining(", "));
    }

    private String findInFileDuplicate(UserRequestDto dto, Set<String> userIds, Set<Long> employeeIds, Set<String> employeeCodes, Set<String> emails, Set<String> mobiles) {
        List<String> duplicates = new ArrayList<>();
        if (dto.getUserId() != null && userIds.contains(dto.getUserId()))
            duplicates.add("Duplicate User ID found: " + dto.getUserId());
        if (dto.getEmployeeId() != null && employeeIds.contains(dto.getEmployeeId()))
            duplicates.add("Duplicate Employee ID found: " + dto.getEmployeeId());
        if (dto.getEmployeeCode() != null && employeeCodes.contains(dto.getEmployeeCode()))
            duplicates.add("Duplicate Employee Code found: " + dto.getEmployeeCode());
        if (dto.getEmail() != null && emails.contains(dto.getEmail()))
            duplicates.add("Duplicate Email found: " + dto.getEmail());
        if (dto.getMobileNumber() != null && mobiles.contains(dto.getMobileNumber()))
            duplicates.add("Duplicate Mobile Number found: " + dto.getMobileNumber());

        return duplicates.isEmpty() ? null : String.join(", ", duplicates);
    }

    private String validateMasterData(UserRequestDto dto, Map<String, Long> departmentMap, Map<String, Long> designationMap, Map<String, Long> roleMap, Map<String, Long> branchMap, Map<String, Long> moduleMap) {
        if (dto.getDepartmentId() == null || !departmentMap.containsValue(dto.getDepartmentId()))
            return "Invalid Department";
        if (dto.getDesignationId() == null || !designationMap.containsValue(dto.getDesignationId()))
            return "Invalid Designation";
        if (dto.getRoleId() == null || !roleMap.containsValue(dto.getRoleId()))
            return "Invalid Role";
        if (dto.getBranchIds() == null || dto.getBranchIds().isEmpty())
            return "At least one Branch is required";
        for (Long branchId : dto.getBranchIds()) {
            if (!branchMap.containsValue(branchId)) {
                return "Invalid Branch";
            }
        }
        if (dto.getAccessibleModules() != null) {
            for (Long moduleId : dto.getAccessibleModules()) {
                if (!moduleMap.containsValue(moduleId)) {
                    return "Invalid Module";
                }
            }
        }
        return null;
    }

    @Scheduled(cron = "0 0 2 * * *")
    public void cleanupOldExportFiles() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(7);
        exportFileRepository.findAll().stream().filter(f -> f.getCreatedAt().isBefore(cutoff)).forEach(f -> exportFileRepository.deleteById(f.getId()));
    }

    private Map<String, Long> getDepartmentMap() {
        ApiResponse<List<DepartmentResponse>> response = masterServiceClient.getDepartments();
        return response.getData().stream().collect(Collectors.toMap(item -> item.getDepartmentName().toLowerCase(), DepartmentResponse::getId, (existing, replacement) -> replacement));
    }

    private Map<String, Long> getDesignationMap() {
        ApiResponse<List<DesignationResponse>> response = masterServiceClient.getDesignations();
        return response.getData().stream().collect(Collectors.toMap(item -> item.getDesignationName().toLowerCase(), DesignationResponse::getId, (existing, replacement) -> replacement));
    }

    private Map<String, Long> getRoleMap() {
        ApiResponse<List<RoleResponse>> response = masterServiceClient.getRoles();
        return response.getData().stream().collect(Collectors.toMap(item -> item.getRoleName().toLowerCase(), RoleResponse::getId, (existing, replacement) -> replacement));
    }

    private Map<String, Long> getBranchMap() {
        ApiResponse<List<BranchResponse>> response = masterServiceClient.getBranches();
        return response.getData().stream().collect(Collectors.toMap(item -> item.getBranchName().toLowerCase(), BranchResponse::getId, (existing, replacement) -> replacement));
    }

    private Map<String, Long> getModuleMap() {
        ApiResponse<List<ModuleResponse>> response = masterServiceClient.getModules();
        return response.getData().stream().collect(Collectors.toMap(item -> item.getModuleName().toLowerCase(), ModuleResponse::getId, (existing, replacement) -> replacement));
    }

    private Map<Long, String> getDepartmentNameMap() {
        ApiResponse<List<DepartmentResponse>> response = masterServiceClient.getDepartments();
        return response.getData().stream().collect(Collectors.toMap(DepartmentResponse::getId, DepartmentResponse::getDepartmentName));
    }

    private Map<Long, String> getDesignationNameMap() {
        ApiResponse<List<DesignationResponse>> response = masterServiceClient.getDesignations();
        return response.getData().stream().collect(Collectors.toMap(DesignationResponse::getId, DesignationResponse::getDesignationName));
    }

    private Map<Long, String> getRoleNameMap() {
        ApiResponse<List<RoleResponse>> response = masterServiceClient.getRoles();
        return response.getData().stream().collect(Collectors.toMap(RoleResponse::getId, RoleResponse::getRoleName));
    }

    private Map<Long, String> getBranchNameMap() {
        ApiResponse<List<BranchResponse>> response = masterServiceClient.getBranches();
        return response.getData().stream().collect(Collectors.toMap(BranchResponse::getId, BranchResponse::getBranchName));
    }

    private Map<Long, String> getModuleNameMap() {
        ApiResponse<List<ModuleResponse>> response = masterServiceClient.getModules();
        return response.getData().stream().collect(Collectors.toMap(ModuleResponse::getId, ModuleResponse::getModuleName));
    }

    private String getDepartmentName(Long id, Map<String, Long> map) {
        if (id == null) {
            return null;
        }
        return map.entrySet().stream().filter(entry -> entry.getValue().equals(id)).map(Map.Entry::getKey).findFirst().orElse(null);
    }

    private String getDesignationName(Long id, Map<String, Long> map) {
        if (id == null) {
            return null;
        }
        return map.entrySet().stream().filter(entry -> entry.getValue().equals(id)).map(Map.Entry::getKey).findFirst().orElse(null);
    }

    private String getRoleName(Long id, Map<String, Long> map) {
        if (id == null) {
            return null;
        }
        return map.entrySet().stream().filter(entry -> entry.getValue().equals(id)).map(Map.Entry::getKey).findFirst().orElse(null);
    }

    private User mapToEntity(UserRequestDto dto) {
        User user;
        if (dto.getId() != null) {
            user = userRepository.findById(dto.getId()).orElseGet(User::new);
        } else {
            user = new User();
        }
        user.setUserId(dto.getUserId());
        user.setEmployeeId(dto.getEmployeeId());
        user.setEmployeeCode(dto.getEmployeeCode());
        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setMobileNumber(dto.getMobileNumber());
        user.setDepartmentId(dto.getDepartmentId());
        user.setDesignationId(dto.getDesignationId());
        user.setBranchIds(dto.getBranchIds());
        user.setRoleId(dto.getRoleId());
        user.setReportingManager(dto.getReportingManager());
        user.setDashboard(dto.getDashboard());
        user.setAccessibleModules(dto.getAccessibleModules());
        user.setLanguage(dto.getLanguage());
        user.setTimeZone(dto.getTimeZone());
        user.setLoginType(dto.getLoginType());
        user.setPasswordExpiry(dto.getPasswordExpiry());
        user.setTwoFactorAuthentication(dto.getTwoFactorAuthentication());
        user.setRemarks(dto.getRemarks());
        user.setStatus(dto.isStatus());
        return user;
    }

    private UserResponseDto mapToResponse(User user) {
        UserResponseDto response = new UserResponseDto();
        response.setId(user.getId());
        response.setUserId(user.getUserId());
        response.setEmployeeId(user.getEmployeeId());
        response.setEmployeeCode(user.getEmployeeCode());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setMobileNumber(user.getMobileNumber());
        response.setDepartmentId(user.getDepartmentId());
        response.setDesignationId(user.getDesignationId());
        response.setBranchIds(user.getBranchIds());
        response.setRoleId(user.getRoleId());
        response.setReportingManager(user.getReportingManager());
        response.setDashboard(user.getDashboard());
        response.setAccessibleModules(user.getAccessibleModules());
        response.setLanguage(user.getLanguage());
        response.setTimeZone(user.getTimeZone());
        response.setLoginType(user.getLoginType());
        response.setPasswordExpiry(user.getPasswordExpiry());
        response.setTwoFactorAuthentication(user.getTwoFactorAuthentication());
        response.setRemarks(user.getRemarks());
        response.setStatus(user.isStatus());
        return response;
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(value, DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (DateTimeParseException e) {
            return null;
        }
    }

    public ResponseEntity<?> downloadExportFile(Long id) {
        ExportFile file = exportFileRepository.findById(id).orElse(null);
        if (file == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse<>(404, "File not found or has expired", null, null));
        }
        ByteArrayResource resource = new ByteArrayResource(file.getFileData());
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + file.getFileName());
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        return ResponseEntity.ok().headers(headers).body(resource);
    }

    private String buildExportEmailTemplate(LocalDate fromDate, LocalDate toDate, int recordCount) {
        return """
                <!DOCTYPE html>
                <html>
                <body style="margin:0; padding:0; background-color:#F1F5F9; font-family: Arial, sans-serif;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="padding: 24px 0;">
                    <tr>
                      <td align="center">
                        <table width="480" cellpadding="0" cellspacing="0" style="background:#FFFFFF; border-radius:10px; overflow:hidden; box-shadow:0 2px 8px rgba(15,23,42,0.06);">
                          <tr>
                            <td style="background: linear-gradient(135deg,#6366F1,#4F46E5); padding: 20px 28px;">
                              <span style="color:#FFFFFF; font-size:16px; font-weight:700;">User Data Export</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 24px 28px;">
                              <p style="margin:0 0 12px 0; color:#0F172A; font-size:14px;">Hello,</p>
                              <p style="margin:0 0 16px 0; color:#334155; font-size:14px; line-height:1.6;">
                                Your requested user data export has been generated and is attached to this email as an Excel file.
                              </p>
                              <table width="100%%" cellpadding="8" cellspacing="0" style="background:#F8FAFC; border-radius:8px; border:1px solid #E2E8F0; margin-bottom: 16px;">
                                <tr>
                                  <td style="color:#64748B; font-size:12px; font-weight:600;">Date Range</td>
                                  <td style="color:#0F172A; font-size:12px; text-align:right;">%s to %s</td>
                                </tr>
                                <tr>
                                  <td style="color:#64748B; font-size:12px; font-weight:600;">Records</td>
                                  <td style="color:#0F172A; font-size:12px; text-align:right;">%d</td>
                                </tr>
                              </table>
                              <p style="margin:0; color:#94A3B8; font-size:11px;">This is an automated email, please do not reply.</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(fromDate, toDate, recordCount);
    }
}