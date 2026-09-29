package com.master.service;

import com.master.dto.ApiResponse;
import com.master.dto.request.EmployeeRequestDto;
import com.master.dto.response.EmployeeResponseDto;
import com.master.entity.Employee;
import com.master.exceptions.AppException;
import com.master.repository.EmployeeRepository;
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

    public ResponseEntity<ApiResponse<EmployeeResponseDto>> saveEmployee(EmployeeRequestDto request) {
        if (employeeRepository.existsByEmployeeCode(request.getEmployeeCode()))
            throw new AppException(409, "Employee Code already exists", HttpStatus.CONFLICT);
        if (request.getEmail() != null && !request.getEmail().isBlank() && employeeRepository.existsByEmail(request.getEmail()))
            throw new AppException(409, "Email already exists", HttpStatus.CONFLICT);
        Employee employee = new Employee();
        BeanUtils.copyProperties(request, employee);
        Employee savedEmployee = employeeRepository.save(employee);
        EmployeeResponseDto response = new EmployeeResponseDto();
        BeanUtils.copyProperties(savedEmployee, response);
        return ResponseEntity.ok(new ApiResponse<>(200, "Employee saved successfully", response, null));
    }

    public ResponseEntity<ApiResponse<List<EmployeeResponseDto>>> getAllEmployees() {
        List<EmployeeResponseDto> response = employeeRepository.findAllByOrderByFullNameAsc().stream().map(employee -> {
                    EmployeeResponseDto dto = new EmployeeResponseDto();
                    BeanUtils.copyProperties(employee, dto);
                    return dto;
                }).toList();
        return ResponseEntity.ok(new ApiResponse<>(200, "Employees fetched successfully", response, null));
    }

    public ResponseEntity<ApiResponse<EmployeeResponseDto>> getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id).orElseThrow(() -> new AppException(404, "Employee not found", HttpStatus.NOT_FOUND));
        EmployeeResponseDto response = new EmployeeResponseDto();
        BeanUtils.copyProperties(employee, response);
        return ResponseEntity.ok(new ApiResponse<>(200, "Employee fetched successfully", response, null));
    }
}