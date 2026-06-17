package com.classmanager.service;

import com.classmanager.dto.school.request.JoinClassRequest;
import com.classmanager.dto.school.response.EnrollmentResponse;
import com.classmanager.entity.ClassEntity;
import com.classmanager.entity.Enrollment;
import com.classmanager.entity.User;
import com.classmanager.enums.ClassStatus;
import com.classmanager.enums.EnrollmentStatus;
import com.classmanager.exception.CustomException;
import com.classmanager.repository.ClassRepository;
import com.classmanager.repository.EnrollmentRepository;
import com.classmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final ClassRepository classRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public EnrollmentResponse joinClass(Long studentId, JoinClassRequest request) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Student not found"));

        if (enrollmentRepository.findByUserId(studentId).isPresent()) {
            throw new CustomException(HttpStatus.CONFLICT, "ALREADY_ENROLLED", "Student is already enrolled in a class");
        }

        ClassEntity classEntity = classRepository.findByClassCodeAndStatus(request.getClassCode(), ClassStatus.ACTIVE)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "CLASS_NOT_FOUND", "Class not found or not active"));

        if (!passwordEncoder.matches(request.getClassPassword(), classEntity.getClassPasswordHash())) {
            throw new CustomException(HttpStatus.UNAUTHORIZED, "INVALID_PASSWORD", "Invalid class password");
        }

        Enrollment enrollment = Enrollment.builder()
                .user(student)
                .classEntity(classEntity)
                .status(EnrollmentStatus.ACTIVE)
                .build();

        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);

        return EnrollmentResponse.builder()
                .id(savedEnrollment.getId())
                .studentId(student.getId())
                .classId(classEntity.getId())
                .status(savedEnrollment.getStatus().name())
                .createdAt(savedEnrollment.getCreatedAt())
                .build();
    }
}
