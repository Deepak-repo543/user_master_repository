package com.other.controller;

import com.other.dto.ApiResponse;
import com.other.dto.request.DesignationRequest;
import com.other.dto.response.DesignationResponse;
import com.other.entity.Designation;
import com.other.service.DesignationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("designation")
@RequiredArgsConstructor
public class DesignationController {

    private final DesignationService designationService;

    @PostMapping("save")
    public ResponseEntity<ApiResponse<?>> saveDesignation(@RequestBody DesignationRequest designationRequest) {
        return designationService.saveDesignation(designationRequest);
    }

    @GetMapping("dropdown")
    public ResponseEntity<ApiResponse<?>> getDesignationDropdown() {
        return designationService.getDesignationDropdown();
    }
}