package com.other.controller;


import com.other.dto.ApiResponse;
import com.other.dto.request.BranchRequest;
import com.other.service.BranchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("branch")
@RequiredArgsConstructor
public class BranchController {

    private final BranchService branchService;

    @PostMapping("save")
    public ResponseEntity<ApiResponse<?>> saveBranch(@RequestBody BranchRequest branchRequest) {
        return branchService.saveBranch(branchRequest);
    }

    @GetMapping("dropdown")
    public ResponseEntity<ApiResponse<?>> getBranchDropdown() {
        return branchService.getBranchDropdown();
    }
}