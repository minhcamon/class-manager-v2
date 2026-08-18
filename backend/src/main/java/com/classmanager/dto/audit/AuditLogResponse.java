package com.classmanager.dto.audit;

import com.classmanager.enums.AuditAction;
import com.classmanager.enums.AuditActorType;
import com.classmanager.enums.AuditTargetEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {
    private Long id;
    private AuditActorType actorType;
    private Long actorId;
    private String actorName;
    private String actorRole;
    private AuditTargetEntity targetEntity;
    private String targetId;
    private AuditAction action;
    private Object oldValue;
    private Object newValue;
    private String description;
    private String ipAddress;
    private String userAgent;
    private LocalDateTime createdAt;
}
