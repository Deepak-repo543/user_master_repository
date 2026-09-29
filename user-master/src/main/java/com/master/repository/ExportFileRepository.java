package com.master.repository;

import com.master.entity.ExportFile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExportFileRepository extends JpaRepository<ExportFile, Long> {
}