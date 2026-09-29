package com.other.service;

import com.other.dto.ApiResponse;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.other.dto.request.DepartmentRequest;
import com.other.dto.response.DepartmentResponse;
import com.other.entity.Department;
import com.other.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private static final String DEPARTMENT_DROPDOWN_KEY = "departments:dropdown";

    private final DepartmentRepository departmentRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    public ResponseEntity<ApiResponse<?>> saveDepartment(DepartmentRequest departmentRequest) {
        Department department = new Department();
        department.setDepartmentName(departmentRequest.getDepartmentName());
        Department savedDepartment = departmentRepository.save(department);
        DepartmentResponse response = new DepartmentResponse();
        response.setId(savedDepartment.getId());
        response.setDepartmentName(savedDepartment.getDepartmentName());
        redisTemplate.delete(DEPARTMENT_DROPDOWN_KEY);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(201, "Department added successfully", response, null));
    }

    public ResponseEntity<ApiResponse<?>> getDepartmentDropdown() {
        try {
            String cachedData = redisTemplate.opsForValue().get(DEPARTMENT_DROPDOWN_KEY);
            if (cachedData != null) {
                List<DepartmentResponse> response = objectMapper.readValue(cachedData, new TypeReference<>() {
                });
                return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>(200, "Department dropdown fetched from cache", response, null));
            }

            List<DepartmentResponse> response = departmentRepository.findAllByOrderByDepartmentNameAsc().stream().map(department -> {
                DepartmentResponse dto = new DepartmentResponse();
                dto.setId(department.getId());
                dto.setDepartmentName(department.getDepartmentName());
                return dto;
            }).toList();
            String json = objectMapper.writeValueAsString(response);
            redisTemplate.opsForValue().set(DEPARTMENT_DROPDOWN_KEY, json, 10, TimeUnit.MINUTES);
            return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>(200, "Department dropdown fetched successfully", response, null));
        } catch (Exception e) {
            List<DepartmentResponse> response = departmentRepository.findAllByOrderByDepartmentNameAsc().stream().map(department -> {
                DepartmentResponse dto = new DepartmentResponse();
                dto.setId(department.getId());
                dto.setDepartmentName(department.getDepartmentName());
                return dto;
            }).toList();
            return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>(200, "Department dropdown fetched successfully", response, null));
        }
    }
}