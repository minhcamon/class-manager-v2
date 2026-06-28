package com.classmanager.repository;

import com.classmanager.entity.ClassEntity;
import com.classmanager.enums.ClassStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ClassRepository extends JpaRepository<ClassEntity, Integer> {
  List<ClassEntity> findByStatus(ClassStatus status);

  boolean existsByTeacherIdAndStatus(Long teacherId, ClassStatus status);

  Optional<ClassEntity> findByTeacherIdAndStatus(Long teacherId, ClassStatus status);

  Optional<ClassEntity> findByIdAndTeacherId(Integer id, Long teacherId);

  boolean existsByIdAndTeacherId(Integer id, Long teacherId);

  Optional<ClassEntity> findByClassCodeAndStatus(String classCode, ClassStatus status);

  boolean existsBySchoolIdAndClassNameAndStatus(Long schoolId, String className, ClassStatus status);

  @Query("SELECT c FROM ClassEntity c JOIN FETCH c.teacher t JOIN FETCH c.school s WHERE c.id = :id")
  Optional<ClassEntity> findByIdWithTeacherAndSchool(@Param("id") Integer id);

  @Query("SELECT c FROM ClassEntity c JOIN FETCH c.teacher t JOIN FETCH c.school s WHERE t.id = :teacherId AND c.status = :status")
  Optional<ClassEntity> findByTeacherIdAndStatusWithTeacherAndSchool(@Param("teacherId") Long teacherId, @Param("status") ClassStatus status);

  @Query("SELECT c FROM ClassEntity c JOIN FETCH c.teacher t JOIN FETCH c.school s WHERE c.id = :id AND t.id = :teacherId")
  Optional<ClassEntity> findByIdAndTeacherIdWithTeacherAndSchool(@Param("id") Integer id, @Param("teacherId") Long teacherId);

  @Query("SELECT c FROM ClassEntity c JOIN FETCH c.teacher t WHERE c.id = :id")
  Optional<ClassEntity> findByIdWithTeacher(@Param("id") Integer id);
}
