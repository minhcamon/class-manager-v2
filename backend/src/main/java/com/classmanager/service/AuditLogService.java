package com.classmanager.service;

import com.classmanager.dto.audit.AuditActionSummary;
import com.classmanager.dto.audit.AuditLogFilterCriteria;
import com.classmanager.dto.audit.AuditLogResponse;
import com.classmanager.entity.AuditLog;
import com.classmanager.entity.User;
import com.classmanager.enums.AuditAction;
import com.classmanager.enums.AuditActorType;
import com.classmanager.enums.AuditTargetEntity;
import com.classmanager.exception.CustomException;
import com.classmanager.repository.AuditLogRepository;
import com.classmanager.repository.UserRepository;
import com.classmanager.repository.specification.AuditLogSpecification;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    /**
     * BR-AUDIT-04 & BR-AUDIT-05:
     * Ghi nhận Audit Log đồng bộ trong cùng transaction nghiệp vụ.
     * Nếu thất bại, toàn bộ business transaction sẽ tự động rollback.
     */
    @Transactional
    public AuditLog recordAuditLog(
            AuditActorType actorType,
            Long actorId,
            String actorName,
            String actorRole,
            AuditAction action,
            AuditTargetEntity targetEntity,
            String targetId,
            Object oldValue,
            Object newValue,
            String description
    ) {
        String oldJson = serializeSnapshot(oldValue);
        String newJson = serializeSnapshot(newValue);

        String ipAddress = null;
        String userAgent = null;

        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            ipAddress = getClientIp(request);
            userAgent = request.getHeader("User-Agent");
            if (userAgent != null && userAgent.length() > 500) {
                userAgent = userAgent.substring(0, 500);
            }
        }

        AuditLog auditLog = AuditLog.builder()
                .actorType(actorType)
                .actorId(actorId)
                .actorName(actorName)
                .actorRole(actorRole)
                .action(action)
                .targetEntity(targetEntity)
                .targetId(targetId)
                .oldValue(oldJson)
                .newValue(newJson)
                .description(description)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .createdAt(LocalDateTime.now())
                .build();

        AuditLog saved = auditLogRepository.save(auditLog);
        log.debug("AuditLog saved: id={}, action={}, targetEntity={}, targetId={}",
                saved.getId(), saved.getAction(), saved.getTargetEntity(), saved.getTargetId());
        return saved;
    }

    /**
     * Helper tự động phân giải Actor từ SecurityContextHolder
     */
    @Transactional
    public AuditLog logUserAction(
            AuditAction action,
            AuditTargetEntity targetEntity,
            String targetId,
            Object oldValue,
            Object newValue,
            String description
    ) {
        Long actorId = null;
        String actorName = "Anonymous";
        String actorRole = "ANONYMOUS";

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Long id) {
            actorId = id;
            User user = userRepository.findById(id).orElse(null);
            if (user != null) {
                actorName = user.getFullName() != null ? user.getFullName() : user.getUsername();
                actorRole = user.getRole() != null ? user.getRole().name() : "PENDING_ONBOARDING";
            }
        }

        return recordAuditLog(
                AuditActorType.USER,
                actorId,
                actorName,
                actorRole,
                action,
                targetEntity,
                targetId,
                oldValue,
                newValue,
                description
        );
    }

    /**
     * Helper ghi log cho các background jobs / cron
     */
    @Transactional
    public AuditLog logSystemAction(
            AuditAction action,
            AuditTargetEntity targetEntity,
            String targetId,
            Object oldValue,
            Object newValue,
            String description
    ) {
        return recordAuditLog(
                AuditActorType.SYSTEM,
                null,
                "SYSTEM_SCHEDULER",
                "SYSTEM",
                action,
                targetEntity,
                targetId,
                oldValue,
                newValue,
                description
        );
    }

    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getAuditLogs(AuditLogFilterCriteria criteria, Pageable pageable) {
        return auditLogRepository.findAll(AuditLogSpecification.filterBy(criteria), pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public AuditLogResponse getAuditLogById(Long id) {
        AuditLog auditLog = auditLogRepository.findById(id)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "AUDIT_LOG_NOT_FOUND", "Audit log record not found with id: " + id));
        return mapToResponse(auditLog);
    }

    @Transactional(readOnly = true)
    public List<AuditActionSummary> getActionsSummary() {
        return auditLogRepository.countGroupedByAction();
    }

    private String serializeSnapshot(Object data) {
        if (data == null) {
            return null;
        }
        if (data instanceof String str) {
            return str;
        }
        try {
            return objectMapper.writeValueAsString(data);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize audit snapshot data", e);
            return null;
        }
    }

    private Object deserializeSnapshot(String json) {
        if (json == null || json.trim().isEmpty()) {
            return null;
        }
        try {
            return objectMapper.readValue(json, Object.class);
        } catch (Exception e) {
            return json;
        }
    }

    public AuditLogResponse mapToResponse(AuditLog log) {
        return AuditLogResponse.builder()
                .id(log.getId())
                .actorType(log.getActorType())
                .actorId(log.getActorId())
                .actorName(log.getActorName())
                .actorRole(log.getActorRole())
                .targetEntity(log.getTargetEntity())
                .targetId(log.getTargetId())
                .action(log.getAction())
                .oldValue(deserializeSnapshot(log.getOldValue()))
                .newValue(deserializeSnapshot(log.getNewValue()))
                .description(log.getDescription())
                .ipAddress(log.getIpAddress())
                .userAgent(log.getUserAgent())
                .createdAt(log.getCreatedAt())
                .build();
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}
