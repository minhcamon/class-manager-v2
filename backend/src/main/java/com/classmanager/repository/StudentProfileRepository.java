package com.classmanager.repository;

import com.classmanager.entity.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface StudentProfileRepository extends JpaRepository<StudentProfile, Integer> {
    Optional<StudentProfile> findByEnrollmentId(Integer enrollmentId);
    java.util.List<StudentProfile> findByEnrollmentClassEntityId(Integer classId);

    @Query("SELECT sp FROM StudentProfile sp JOIN sp.enrollment e WHERE e.user.id = :userId AND e.classEntity.id = :classId")
    Optional<StudentProfile> findByUserIdAndClassId(@Param("userId") Long userId, @Param("classId") Integer classId);

    @Query("SELECT sp FROM StudentProfile sp " +
           "LEFT JOIN FETCH sp.enrollment e " +
           "LEFT JOIN FETCH e.group g " +
           "LEFT JOIN FETCH sp.formTemplate ft " +
           "LEFT JOIN FETCH ft.classEntity c " +
           "WHERE sp.id IN :ids")
    java.util.List<StudentProfile> findAllByIdsWithEnrollmentAndGroupAndClass(@Param("ids") java.util.Collection<Integer> ids);

    @Query("SELECT sp FROM StudentProfile sp " +
           "LEFT JOIN FETCH sp.enrollment e " +
           "LEFT JOIN FETCH e.user u " +
           "LEFT JOIN FETCH e.group g " +
           "LEFT JOIN FETCH sp.formTemplate ft " +
           "LEFT JOIN FETCH ft.classEntity c " +
           "LEFT JOIN FETCH c.teacher t " +
           "WHERE sp.id = :id")
    Optional<StudentProfile> findByIdWithRelations(@Param("id") Integer id);
}
