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

    @Query("SELECT p FROM PointLog p " +
           "LEFT JOIN FETCH p.student s " +
           "LEFT JOIN FETCH s.enrollment e " +
           "LEFT JOIN FETCH e.user u " +
           "LEFT JOIN FETCH p.createdByUser c " +
           "WHERE s.id = :studentId AND p.classEntity.id = :classId")
    List<PointLog> findByStudentIdAndClassEntityId(@Param("studentId") Integer studentId, @Param("classId") Integer classId);

    List<PointLog> findByClassEntityIdAndWeekStartDate(Integer classId, LocalDate weekStartDate);

    @Query("SELECT p FROM PointLog p " +
           "LEFT JOIN FETCH p.student s " +
           "LEFT JOIN FETCH s.enrollment e " +
           "LEFT JOIN FETCH e.user u " +
           "LEFT JOIN FETCH p.createdByUser c " +
           "WHERE p.classEntity.id = :classId " +
           "ORDER BY p.createdAt DESC")
    List<PointLog> findByClassEntityIdOrderByCreatedAtDesc(@Param("classId") Integer classId);

    @Query("SELECT p.student.id, COALESCE(SUM(p.pointValue), 0) FROM PointLog p " +
           "WHERE p.classEntity.id = :classId " +
           "GROUP BY p.student.id")
    List<Object[]> sumPointValuesGroupByStudentId(@Param("classId") Integer classId);

    @Query("SELECT COALESCE(SUM(p.pointValue), 0) FROM PointLog p " +
           "WHERE p.student.id = :studentId AND p.classEntity.id = :classId " +
           "AND p.weekStartDate = :weekStartDate AND p.pointValue > 0")
    Integer sumBonusByStudentIdAndClassIdAndWeek(@Param("studentId") Integer studentId, @Param("classId") Integer classId, @Param("weekStartDate") LocalDate weekStartDate);

    @Query("SELECT COALESCE(SUM(p.pointValue), 0) FROM PointLog p " +
           "WHERE p.student.id = :studentId AND p.classEntity.id = :classId " +
           "AND p.weekStartDate = :weekStartDate AND p.pointValue < 0")
    Integer sumPenaltyByStudentIdAndClassIdAndWeek(@Param("studentId") Integer studentId, @Param("classId") Integer classId, @Param("weekStartDate") LocalDate weekStartDate);
}
