package com.other.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.other.dto.ApiResponse;
import com.other.dto.request.BranchRequest;
import com.other.dto.response.BranchResponse;
import com.other.entity.Branch;
import com.other.repository.BranchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class BranchService {

    private static final String BRANCH_DROPDOWN_KEY = "branches:dropdown";

    private final BranchRepository branchRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    public ResponseEntity<ApiResponse<?>> saveBranch(BranchRequest branchRequest) {
        Branch branch = new Branch();
        branch.setBranchName(branchRequest.getBranchName());
        Branch savedBranch = branchRepository.save(branch);
        BranchResponse response = new BranchResponse();
        response.setId(savedBranch.getId());
        response.setBranchName(savedBranch.getBranchName());
        redisTemplate.delete(BRANCH_DROPDOWN_KEY);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(201, "Branch added successfully", response, null));
    }

    public ResponseEntity<ApiResponse<?>> getBranchDropdown() {
        try {
            String cachedData = redisTemplate.opsForValue().get(BRANCH_DROPDOWN_KEY);
            if (cachedData != null) {
                List<BranchResponse> response = objectMapper.readValue(cachedData, new TypeReference<>() {
                });
                return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>(200, "Branch dropdown fetched from cache", response, null));
            }
            List<BranchResponse> response = branchRepository.findAllByOrderByBranchNameAsc().stream().map(branch -> {
                BranchResponse dto = new BranchResponse();
                dto.setId(branch.getId());
                dto.setBranchName(branch.getBranchName());
                return dto;
            }).toList();
            String json = objectMapper.writeValueAsString(response);
            redisTemplate.opsForValue().set(BRANCH_DROPDOWN_KEY, json, 10, TimeUnit.MINUTES);
            return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>(200, "Branch dropdown fetched successfully", response, null));
        } catch (Exception e) {
            List<BranchResponse> response = branchRepository.findAllByOrderByBranchNameAsc().stream().map(branch -> {
                BranchResponse dto = new BranchResponse();
                dto.setId(branch.getId());
                dto.setBranchName(branch.getBranchName());
                return dto;
            }).toList();
            return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>(200, "Branch dropdown fetched successfully", response, null));
        }
    }
}