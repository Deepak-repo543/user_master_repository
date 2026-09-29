package com.other.repository;

import com.other.entity.Designation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DesignationRepository extends JpaRepository<Designation, Long> {
    List<Designation> findAllByOrderByDesignationNameAsc();
}