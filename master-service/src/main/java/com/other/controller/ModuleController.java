package com.other.controller;

import com.other.dto.ApiResponse;
import com.other.dto.request.ModuleRequest;
import com.other.service.ModuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("module")
@RequiredArgsConstructor
public class ModuleController {

    private final ModuleService moduleService;

    @PostMapping("save")
    public ResponseEntity<ApiResponse<?>> saveModule(@RequestBody ModuleRequest moduleRequest) {
        return moduleService.saveModule(moduleRequest);
    }

    @GetMapping("dropdown")
    public ResponseEntity<ApiResponse<?>> getModuleDropdown() {
        return moduleService.getModuleDropdown();
    }
}