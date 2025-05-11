package com.mytickets.ticketingApp.service.impl;

import com.mytickets.ticketingApp.model.AuditLog;
import com.mytickets.ticketingApp.repository.AuditLogRepository;
import com.mytickets.ticketingApp.service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuditServiceImpl implements AuditService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Override
    public AuditLog createLog(String action, String details, String entityType, Long entityId, Long userId, String userEmail) {
        return createLog(action, details, entityType, entityId, userId, userEmail, null, null);
    }

    @Override
    public AuditLog createLog(String action, String details, String entityType, Long entityId, Long userId, String userEmail, String ipAddress, String userAgent) {
        AuditLog log = new AuditLog();
        log.setAction(action);
        log.setDetails(details);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setUserId(userId);
        log.setUserEmail(userEmail);
        log.setIpAddress(ipAddress);
        log.setUserAgent(userAgent);
        log.setTimestamp(LocalDateTime.now());

        return auditLogRepository.save(log);
    }

    @Override
    public List<AuditLog> getLogsByEntity(String entityType, Long entityId) {
        return auditLogRepository.findByEntityTypeAndEntityId(entityType, entityId);
    }

    @Override
    public List<AuditLog> getLogsByUser(Long userId) {
        return auditLogRepository.findByUserId(userId);
    }

    @Override
    public List<AuditLog> getLogsByAction(String action) {
        return auditLogRepository.findByAction(action);
    }

    @Override
    public List<AuditLog> getLogsByDateRange(LocalDateTime start, LocalDateTime end) {
        return auditLogRepository.findByTimestampBetween(start, end);
    }

    @Override
    public Page<AuditLog> getAllLogs(Pageable pageable) {
        return auditLogRepository.findAll(pageable);
    }
}