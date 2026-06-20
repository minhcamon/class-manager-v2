package com.classmanager.service;

import com.classmanager.dto.school.request.FormFieldDto;
import com.classmanager.dto.school.request.StudentProfileUpdateRequest;
import com.classmanager.dto.school.response.StudentProfileResponse;
import com.classmanager.entity.FormTemplate;
import com.classmanager.entity.StudentProfile;
import com.classmanager.enums.ClassStatus;
import com.classmanager.enums.Role;
import com.classmanager.exception.ClassEndedException;
import com.classmanager.exception.FormNotFoundException;
import com.classmanager.exception.InvalidFormStructureException;
import com.classmanager.exception.ProfileNotFoundException;
import com.classmanager.repository.FormTemplateRepository;
import com.classmanager.repository.StudentProfileRepository;
import com.classmanager.repository.PointLogRepository;
import com.classmanager.repository.ClassRepository;
import com.classmanager.entity.ClassEntity;
import com.classmanager.dto.school.response.ClassStudentResponse;
import com.classmanager.exception.CustomException;
import org.springframework.http.HttpStatus;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.classmanager.repository.EnrollmentRepository;
import com.classmanager.entity.Enrollment;
import com.classmanager.enums.EnrollmentStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StudentProfileService {

    private final StudentProfileRepository studentProfileRepository;
    private final FormTemplateRepository formTemplateRepository;
    private final PointLogRepository pointLogRepository;
    private final ClassRepository classRepository;
    private final ObjectMapper objectMapper;
    private final EnrollmentRepository enrollmentRepository;

    @Transactional
    public StudentProfileResponse upsertProfile(Integer enrollmentId, Integer classId, StudentProfileUpdateRequest request) {
        FormTemplate activeForm = formTemplateRepository.findByClassEntityIdAndIsActiveTrue(classId)
                .orElseThrow(FormNotFoundException::new);

        if (activeForm.getClassEntity().getStatus() == ClassStatus.ENDED) {
            throw new ClassEndedException();
        }

        validateProfileData(request.getData(), activeForm);

        StudentProfile profile = studentProfileRepository.findByEnrollmentId(enrollmentId)
                .orElse(StudentProfile.builder().enrollmentId(enrollmentId).build());

        try {
            profile.setData(objectMapper.writeValueAsString(request.getData()));
            profile.setFormTemplate(activeForm);
            
            return mapToResponse(studentProfileRepository.save(profile));
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error processing profile data JSON", e);
        }
    }

    public StudentProfileResponse getProfile(Integer enrollmentId) {
        StudentProfile profile = studentProfileRepository.findByEnrollmentId(enrollmentId)
                .orElseThrow(ProfileNotFoundException::new);
        return mapToResponse(profile);
    }

    private void validateProfileData(Map<String, Object> data, FormTemplate form) {
        try {
            List<FormFieldDto> structure = objectMapper.readValue(form.getStructure(), new TypeReference<List<FormFieldDto>>() {});
            for (FormFieldDto field : structure) {
                if (field.isRequired() && (!data.containsKey(field.getFieldName()) || data.get(field.getFieldName()) == null)) {
                    throw new InvalidFormStructureException("Field '" + field.getLabel() + "' is required");
                }
            }
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error parsing form structure JSON", e);
        }
    }

    private StudentProfileResponse mapToResponse(StudentProfile entity) {
        try {
            Map<String, Object> data = objectMapper.readValue(entity.getData(), new TypeReference<Map<String, Object>>() {});
            List<FormFieldDto> structure = objectMapper.readValue(entity.getFormTemplate().getStructure(), new TypeReference<List<FormFieldDto>>() {});
            
            return StudentProfileResponse.builder()
                    .id(entity.getId())
                    .enrollmentId(entity.getEnrollmentId())
                    .formVersionId(entity.getFormTemplate().getId())
                    .formVersion(entity.getFormTemplate().getVersion())
                    .formStructure(structure)
                    .data(data)
                    .updatedAt(entity.getUpdatedAt())
                    .build();
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error parsing profile data JSON", e);
        }
    }

    @Transactional
    public List<ClassStudentResponse> getClassStudents(Long currentUserId, Role role, Integer classId) {
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(com.classmanager.exception.ClassNotFoundException::new);

        List<Enrollment> enrollments = enrollmentRepository.findByClassEntityIdAndStatus(classId, EnrollmentStatus.ACTIVE);

        if (role == Role.TEACHER) {
            if (!classEntity.getTeacher().getId().equals(currentUserId)) {
                throw new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không phải giáo viên của lớp này.");
            }
        } else if (role == Role.STUDENT) {
            boolean isEnrolled = enrollments.stream()
                    .anyMatch(e -> e.getUser().getId().equals(currentUserId));
            if (!isEnrolled) {
                throw new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không thuộc lớp học này.");
            }
        } else {
            throw new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Quyền hạn không hợp lệ.");
        }

        FormTemplate activeForm = formTemplateRepository.findByClassEntityIdAndIsActiveTrue(classId)
                .orElseGet(() -> {
                    FormTemplate defaultForm = FormTemplate.builder()
                            .classEntity(classEntity)
                            .title("Thông tin học sinh")
                            .structure("[]")
                            .version(1)
                            .isActive(true)
                            .build();
                    return formTemplateRepository.save(defaultForm);
                });

        return enrollments.stream().map(enrollment -> {
            StudentProfile student = studentProfileRepository.findByEnrollmentId(enrollment.getId()).orElse(null);
            
            if (student == null) {
                student = StudentProfile.builder()
                        .enrollmentId(enrollment.getId())
                        .formTemplate(activeForm)
                        .data("{}")
                        .build();
                student = studentProfileRepository.save(student);
            }
            
            Integer totalDelta = 0;
            Integer basePoint = classEntity.getBasePoint() != null ? classEntity.getBasePoint() : 100;
            Integer studentProfileId = null;
            Integer groupId = null;
            String groupName = null;
            boolean isLeader = false;

            if (student != null) {
                studentProfileId = student.getId();
                totalDelta = pointLogRepository.sumPointValuesByStudentIdAndClassId(student.getId(), classId);
                if (totalDelta == null) {
                    totalDelta = 0;
                }
                groupId = student.getGroup() != null ? student.getGroup().getId() : null;
                groupName = student.getGroup() != null ? student.getGroup().getGroupName() : null;
                isLeader = student.getGroup() != null 
                        && student.getGroup().getLeader() != null 
                        && student.getGroup().getLeader().getId().equals(student.getId());
            }

            return ClassStudentResponse.builder()
                    .studentProfileId(studentProfileId)
                    .userId(enrollment.getUser().getId())
                    .fullName(enrollment.getUser().getFullName())
                    .username(enrollment.getUser().getUsername())
                    .phoneNumber(enrollment.getUser().getPhoneNumber())
                    .groupId(groupId)
                    .groupName(groupName)
                    .isLeader(isLeader)
                    .currentPoint(basePoint + totalDelta)
                    .build();
        }).collect(java.util.stream.Collectors.toList());
    }
}
