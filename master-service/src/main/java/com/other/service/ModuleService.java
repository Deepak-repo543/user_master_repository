package com.other.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.other.dto.ApiResponse;
import com.other.dto.request.ModuleRequest;
import com.other.dto.response.ModuleResponse;
import com.other.entity.Module;
import com.other.repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class ModuleService {

    private static final String MODULE_DROPDOWN_KEY = "modules:dropdown";
    private final ModuleRepository moduleRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    public ResponseEntity<ApiResponse<?>> saveModule(ModuleRequest moduleRequest) {
        Module module = new Module();
        module.setModuleName(moduleRequest.getModuleName());
        Module savedModule = moduleRepository.save(module);
        ModuleResponse response = new ModuleResponse();
        response.setId(savedModule.getId());
        response.setModuleName(savedModule.getModuleName());
        redisTemplate.delete(MODULE_DROPDOWN_KEY);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(201, "Module added successfully", response, null));
    }

    public ResponseEntity<ApiResponse<?>> getModuleDropdown() {
        try {
            String cachedData = redisTemplate.opsForValue().get(MODULE_DROPDOWN_KEY);
            if (cachedData != null) {
                List<ModuleResponse> response = objectMapper.readValue(cachedData, new TypeReference<>() {
                });
                return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>(200, "Module dropdown fetched from cache", response, null));
            }

            List<ModuleResponse> response = moduleRepository.findAllByOrderByModuleNameAsc().stream().map(module -> {
                ModuleResponse dto = new ModuleResponse();
                dto.setId(module.getId());
                dto.setModuleName(module.getModuleName());
                return dto;
            }).toList();
            String json = objectMapper.writeValueAsString(response);
            redisTemplate.opsForValue().set(MODULE_DROPDOWN_KEY, json, 10, TimeUnit.MINUTES);
            return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>(200, "Module dropdown fetched successfully", response, null));
        } catch (Exception e) {
            List<ModuleResponse> response = moduleRepository.findAllByOrderByModuleNameAsc().stream().map(module -> {
                ModuleResponse dto = new ModuleResponse();
                dto.setId(module.getId());
                dto.setModuleName(module.getModuleName());
                return dto;
            }).toList();
            return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>(200, "Module dropdown fetched successfully", response, null));
        }
    }
}