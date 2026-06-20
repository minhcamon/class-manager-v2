package com.classmanager.repository;

import com.classmanager.entity.PointLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface PointLogRepository extends JpaRepository<PointLog, Long> {

    @Query("SELECT COALESCE(SUM(p.pointValue), 0) FROM PointLog p WHERE p.student.id = :studentId AND p.classEntity.id = :classId")
    Integer sumPointValuesByStudentIdAndClassId(@Param("studentId") Integer studentId, @Param("classId") Integer classId);

    List<PointLog> findByStudentIdAndClassEntityId(Integer studentId, Integer classId);

    List<PointLog> findByClassEntityIdAndWeekStartDate(Integer classId, LocalDate weekStartDate);

    List<PointLog> findByClassEntityIdOrderByCreatedAtDesc(Integer classId);
}
