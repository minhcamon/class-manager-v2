package com.classmanager.entity;

import com.classmanager.enums.ClassStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "classes")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "class_name", nullable = false, length = 50)
    private String className;

    @Column(name = "grade", nullable = false)
    private Integer grade;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 10)
    @Builder.Default
    private ClassStatus status = ClassStatus.ACTIVE;

    @Column(name = "base_point", nullable = false)
    @Builder.Default
    private Integer basePoint = 100;

    @Column(name = "class_code", nullable = false, length = 20, unique = true)
    private String classCode;

    @Column(name = "class_password_hash", nullable = false, length = 100)
    private String classPasswordHash;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
