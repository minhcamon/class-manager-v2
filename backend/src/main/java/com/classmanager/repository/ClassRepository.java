package com.classmanager.repository;

import com.classmanager.entity.ClassEntity;
import com.classmanager.enums.ClassStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ClassRepository extends JpaRepository<ClassEntity, Integer> {
    boolean existsByTeacherIdAndStatus(Long teacherId, ClassStatus status);
    Optional<ClassEntity> findByTeacherIdAndStatus(Long teacherId, ClassStatus status);
    Optional<ClassEntity> findByIdAndTeacherId(Integer id, Long teacherId);
    Optional<ClassEntity> findByClassCodeAndStatus(String classCode, ClassStatus status);
}
