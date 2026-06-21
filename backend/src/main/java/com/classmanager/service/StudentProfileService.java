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
  public StudentProfileResponse upsertProfile(Integer enrollmentId, Integer classId,
      StudentProfileUpdateRequest request) {
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

  @Transactional(readOnly = true)
  public StudentProfileResponse getProfile(Integer enrollmentId) {
    StudentProfile profile = studentProfileRepository.findByEnrollmentId(enrollmentId)
        .orElseThrow(ProfileNotFoundException::new);
    return mapToResponse(profile);
  }

  private void validateProfileData(Map<String, Object> data, FormTemplate form) {
    try {
      List<FormFieldDto> structure = objectMapper.readValue(form.getStructure(),
          new TypeReference<List<FormFieldDto>>() {
          });
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
      Map<String, Object> data = objectMapper.readValue(entity.getData(), new TypeReference<Map<String, Object>>() {
      });
      List<FormFieldDto> structure = objectMapper.readValue(entity.getFormTemplate().getStructure(),
          new TypeReference<List<FormFieldDto>>() {
          });

      Enrollment enrollment = entity.getEnrollment();
      Integer groupId = (enrollment != null && enrollment.getGroup() != null) ? enrollment.getGroup().getId() : null;
      String groupName = (enrollment != null && enrollment.getGroup() != null) ? enrollment.getGroup().getGroupName()
          : null;
      boolean isLeader = enrollment != null
          && enrollment.getGroup() != null
          && enrollment.getGroup().getLeader() != null
          && enrollment.getGroup().getLeader().getId().equals(enrollment.getId());

      return StudentProfileResponse.builder()
          .id(entity.getId())
          .enrollmentId(entity.getEnrollmentId())
          .formVersionId(entity.getFormTemplate().getId())
          .formVersion(entity.getFormTemplate().getVersion())
          .formStructure(structure)
          .data(data)
          .groupId(groupId)
          .groupName(groupName)
          .isLeader(isLeader)
          .updatedAt(entity.getUpdatedAt())
          .build();
    } catch (JsonProcessingException e) {
      throw new RuntimeException("Error parsing profile data JSON", e);
    }
  }

  @Transactional(readOnly = true)
  public List<ClassStudentResponse> getClassStudents(Long currentUserId, Role role, Integer classId) {
    List<Enrollment> enrollments = enrollmentRepository.findClassDashboardData(classId, EnrollmentStatus.ACTIVE);

    if (enrollments.isEmpty()) {
      if (!classRepository.existsById(classId)) {
        throw new CustomException(HttpStatus.NOT_FOUND, "CLASS_NOT_FOUND", "Lớp học không tồn tại.");
      }
    }

    if (role == Role.STUDENT) {
      boolean isEnrolled = enrollments.stream()
          .anyMatch(e -> e.getUser().getId().equals(currentUserId));
      if (!isEnrolled) {
        throw new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không thuộc lớp học này.");
      }
    } else if (role == Role.TEACHER) {
      boolean isOwner = classRepository.existsByIdAndTeacherId(classId, currentUserId);
      if (!isOwner) {
        throw new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không phải giáo viên của lớp này.");
      }
    } else {
      throw new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Quyền hạn không hợp lệ.");
    }

    ClassEntity classEntity = enrollments.isEmpty()
        ? classRepository.findById(classId).orElseThrow(com.classmanager.exception.ClassNotFoundException::new)
        : enrollments.get(0).getClassEntity();

    List<Object[]> pointSums = pointLogRepository.sumPointValuesGroupByStudentId(classId);
    Map<Integer, Integer> pointSumMap = pointSums.stream()
        .filter(row -> row[0] != null)
        .collect(java.util.stream.Collectors.toMap(
            row -> (Integer) row[0],
            row -> row[1] != null ? ((Number) row[1]).intValue() : 0,
            (v1, v2) -> v1));

    Integer basePoint = classEntity.getBasePoint() != null ? classEntity.getBasePoint() : 100;

    return enrollments.stream().map(enrollment -> {
      StudentProfile student = enrollment.getStudentProfile();
      Integer totalDelta = (student != null) ? pointSumMap.getOrDefault(student.getId(), 0) : 0;
      Integer studentProfileId = (student != null) ? student.getId() : null;

      Integer groupId = enrollment.getGroup() != null ? enrollment.getGroup().getId() : null;
      String groupName = enrollment.getGroup() != null ? enrollment.getGroup().getGroupName() : null;
      boolean isLeader = enrollment.getGroup() != null
          && enrollment.getGroup().getLeader() != null
          && enrollment.getGroup().getLeader().getId().equals(enrollment.getId());

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
