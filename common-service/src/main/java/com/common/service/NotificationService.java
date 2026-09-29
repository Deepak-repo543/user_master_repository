package com.common.service;

import com.common.entity.Notification;
import com.common.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public Notification createNotification(String title, String message, String type, String referenceId) {
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setReferenceId(referenceId);
        return notificationRepository.save(notification);
    }

    public Page<Notification> getNotifications(int page, int size) {
        return notificationRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
    }

    public long getUnreadNotificationCount() {
        return notificationRepository.countByIsReadFalse();
    }

    public Notification markNotificationAsRead(Long id) {
        Notification notification = notificationRepository.findById(id).orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }
}