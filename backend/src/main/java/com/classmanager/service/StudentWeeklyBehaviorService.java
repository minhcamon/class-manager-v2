package com.classmanager.service;

import com.classmanager.dto.behavior.*;
import com.classmanager.entity.*;
import com.classmanager.enums.AuditAction;
import com.classmanager.enums.AuditTargetEntity;
import com.classmanager.enums.ClassStatus;
import com.classmanager.enums.Role;
import com.classmanager.exception.ClassEndedException;
import com.classmanager.exception.CustomException;
import com.classmanager.exception.ProfileNotFoundException;
import com.classmanager.exception.StudentNotInGroupException;
import com.classmanager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentWeeklyBehaviorService {

    private final StudentWeeklyBehaviorRepository behaviorRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final ClassRepository classRepository;
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final AuditLogService auditLogService;

    // Grace period for time-window policy: 14 days (or current academic year for admin)
    private static final int GRACE_PERIOD_DAYS = 14;

    @Transactional
    public BehaviorLogItemDTO createBehavior(Long currentUserId, BehaviorCreateRequest request) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found."));

        StudentProfile targetStudent = studentProfileRepository.findByIdWithRelations(request.getStudentId())
                .orElseThrow(ProfileNotFoundException::new);

        ClassEntity classEntity = classRepository.findById(request.getClassId())
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "CLASS_NOT_FOUND", "Class not found."));

        if (classEntity.getStatus() == ClassStatus.ENDED) {
            throw new ClassEndedException();
        }

        validateScoringPermission(currentUser, classEntity, targetStudent);

        int quantity = (request.getQuantity() != null && request.getQuantity() > 0) ? request.getQuantity() : 1;
        int totalPoints = request.getUnitPoint() * quantity;

        StudentWeeklyBehavior behavior = StudentWeeklyBehavior.builder()
                .studentProfile(targetStudent)
                .classEntity(classEntity)
                .academicYear(request.getAcademicYear())
                .semester(request.getSemester())
                .weekNumber(request.getWeekNumber())
                .ruleName(request.getRuleName())
                .type(request.getType())
                .unitPoint(request.getUnitPoint())
                .quantity(quantity)
                .totalPoints(totalPoints)
                .dayOfWeek(request.getDayOfWeek())
                .note(request.getNote())
                .createdByUser(currentUser)
                .build();

        StudentWeeklyBehavior saved = behaviorRepository.save(behavior);

        auditLogService.logUserAction(
                AuditAction.CREATE_POINT_LOG,
                AuditTargetEntity.POINT_LOG,
                String.valueOf(saved.getId()),
                null,
                Map.of(
                        "studentId", targetStudent.getId(),
                        "ruleName", request.getRuleName(),
                        "type", request.getType().name(),
                        "totalPoints", totalPoints,
                        "weekNumber", request.getWeekNumber()
                ),
                "Logged behavior: " + (totalPoints > 0 ? "+" : "") + totalPoints + " pts for " + request.getRuleName()
        );

        return mapToDTO(saved);
    }

    @Transactional
    public void createBehaviorsBatch(Long currentUserId, BehaviorBatchRequest request) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found."));

        ClassEntity classEntity = classRepository.findById(request.getClassId())
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "CLASS_NOT_FOUND", "Class not found."));

        if (classEntity.getStatus() == ClassStatus.ENDED) {
            throw new ClassEndedException();
        }

        List<StudentProfile> targetStudents = studentProfileRepository.findAllByIdsWithEnrollmentAndGroupAndClass(request.getStudentIds());
        if (targetStudents.size() != request.getStudentIds().size()) {
            throw new ProfileNotFoundException();
        }

        for (StudentProfile targetStudent : targetStudents) {
            validateScoringPermission(currentUser, classEntity, targetStudent);
        }

        int quantity = (request.getQuantity() != null && request.getQuantity() > 0) ? request.getQuantity() : 1;
        int totalPoints = request.getUnitPoint() * quantity;

        List<StudentWeeklyBehavior> behaviorsToSave = new ArrayList<>();
        for (StudentProfile student : targetStudents) {
            StudentWeeklyBehavior behavior = StudentWeeklyBehavior.builder()
                    .studentProfile(student)
                    .classEntity(classEntity)
                    .academicYear(request.getAcademicYear())
                    .semester(request.getSemester())
                    .weekNumber(request.getWeekNumber())
                    .ruleName(request.getRuleName())
                    .type(request.getType())
                    .unitPoint(request.getUnitPoint())
                    .quantity(quantity)
                    .totalPoints(totalPoints)
                    .dayOfWeek(request.getDayOfWeek())
                    .note(request.getNote())
                    .createdByUser(currentUser)
                    .build();
            behaviorsToSave.add(behavior);
        }

        behaviorRepository.saveAll(behaviorsToSave);

        auditLogService.logUserAction(
                AuditAction.BATCH_POINT_EVALUATION,
                AuditTargetEntity.POINT_LOG,
                "batch-" + targetStudents.size(),
                null,
                Map.of(
                        "studentCount", targetStudents.size(),
                        "ruleName", request.getRuleName(),
                        "totalPoints", totalPoints,
                        "weekNumber", request.getWeekNumber()
                ),
                "Batch logged behavior for " + targetStudents.size() + " students: " + (totalPoints > 0 ? "+" : "") + totalPoints + " pts"
        );
    }

    @Transactional
    public BehaviorLogItemDTO updateBehavior(Long currentUserId, Long behaviorId, BehaviorUpdateRequest request) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found."));

        StudentWeeklyBehavior behavior = behaviorRepository.findById(behaviorId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "BEHAVIOR_NOT_FOUND", "Behavior record not found."));

        ClassEntity classEntity = behavior.getClassEntity();
        if (classEntity.getStatus() == ClassStatus.ENDED) {
            throw new ClassEndedException();
        }

        validateEditPermissionAndTimeWindow(currentUser, behavior);

        if (request.getRuleName() != null && !request.getRuleName().isBlank()) {
            behavior.setRuleName(request.getRuleName());
        }
        if (request.getType() != null) {
            behavior.setType(request.getType());
        }
        if (request.getUnitPoint() != null) {
            behavior.setUnitPoint(request.getUnitPoint());
        }
        if (request.getQuantity() != null && request.getQuantity() > 0) {
            behavior.setQuantity(request.getQuantity());
        }
        if (request.getDayOfWeek() != null) {
            behavior.setDayOfWeek(request.getDayOfWeek());
        }
        if (request.getNote() != null) {
            behavior.setNote(request.getNote());
        }

        behavior.setTotalPoints(behavior.getUnitPoint() * behavior.getQuantity());
        StudentWeeklyBehavior saved = behaviorRepository.save(behavior);

        return mapToDTO(saved);
    }

    @Transactional
    public void deleteBehavior(Long currentUserId, Long behaviorId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found."));

        StudentWeeklyBehavior behavior = behaviorRepository.findById(behaviorId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "BEHAVIOR_NOT_FOUND", "Behavior record not found."));

        ClassEntity classEntity = behavior.getClassEntity();
        if (classEntity.getStatus() == ClassStatus.ENDED) {
            throw new ClassEndedException();
        }

        validateEditPermissionAndTimeWindow(currentUser, behavior);

        behaviorRepository.delete(behavior);
    }

    @Transactional(readOnly = true)
    public StudentWeeklyDetailResponse getStudentWeeklyDetail(
            Long currentUserId, Role role, Integer studentId, Integer classId, Integer academicYear, Integer weekNumber) {

        StudentProfile student = studentProfileRepository.findByIdWithRelations(studentId)
                .orElseThrow(ProfileNotFoundException::new);

        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "CLASS_NOT_FOUND", "Class not found."));

        validateViewPermission(currentUserId, role, classEntity, student);

        List<StudentWeeklyBehavior> logs = behaviorRepository
                .findByStudentProfileIdAndAcademicYearAndWeekNumberOrderByCreatedAtDesc(studentId, academicYear, weekNumber);

        int totalBonus = 0;
        int totalPenalty = 0;
        for (StudentWeeklyBehavior b : logs) {
            if (b.getType() == com.classmanager.enums.BehaviorType.BONUS) {
                totalBonus += b.getTotalPoints();
            } else {
                totalPenalty += b.getTotalPoints();
            }
        }
        int netScore = totalBonus + totalPenalty;

        // Total Academic Points across all weeks
        List<com.classmanager.repository.projection.StudentRankingProjection> academicTotals =
                behaviorRepository.aggregateAcademicPointsByClass(classId, academicYear);
        int totalAcademicPoints = classEntity.getBasePoint();
        for (var p : academicTotals) {
            if (p.getStudentId() != null && p.getStudentId().equals(studentId)) {
                totalAcademicPoints += p.getTotalPoints() != null ? p.getTotalPoints().intValue() : 0;
                break;
            }
        }

        String studentName = (student.getEnrollment() != null && student.getEnrollment().getUser() != null)
                ? student.getEnrollment().getUser().getFullName() : "Học sinh";
        String groupName = (student.getEnrollment() != null && student.getEnrollment().getGroup() != null)
                ? student.getEnrollment().getGroup().getGroupName() : "Chưa phân tổ";

        List<BehaviorLogItemDTO> logDTOs = logs.stream().map(this::mapToDTO).collect(Collectors.toList());

        return StudentWeeklyDetailResponse.builder()
                .studentId(studentId)
                .studentName(studentName)
                .groupName(groupName)
                .classId(classId)
                .academicYear(academicYear)
                .weekNumber(weekNumber)
                .netScore(netScore)
                .totalBonus(totalBonus)
                .totalPenalty(totalPenalty)
                .totalAcademicPoints(totalAcademicPoints)
                .logs(logDTOs)
                .build();
    }

    private void validateScoringPermission(User currentUser, ClassEntity classEntity, StudentProfile targetStudent) {
        if (currentUser.getRole() == Role.ADMIN) {
            return;
        }

        if (currentUser.getRole() == Role.TEACHER) {
            if (!classEntity.getTeacher().getId().equals(currentUser.getId())) {
                throw new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không phải giáo viên chủ nhiệm lớp này.");
            }
        } else if (currentUser.getRole() == Role.STUDENT) {
            StudentProfile currentStudentProfile = studentProfileRepository.findByUserIdAndClassId(currentUser.getId(), classEntity.getId())
                    .orElseThrow(() -> new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không thuộc lớp học này."));

            Group ownedGroup = groupRepository.findByLeaderId(currentStudentProfile.getEnrollmentId())
                    .orElseThrow(StudentNotInGroupException::new);

            Enrollment targetEnrollment = targetStudent.getEnrollment();
            if (targetEnrollment == null || targetEnrollment.getGroup() == null || !targetEnrollment.getGroup().getId().equals(ownedGroup.getId())) {
                throw new StudentNotInGroupException();
            }
        } else {
            throw new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Quyền hạn không hợp lệ.");
        }
    }

    private void validateEditPermissionAndTimeWindow(User currentUser, StudentWeeklyBehavior behavior) {
        if (currentUser.getRole() == Role.ADMIN) {
            return;
        }

        boolean isCreator = behavior.getCreatedByUser().getId().equals(currentUser.getId());
        boolean isTeacherOfClass = currentUser.getRole() == Role.TEACHER
                && behavior.getClassEntity().getTeacher().getId().equals(currentUser.getId());

        if (!isCreator && !isTeacherOfClass) {
            throw new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không có quyền thao tác trên bản ghi này.");
        }

        // Time-window policy enforcement (BR-WEEK-06)
        if (behavior.getCreatedAt() != null && behavior.getCreatedAt().plusDays(GRACE_PERIOD_DAYS).isBefore(LocalDateTime.now())) {
            throw new CustomException(HttpStatus.FORBIDDEN, "TIME_WINDOW_EXPIRED",
                    "Đã quá thời hạn cho phép chỉnh sửa điểm của tuần này (Tối đa " + GRACE_PERIOD_DAYS + " ngày). Vui lòng liên hệ Admin.");
        }
    }

    private void validateViewPermission(Long currentUserId, Role role, ClassEntity classEntity, StudentProfile targetStudent) {
        if (role == Role.ADMIN) {
            return;
        }

        if (role == Role.TEACHER) {
            if (!classEntity.getTeacher().getId().equals(currentUserId)) {
                throw new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không phải giáo viên chủ nhiệm lớp này.");
            }
        } else if (role == Role.STUDENT) {
            boolean isSelf = targetStudent.getEnrollment() != null && targetStudent.getEnrollment().getUser().getId().equals(currentUserId);
            if (!isSelf) {
                Enrollment targetEnrollment = targetStudent.getEnrollment();
                if (targetEnrollment == null || targetEnrollment.getGroup() == null) {
                    throw new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không có quyền xem điểm học sinh này.");
                }
                Group group = targetEnrollment.getGroup();
                boolean isLeaderOfGroup = group.getLeader() != null && group.getLeader().getUser().getId().equals(currentUserId);
                if (!isLeaderOfGroup) {
                    throw new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không có quyền xem điểm học sinh này.");
                }
            }
        } else {
            throw new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Quyền hạn không hợp lệ.");
        }
    }

    private BehaviorLogItemDTO mapToDTO(StudentWeeklyBehavior b) {
        String studentName = (b.getStudentProfile() != null && b.getStudentProfile().getEnrollment() != null
                && b.getStudentProfile().getEnrollment().getUser() != null)
                ? b.getStudentProfile().getEnrollment().getUser().getFullName() : "Học sinh";
        String createdByName = (b.getCreatedByUser() != null) ? b.getCreatedByUser().getFullName() : "N/A";

        return BehaviorLogItemDTO.builder()
                .id(b.getId())
                .studentId(b.getStudentProfile().getId())
                .studentName(studentName)
                .classId(b.getClassEntity().getId())
                .academicYear(b.getAcademicYear())
                .semester(b.getSemester())
                .weekNumber(b.getWeekNumber())
                .ruleName(b.getRuleName())
                .type(b.getType())
                .unitPoint(b.getUnitPoint())
                .quantity(b.getQuantity())
                .totalPoints(b.getTotalPoints())
                .dayOfWeek(b.getDayOfWeek())
                .note(b.getNote())
                .createdByUserId(b.getCreatedByUser().getId())
                .createdByName(createdByName)
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt())
                .build();
    }
}
