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

    long countByClassEntityIdAndStatus(Integer classId, EnrollmentStatus status);

    java.util.List<Enrollment> findByClassEntityIdAndStatus(Integer classId, EnrollmentStatus status);

    @Query("SELECT e FROM Enrollment e JOIN FETCH e.user WHERE e.classEntity.id = :classId AND e.status = :status")
    java.util.List<Enrollment> findByClassEntityIdAndStatusWithUser(@Param("classId") Integer classId, @Param("status") EnrollmentStatus status);

    @Query("SELECT e FROM Enrollment e " +
           "JOIN FETCH e.user u " +
           "LEFT JOIN FETCH e.studentProfile sp " +
           "LEFT JOIN FETCH e.group g " +
           "LEFT JOIN FETCH g.leader l " +
           "LEFT JOIN FETCH l.studentProfile lsp " +
           "LEFT JOIN FETCH l.user lu " +
           "WHERE e.classEntity.id = :classId AND e.status = :status")
    java.util.List<Enrollment> findClassDashboardData(@Param("classId") Integer classId, @Param("status") EnrollmentStatus status);

    boolean existsByClassEntityIdAndUserIdAndStatus(Integer classId, Long userId, EnrollmentStatus status);
}
