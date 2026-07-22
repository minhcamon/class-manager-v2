package com.classmanager.repository;

import com.classmanager.entity.AiRequestLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AiRequestLogRepository extends JpaRepository<AiRequestLog, Long> {
}
