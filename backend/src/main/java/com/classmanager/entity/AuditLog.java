package com.classmanager.entity;

import com.classmanager.enums.AuditAction;
import com.classmanager.enums.AuditActorType;
import com.classmanager.enums.AuditTargetEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "audit_logs",
        indexes = {
                @Index(name = "idx_audit_logs_actor", columnList = "actor_id"),
                @Index(name = "idx_audit_logs_action", columnList = "action"),
                @Index(name = "idx_audit_logs_target", columnList = "target_entity, target_id"),
                @Index(name = "idx_audit_logs_created_at", columnList = "created_at")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "actor_type", nullable = false, length = 20)
    private AuditActorType actorType;

    @Column(name = "actor_id")
    private Long actorId;

    @Column(name = "actor_name", length = 100)
    private String actorName;

    @Column(name = "actor_role", length = 50)
    private String actorRole;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_entity", nullable = false, length = 50)
    private AuditTargetEntity targetEntity;

    @Column(name = "target_id", length = 100)
    private String targetId;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false, length = 50)
    private AuditAction action;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "old_value", columnDefinition = "jsonb")
    private String oldValue;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "new_value", columnDefinition = "jsonb")
    private String newValue;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "ip_address", length = 100)
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}
