package com.classmanager.dto.audit;

import com.classmanager.enums.AuditAction;
import com.classmanager.enums.AuditActorType;
import com.classmanager.enums.AuditTargetEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogFilterCriteria {
    private Long actorId;
    private AuditActorType actorType;
    private AuditAction action;
    private AuditTargetEntity targetEntity;
    private String targetId;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime fromDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime toDate;
}
