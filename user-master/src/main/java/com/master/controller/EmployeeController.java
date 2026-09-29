package com.master.controller;

import com.master.dto.ApiResponse;
import com.master.dto.request.EmployeeRequestDto;
import com.master.dto.response.EmployeeResponseDto;
import com.master.service.EmployeeService;
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
    public ResponseEntity<ApiResponse<EmployeeResponseDto>> saveEmployee(@Valid @RequestBody EmployeeRequestDto request) {
        return employeeService.saveEmployee(request);
    }

    @GetMapping("list")
    public ResponseEntity<ApiResponse<List<EmployeeResponseDto>>> getAllEmployees() {
        return employeeService.getAllEmployees();
    }

    @GetMapping("{id}")
    public ResponseEntity<ApiResponse<EmployeeResponseDto>> getEmployeeById(@PathVariable Long id) {
        return employeeService.getEmployeeById(id);
    }
}