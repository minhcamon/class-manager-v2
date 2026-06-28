package com.classmanager.repository;

import com.classmanager.entity.CurrentWeekSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CurrentWeekSnapshotRepository extends JpaRepository<CurrentWeekSnapshot, Long> {

    @Query("SELECT c FROM CurrentWeekSnapshot c " +
           "JOIN FETCH c.student s " +
           "LEFT JOIN FETCH s.enrollment e " +
           "LEFT JOIN FETCH e.user u " +
           "WHERE s.id = :studentId AND c.weekStartDate = :weekStartDate")
    Optional<CurrentWeekSnapshot> findByStudentIdAndWeekStartDate(@Param("studentId") Integer studentId, @Param("weekStartDate") LocalDate weekStartDate);

    @Query("SELECT c FROM CurrentWeekSnapshot c " +
           "JOIN FETCH c.student s " +
           "LEFT JOIN FETCH s.enrollment e " +
           "LEFT JOIN FETCH e.user u " +
           "WHERE c.classEntity.id = :classId AND c.weekStartDate = :weekStartDate")
    List<CurrentWeekSnapshot> findByClassEntityIdAndWeekStartDate(@Param("classId") Integer classId, @Param("weekStartDate") LocalDate weekStartDate);

    @Query("SELECT c FROM CurrentWeekSnapshot c " +
           "JOIN FETCH c.student s " +
           "LEFT JOIN FETCH s.enrollment e " +
           "LEFT JOIN FETCH e.user u " +
           "WHERE c.classEntity.id = :classId AND c.weekStartDate = :weekStartDate " +
           "ORDER BY (c.totalBonus + c.totalPenalty) DESC, u.fullName ASC")
    List<CurrentWeekSnapshot> findWeeklyLeaderboard(@Param("classId") Integer classId, @Param("weekStartDate") LocalDate weekStartDate);

    @Query("SELECT c FROM CurrentWeekSnapshot c " +
           "JOIN FETCH c.student s " +
           "LEFT JOIN FETCH s.enrollment e " +
           "LEFT JOIN FETCH e.user u " +
           "WHERE c.classEntity.id = :classId AND c.weekStartDate = :weekStartDate " +
           "ORDER BY c.currentPoint DESC, u.fullName ASC")
    List<CurrentWeekSnapshot> findAcademicLeaderboard(@Param("classId") Integer classId, @Param("weekStartDate") LocalDate weekStartDate);

    void deleteByClassEntityIdAndWeekStartDate(Integer classId, LocalDate weekStartDate);
}
