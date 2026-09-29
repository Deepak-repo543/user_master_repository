package com.master.client;

import com.master.dto.ApiResponse;
import com.master.dto.master.BranchResponse;
import com.master.dto.master.DepartmentResponse;
import com.master.dto.master.DesignationResponse;
import com.master.dto.master.ModuleResponse;
import com.master.dto.master.RoleResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@FeignClient(name = "master-service", url = "${master-service.url}")
public interface MasterServiceClient {
    @GetMapping("/department/dropdown")
    ApiResponse<List<DepartmentResponse>> getDepartments();
    @GetMapping("/designation/dropdown")
    ApiResponse<List<DesignationResponse>> getDesignations();
    @GetMapping("/role/dropdown")
    ApiResponse<List<RoleResponse>> getRoles();
    @GetMapping("/branch/dropdown")
    ApiResponse<List<BranchResponse>> getBranches();
    @GetMapping("/module/dropdown")
    ApiResponse<List<ModuleResponse>> getModules();
}