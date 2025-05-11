package com.mytickets.ticketingApp.service;

import com.mytickets.ticketingApp.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface AuditService {
    AuditLog createLog(String action, String details, String entityType, Long entityId, Long userId, String userEmail);

    AuditLog createLog(String action, String details, String entityType, Long entityId, Long userId, String userEmail, String ipAddress, String userAgent);

    List<AuditLog> getLogsByEntity(String entityType, Long entityId);

    List<AuditLog> getLogsByUser(Long userId);

    List<AuditLog> getLogsByAction(String action);

    List<AuditLog> getLogsByDateRange(LocalDateTime start, LocalDateTime end);

    Page<AuditLog> getAllLogs(Pageable pageable);
}