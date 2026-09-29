package com.other.controller;

import com.other.dto.ApiResponse;
import com.other.dto.request.EmployeeRequest;
import com.other.dto.response.EmployeeResponse;
import com.other.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


import java.util.List;

@RestController
@RequestMapping("employee")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping("save")
    public ResponseEntity<ApiResponse<List<EmployeeResponse>>> saveAllEmployees(
            @Valid @RequestBody List<EmployeeRequest> employeeRequests) {
        return employeeService.saveAllEmployees(employeeRequests);
    }

    @GetMapping("list")
    public ResponseEntity<ApiResponse<List<EmployeeResponse>>> getAllEmployees() {
        return employeeService.getAllEmployees();
    }

    @GetMapping("{id}")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getEmployeeById(@PathVariable Long id) {
        return employeeService.getEmployeeById(id);
    }
}