package com.classmanager.repository;

import com.classmanager.entity.TeacherRoleRequest;
import com.classmanager.enums.TeacherRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeacherRoleRequestRepository extends JpaRepository<TeacherRoleRequest, Long> {

    @EntityGraph(attributePaths = {"user", "user.school", "reviewedBy"})
    Page<TeacherRoleRequest> findByStatus(TeacherRequestStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"user", "user.school", "reviewedBy"})
    @Query("SELECT r FROM TeacherRoleRequest r ORDER BY r.requestedAt DESC")
    Page<TeacherRoleRequest> findAllWithDetails(Pageable pageable);

    boolean existsByUserIdAndStatus(Long userId, TeacherRequestStatus status);

    @EntityGraph(attributePaths = {"user", "user.school", "reviewedBy"})
    Optional<TeacherRoleRequest> findTopByUserIdOrderByRequestedAtDesc(Long userId);

    @EntityGraph(attributePaths = {"user", "user.school", "reviewedBy"})
    List<TeacherRoleRequest> findByUserIdOrderByRequestedAtDesc(Long userId);

    long countByStatus(TeacherRequestStatus status);
}
