package com.other.controller;

import com.other.dto.ApiResponse;
import com.other.dto.request.DepartmentRequest;
import com.other.entity.Department;
import com.other.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("department")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @PostMapping("save")
    public ResponseEntity<ApiResponse<?>> saveDepartment(@RequestBody DepartmentRequest departmentRequest) {
        return departmentService.saveDepartment(departmentRequest);
    }

    @GetMapping("dropdown")
    public ResponseEntity<ApiResponse<?>> getDepartmentDropdown() {
        return departmentService.getDepartmentDropdown();
    }
}