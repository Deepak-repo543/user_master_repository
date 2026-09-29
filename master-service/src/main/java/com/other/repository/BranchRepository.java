package com.other.repository;


import com.other.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BranchRepository extends JpaRepository<Branch, Long> {
    List<Branch> findAllByOrderByBranchNameAsc();
}