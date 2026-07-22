package com.classmanager.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_request_logs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiRequestLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id")
    private Long studentId;

    @Column(name = "class_id", nullable = false)
    private Long classId;

    @Column(name = "provider", nullable = false, length = 50)
    private String provider; // e.g., 'gemini-2.0-flash', 'gpt-4o-mini', 'rule-based'

    @Column(name = "key_masked", length = 50)
    private String keyMasked;

    @Column(name = "status", nullable = false, length = 20)
    private String status; // 'SUCCESS', 'RATE_LIMITED', 'TIMEOUT', 'FALLBACK', 'ERROR'

    @Column(name = "latency_ms")
    private Long latencyMs;

    @Column(name = "created_by_username", length = 50)
    private String createdByUsername;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
