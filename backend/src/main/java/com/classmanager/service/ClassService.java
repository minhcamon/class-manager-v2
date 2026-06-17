package com.classmanager.service;

import com.classmanager.dto.school.request.ClassCreateRequest;
import com.classmanager.dto.school.response.ClassResponse;
import com.classmanager.entity.ClassEntity;
import com.classmanager.entity.School;
import com.classmanager.entity.User;
import com.classmanager.enums.ClassStatus;
import com.classmanager.exception.ActiveClassExistsException;
import com.classmanager.exception.ClassNotFoundException;
import com.classmanager.repository.ClassRepository;
import com.classmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClassService {

    private final ClassRepository classRepository;
    private final UserRepository userRepository;

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

        ClassEntity classEntity = ClassEntity.builder()
                .className(request.getClassName())
                .grade(request.getGrade())
                .teacher(teacher)
                .school(teacher.getSchool())
                .status(ClassStatus.ACTIVE)
                .basePoint(request.getBasePoint())
                .build();

        ClassEntity savedClass = classRepository.save(classEntity);
        return mapToResponse(savedClass);
    }

    @Transactional
    public ClassResponse endClass(Long teacherId, Integer classId) {
        ClassEntity classEntity = classRepository.findByIdAndTeacherId(classId, teacherId)
                .orElseThrow(ClassNotFoundException::new);

        classEntity.setStatus(ClassStatus.ENDED);
        return mapToResponse(classRepository.save(classEntity));
    }

    public ClassResponse getClassById(Integer classId) {
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(ClassNotFoundException::new);
        return mapToResponse(classEntity);
    }

    public ClassResponse getActiveClassByTeacher(Long teacherId) {
        ClassEntity classEntity = classRepository.findByTeacherIdAndStatus(teacherId, ClassStatus.ACTIVE)
                .orElse(null);
        if (classEntity == null) {
            return null;
        }
        return mapToResponse(classEntity);
    }

    private ClassResponse mapToResponse(ClassEntity entity) {
        return ClassResponse.builder()
                .id(entity.getId())
                .className(entity.getClassName())
                .grade(entity.getGrade())
                .status(entity.getStatus())
                .basePoint(entity.getBasePoint())
                .teacherId(entity.getTeacher().getId())
                .schoolId(entity.getSchool().getId())
                .schoolName(entity.getSchool().getName())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
