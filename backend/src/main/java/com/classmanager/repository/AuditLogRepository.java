package com.classmanager.repository;

import com.classmanager.dto.audit.AuditActionSummary;
import com.classmanager.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long>, JpaSpecificationExecutor<AuditLog> {

    @Query("SELECT new com.classmanager.dto.audit.AuditActionSummary(a.action, COUNT(a)) FROM AuditLog a GROUP BY a.action ORDER BY COUNT(a) DESC")
    List<AuditActionSummary> countGroupedByAction();
}
