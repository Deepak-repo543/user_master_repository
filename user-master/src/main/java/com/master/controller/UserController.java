package com.master.controller;

import com.master.dto.ApiResponse;
import com.master.dto.request.UserFilterRequest;
import com.master.dto.request.UserRequestDto;
import com.master.dto.request.UserSearchRequestDto;
import com.master.dto.response.UserDepartmentCountDto;
import com.master.dto.response.UserHistoryResponseDto;
import com.master.dto.request.UserDuplicateCheckRequest;
import com.master.dto.response.UserResponseDto;
import com.master.entity.User;
import com.master.service.UserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MultiValueMap;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@SecurityRequirement(name = "Bearer Authentication")
@RestController
@RequestMapping("user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGEMENT', 'HOD')")
    @PostMapping("save")
    public ResponseEntity<ApiResponse<?>> saveOrUpdateUsers(@Valid @RequestBody List<UserRequestDto> requests) {
        return userService.saveOrUpdateUsers(requests);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGEMENT', 'HOD')")
    @GetMapping("{id}")
    public ResponseEntity<ApiResponse<UserResponseDto>> getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGEMENT', 'HOD', 'USER')")
    @GetMapping("list")
    public ResponseEntity<ApiResponse<Page<UserResponseDto>>> getAllUser(@RequestParam(required = false) String search, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size, @RequestParam(defaultValue = "id") String sortBy, @RequestParam(defaultValue = "asc") String direction, @RequestParam(required = false) Boolean status, @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate, @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        UserFilterRequest filter = new UserFilterRequest();
        filter.setSearch(search);
        filter.setPage(page);
        filter.setSize(size);
        filter.setSortBy(sortBy);
        filter.setDirection(direction);
        filter.setStatus(status);
        filter.setFromDate(fromDate != null ? fromDate.toString() : null);
        filter.setToDate(toDate != null ? toDate.toString() : null);
        return userService.getUsers(filter);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("delete/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        return userService.deleteUsersById(id);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGEMENT', 'HOD', 'USER')")
    @GetMapping("history/{employeeCode}")
    public ResponseEntity<ApiResponse<Page<UserHistoryResponseDto>>> getUserHistory(@PathVariable String employeeCode, @PageableDefault(sort = "performedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return userService.getUserHistory(employeeCode, pageable);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGEMENT', 'HOD', 'USER')")
    @GetMapping("status-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUserStatusCount(@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate, @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return userService.getUserStatusCount(fromDate, toDate);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGEMENT', 'HOD', 'USER')")
    @PostMapping("search")
    public ResponseEntity<ApiResponse<Page<UserResponseDto>>> searchUsers(@RequestBody UserSearchRequestDto filter) {
        return userService.searchUsers(filter);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'HOD')")
    @PostMapping(value = "attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<?>> uploadAttachments(@RequestParam MultiValueMap<String, MultipartFile> files) {
        return userService.uploadAttachments(files);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGEMENT', 'HOD', 'USER')")
    @GetMapping("department-count")
    public ResponseEntity<ApiResponse<List<UserDepartmentCountDto>>> getUserCountByDepartment() {
        return userService.getUserCountByDepartment();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGEMENT', 'HOD')")
    @PostMapping("duplicate-check")
    public ResponseEntity<ApiResponse<List<User>>> checkDuplicates(@RequestBody UserDuplicateCheckRequest request) {
        return userService.checkDuplicates(request);
    }
}

