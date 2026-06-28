package com.classmanager.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "current_week_snapshots", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "week_start_date"})
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CurrentWeekSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private StudentProfile student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private ClassEntity classEntity;

    @Column(name = "week_start_date", nullable = false)
    private LocalDate weekStartDate;

    @Column(name = "current_point", nullable = false)
    private Integer currentPoint;

    @Column(name = "total_bonus", nullable = false)
    private Integer totalBonus;

    @Column(name = "total_penalty", nullable = false)
    private Integer totalPenalty;

    @Column(name = "class_rank")
    private Integer classRank;

    @Column(name = "group_rank")
    private Integer groupRank;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
