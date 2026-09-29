package com.other.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.other.dto.ApiResponse;
import com.other.dto.request.DesignationRequest;
import com.other.dto.response.DesignationResponse;
import com.other.entity.Designation;
import com.other.repository.DesignationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class DesignationService {

    private static final String DESIGNATION_DROPDOWN_KEY = "designations:dropdown";
    private final DesignationRepository designationRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    public ResponseEntity<ApiResponse<?>> saveDesignation(DesignationRequest designationRequest) {
        Designation designation = new Designation();
        designation.setDesignationName(designationRequest.getDesignationName());
        Designation savedDesignation = designationRepository.save(designation);
        DesignationResponse response = new DesignationResponse();
        response.setId(savedDesignation.getId());
        response.setDesignationName(savedDesignation.getDesignationName());
        redisTemplate.delete(DESIGNATION_DROPDOWN_KEY);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(201, "Designation added successfully", response, null));
    }

    public ResponseEntity<ApiResponse<?>> getDesignationDropdown() {
        try {
            String cachedData = redisTemplate.opsForValue().get(DESIGNATION_DROPDOWN_KEY);
            if (cachedData != null) {
                List<DesignationResponse> response = objectMapper.readValue(cachedData, new TypeReference<>() {
                });
                return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>(200, "Designation dropdown fetched from cache", response, null));
            }

            List<DesignationResponse> response = designationRepository.findAllByOrderByDesignationNameAsc().stream().map(designation -> {
                DesignationResponse dto = new DesignationResponse();
                dto.setId(designation.getId());
                dto.setDesignationName(designation.getDesignationName());
                return dto;
            }).toList();
            String json = objectMapper.writeValueAsString(response);
            redisTemplate.opsForValue().set(DESIGNATION_DROPDOWN_KEY, json, 10, TimeUnit.MINUTES);
            return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>(200, "Designation dropdown fetched successfully", response, null));
        } catch (Exception e) {
            List<DesignationResponse> response = designationRepository.findAllByOrderByDesignationNameAsc().stream().map(designation -> {
                DesignationResponse dto = new DesignationResponse();
                dto.setId(designation.getId());
                dto.setDesignationName(designation.getDesignationName());
                return dto;
            }).toList();
            return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>(200, "Designation dropdown fetched successfully", response, null));
        }
    }
}