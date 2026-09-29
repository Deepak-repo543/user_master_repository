package com.other.repository;

import com.other.entity.Module;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ModuleRepository extends JpaRepository<Module, Long> {
    List<Module> findAllByOrderByModuleNameAsc();
}