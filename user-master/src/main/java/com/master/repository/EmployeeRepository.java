package com.master.repository;

import com.master.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    boolean existsByEmployeeCode(String employeeCode);
    boolean existsByEmail(String email);
    List<Employee> findAllByOrderByFullNameAsc();
}