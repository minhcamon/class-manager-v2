package com.classmanager.repository;

import com.classmanager.entity.Enrollment;
import com.classmanager.enums.EnrollmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Integer> {
    Optional<Enrollment> findByUserId(Long userId);
    
    @Query("SELECT e FROM Enrollment e JOIN FETCH e.classEntity WHERE e.user.id = :userId")
    Optional<Enrollment> findByUserIdWithClass(@Param("userId") Long userId);
}
