package com.other.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.other.dto.ApiResponse;
import com.other.dto.request.RoleRequest;
import com.other.dto.response.RoleResponse;
import com.other.entity.Role;
import com.other.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class RoleService {

    private static final String ROLE_DROPDOWN_KEY = "roles:dropdown";
    private final RoleRepository roleRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    public ResponseEntity<ApiResponse<?>> saveRole(RoleRequest roleRequest) {
        Role role = new Role();
        role.setRoleName(roleRequest.getRoleName());
        Role savedRole = roleRepository.save(role);
        RoleResponse response = new RoleResponse();
        response.setId(savedRole.getId());
        response.setRoleName(savedRole.getRoleName());
        redisTemplate.delete(ROLE_DROPDOWN_KEY);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(201, "Role added successfully", response, null));
    }

    public ResponseEntity<ApiResponse<?>> getRoleDropdown() {
        try {
            String cachedData = redisTemplate.opsForValue().get(ROLE_DROPDOWN_KEY);
            if (cachedData != null) {
                List<RoleResponse> response = objectMapper.readValue(cachedData, new TypeReference<>() {
                });
                return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>(200, "Role dropdown fetched from cache", response, null));
            }
            List<RoleResponse> response = roleRepository.findAllByOrderByRoleNameAsc().stream().map(role -> {
                RoleResponse dto = new RoleResponse();
                dto.setId(role.getId());
                dto.setRoleName(role.getRoleName());
                return dto;
            }).toList();
            String json = objectMapper.writeValueAsString(response);
            redisTemplate.opsForValue().set(ROLE_DROPDOWN_KEY, json, 10, TimeUnit.MINUTES);
            return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>(200, "Role dropdown fetched successfully", response, null));
        } catch (Exception e) {
            List<RoleResponse> response = roleRepository.findAllByOrderByRoleNameAsc().stream().map(role -> {
                RoleResponse dto = new RoleResponse();
                dto.setId(role.getId());
                dto.setRoleName(role.getRoleName());
                return dto;
            }).toList();
            return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>(200, "Role dropdown fetched successfully", response, null));
        }
    }
}