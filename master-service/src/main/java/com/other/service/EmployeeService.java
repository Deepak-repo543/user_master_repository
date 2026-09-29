package com.other.service;

import com.other.dto.ApiResponse;
import com.other.dto.request.EmployeeRequest;
import com.other.dto.response.EmployeeResponse;
import com.other.entity.Employee;

import com.other.exception.AppException;
import com.other.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    public ResponseEntity<ApiResponse<List<EmployeeResponse>>> saveAllEmployees(List<EmployeeRequest> employeeRequests) {
        List<Employee> employees = employeeRequests.stream().map(req -> {
            Employee e = new Employee();
            BeanUtils.copyProperties(req, e);
            return e;
        }).toList();
        List<Employee> savedEmployees = employeeRepository.saveAll(employees);
        List<EmployeeResponse> responses = savedEmployees.stream().map(e -> {
            EmployeeResponse r = new EmployeeResponse();
            BeanUtils.copyProperties(e, r);
            return r;
        }).toList();
        return ResponseEntity.ok(new ApiResponse<>(200, "Employees saved successfully", responses, null));
    }

    public ResponseEntity<ApiResponse<List<EmployeeResponse>>> getAllEmployees() {
        List<EmployeeResponse> response = employeeRepository.findAllByOrderByFullNameAsc().stream().map(employee -> {
            EmployeeResponse dto = new EmployeeResponse();
            BeanUtils.copyProperties(employee, dto);
            return dto;
        }).toList();
        return ResponseEntity.ok(new ApiResponse<>(200, "Employees fetched successfully", response, null));
    }

    public ResponseEntity<ApiResponse<EmployeeResponse>> getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id).orElseThrow(() -> new AppException(404, "Employee not found", HttpStatus.NOT_FOUND));
        EmployeeResponse response = new EmployeeResponse();
        BeanUtils.copyProperties(employee, response);
        return ResponseEntity.ok(new ApiResponse<>(200, "Employee fetched successfully", response, null));
    }
}