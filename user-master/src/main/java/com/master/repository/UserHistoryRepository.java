package com.master.repository;

import com.master.entity.UserHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserHistoryRepository extends JpaRepository<UserHistory, Long> {
    Page<UserHistory> findByEmployeeCodeOrderByPerformedAtDesc(String employeeCode, Pageable pageable);
}