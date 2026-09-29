package com.other.controller;

import com.other.dto.ApiResponse;
import com.other.dto.request.RoleRequest;
import com.other.entity.Role;
import com.other.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("role")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    @PostMapping("save")
    public ResponseEntity<ApiResponse<?>> saveRole(@RequestBody RoleRequest roleRequest) {
        return roleService.saveRole(roleRequest);
    }

    @GetMapping("dropdown")
    public ResponseEntity<ApiResponse<?>> getRoleDropdown() {
        return roleService.getRoleDropdown();
    }
}