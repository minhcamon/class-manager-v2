package com.classmanager.repository;

import com.classmanager.entity.WeeklyReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface WeeklyReportRepository extends JpaRepository<WeeklyReport, Long> {

    Optional<WeeklyReport> findByStudentIdAndWeekStartDate(Integer studentId, LocalDate weekStartDate);

    @Query("SELECT w FROM WeeklyReport w " +
           "JOIN FETCH w.student s " +
           "LEFT JOIN FETCH s.enrollment e " +
           "LEFT JOIN FETCH e.user u " +
           "WHERE w.classEntity.id = :classId AND w.weekStartDate = :weekStartDate " +
           "ORDER BY w.classRank ASC")
    List<WeeklyReport> findByClassEntityIdAndWeekStartDate(@Param("classId") Integer classId, @Param("weekStartDate") LocalDate weekStartDate);

    @Query("SELECT DISTINCT w.weekStartDate FROM WeeklyReport w " +
           "WHERE w.classEntity.id = :classId " +
           "ORDER BY w.weekStartDate DESC")
    List<LocalDate> findLockedWeeksByClassId(@Param("classId") Integer classId);

    @Query("SELECT w FROM WeeklyReport w " +
           "JOIN FETCH w.student s " +
           "LEFT JOIN FETCH s.enrollment e " +
           "LEFT JOIN FETCH e.user u " +
           "WHERE s.id = :studentId " +
           "ORDER BY w.weekStartDate DESC")
    List<WeeklyReport> findByStudentIdOrderByWeekStartDateDesc(@Param("studentId") Integer studentId);

    boolean existsByClassEntityIdAndWeekStartDate(Integer classId, LocalDate weekStartDate);
}
