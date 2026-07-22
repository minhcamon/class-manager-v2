package com.classmanager.service;

import com.classmanager.dto.school.request.ClassCreateRequest;
import com.classmanager.dto.school.response.ClassResponse;
import com.classmanager.entity.ClassEntity;
import com.classmanager.entity.User;
import com.classmanager.enums.ClassStatus;
import com.classmanager.exception.ActiveClassExistsException;
import com.classmanager.exception.ClassNotFoundException;
import com.classmanager.repository.ClassRepository;
import com.classmanager.repository.UserRepository;
import com.classmanager.repository.EnrollmentRepository;
import com.classmanager.enums.EnrollmentStatus;
import com.classmanager.exception.CustomException;
import org.springframework.http.HttpStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.classmanager.repository.FormTemplateRepository;
import com.classmanager.entity.FormTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClassService {

    private final ClassRepository classRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final FormTemplateRepository formTemplateRepository;

    @Transactional
    public ClassResponse createClass(Long teacherId, ClassCreateRequest request) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        if (teacher.getSchool() == null) {
            throw new RuntimeException("PROFILE_INCOMPLETE: Teacher must belong to a school");
        }

        if (classRepository.existsByTeacherIdAndStatus(teacherId, ClassStatus.ACTIVE)) {
            throw new ActiveClassExistsException();
        }

        if (classRepository.existsBySchoolIdAndClassNameAndStatus(teacher.getSchool().getId(), request.getClassName(), ClassStatus.ACTIVE)) {
            throw new CustomException(HttpStatus.CONFLICT, "DUPLICATE_CLASS_NAME", "Lớp học '" + request.getClassName() + "' đã tồn tại trong trường học.");
        }

        // Generate 6-character random class code
        String rawCode = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        
        // Generate random 8-character class password
        String rawPassword = generateRandomPassword();
        String classPasswordHash = passwordEncoder.encode(rawPassword);

        ClassEntity classEntity = ClassEntity.builder()
                .className(request.getClassName())
                .grade(request.getGrade())
                .teacher(teacher)
                .school(teacher.getSchool())
                .status(ClassStatus.ACTIVE)
                .basePoint(request.getBasePoint())
                .classCode(rawCode)
                .classPassword(rawPassword)
                .classPasswordHash(classPasswordHash)
                .build();

        ClassEntity savedClass = classRepository.save(classEntity);

        FormTemplate defaultForm = FormTemplate.builder()
                .classEntity(savedClass)
                .title("Thông tin học sinh")
                .structure("[]")
                .version(1)
                .isActive(true)
                .build();
        formTemplateRepository.save(defaultForm);

        return mapToResponse(savedClass);
    }

    @Transactional
    public ClassResponse endClass(Long teacherId, Integer classId) {
        ClassEntity classEntity = classRepository.findByIdAndTeacherIdWithTeacherAndSchool(classId, teacherId)
                .orElseThrow(ClassNotFoundException::new);

        classEntity.setStatus(ClassStatus.ENDED);
        return mapToResponse(classRepository.save(classEntity));
    }

    @Transactional(readOnly = true)
    public ClassResponse getClassById(Integer classId) {
        ClassEntity classEntity = classRepository.findByIdWithTeacherAndSchool(classId)
                .orElseThrow(ClassNotFoundException::new);
        return mapToResponse(classEntity);
    }

    @Transactional(readOnly = true)
    public ClassResponse getActiveClassByTeacher(Long teacherId) {
        ClassEntity classEntity = classRepository.findByTeacherIdAndStatusWithTeacherAndSchool(teacherId, ClassStatus.ACTIVE)
                .orElse(null);
        if (classEntity == null) {
            return null;
        }
        return mapToResponse(classEntity);
    }

    private ClassResponse mapToResponse(ClassEntity entity) {
        long studentCount = enrollmentRepository.countByClassEntityIdAndStatus(entity.getId(), EnrollmentStatus.ACTIVE);

        return ClassResponse.builder()
                .id(entity.getId())
                .className(entity.getClassName())
                .grade(entity.getGrade())
                .status(entity.getStatus())
                .basePoint(entity.getBasePoint())
                .teacherId(entity.getTeacher().getId())
                .teacherName(entity.getTeacher().getFullName())
                .schoolId(entity.getSchool().getId())
                .schoolName(entity.getSchool().getName())
                .classCode(entity.getClassCode())
                .classPassword(entity.getClassPassword() != null ? entity.getClassPassword() : "123456")
                .studentCount(studentCount)
                .createdAt(entity.getCreatedAt())
                .build();
    }

    private String generateRandomPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        java.security.SecureRandom random = new java.security.SecureRandom();
        StringBuilder sb = new StringBuilder(8);
        for (int i = 0; i < 8; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
