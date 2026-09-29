package com.common.repository;

import com.common.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findAllByOrderByCreatedAtDesc(Pageable pageable);
    long countByIsReadFalse();
}