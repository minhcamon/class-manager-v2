package com.classmanager.repository;

import com.classmanager.entity.StudentWeeklyBehavior;
import com.classmanager.repository.projection.StudentRankingProjection;
import com.classmanager.repository.projection.StudentWeekAggregatedProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentWeeklyBehaviorRepository extends JpaRepository<StudentWeeklyBehavior, Long> {

    @Query("SELECT b.studentProfile.id AS studentId, " +
           "b.weekNumber AS weekNumber, " +
           "COALESCE(SUM(CASE WHEN b.type = com.classmanager.enums.BehaviorType.BONUS THEN b.totalPoints ELSE 0 END), 0) AS totalBonus, " +
           "COALESCE(SUM(CASE WHEN b.type = com.classmanager.enums.BehaviorType.PENALTY THEN b.totalPoints ELSE 0 END), 0) AS totalPenalty, " +
           "COALESCE(SUM(b.totalPoints), 0) AS netScore, " +
           "COUNT(b.id) AS logCount " +
           "FROM StudentWeeklyBehavior b " +
           "WHERE b.classEntity.id = :classId " +
           "  AND b.academicYear = :academicYear " +
           "  AND b.weekNumber BETWEEN :fromWeek AND :toWeek " +
           "GROUP BY b.studentProfile.id, b.weekNumber")
    List<StudentWeekAggregatedProjection> aggregateMatrix(
            @Param("classId") Integer classId,
            @Param("academicYear") Integer academicYear,
            @Param("fromWeek") Integer fromWeek,
            @Param("toWeek") Integer toWeek);

    @Query("SELECT b.studentProfile.id AS studentId, " +
           "COALESCE(SUM(b.totalPoints), 0) AS totalPoints " +
           "FROM StudentWeeklyBehavior b " +
           "WHERE b.classEntity.id = :classId " +
           "  AND b.academicYear = :academicYear " +
           "GROUP BY b.studentProfile.id")
    List<StudentRankingProjection> aggregateAcademicPointsByClass(
            @Param("classId") Integer classId,
            @Param("academicYear") Integer academicYear);

    @Query("SELECT b.studentProfile.id AS studentId, " +
           "COALESCE(SUM(b.totalPoints), 0) AS totalPoints " +
           "FROM StudentWeeklyBehavior b " +
           "WHERE b.classEntity.id = :classId " +
           "  AND b.academicYear = :academicYear " +
           "  AND b.weekNumber = :weekNumber " +
           "GROUP BY b.studentProfile.id")
    List<StudentRankingProjection> aggregateWeeklyPointsByClassAndWeek(
            @Param("classId") Integer classId,
            @Param("academicYear") Integer academicYear,
            @Param("weekNumber") Integer weekNumber);

    List<StudentWeeklyBehavior> findByStudentProfileIdAndAcademicYearAndWeekNumberOrderByCreatedAtDesc(
            Integer studentProfileId, Integer academicYear, Integer weekNumber);

    List<StudentWeeklyBehavior> findByClassEntityIdAndAcademicYearAndWeekNumberOrderByCreatedAtDesc(
            Integer classId, Integer academicYear, Integer weekNumber);
}
