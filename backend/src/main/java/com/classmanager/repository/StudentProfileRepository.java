package com.classmanager.repository;

import com.classmanager.entity.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StudentProfileRepository extends JpaRepository<StudentProfile, Integer> {
    Optional<StudentProfile> findByEnrollmentId(Integer enrollmentId);
}
