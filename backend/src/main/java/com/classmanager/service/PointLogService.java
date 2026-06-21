package com.classmanager.service;

import com.classmanager.dto.school.request.PointLogCreateRequest;
import com.classmanager.dto.school.request.PointLogBatchRequest;
import com.classmanager.dto.school.request.PointLogUpdateRequest;
import com.classmanager.dto.school.response.PointLogResponse;
import com.classmanager.dto.school.response.StudentCurrentPointResponse;
import com.classmanager.entity.ClassEntity;
import com.classmanager.entity.Group;
import com.classmanager.entity.PointLog;
import com.classmanager.entity.StudentProfile;
import com.classmanager.entity.User;
import com.classmanager.entity.Enrollment;
import com.classmanager.enums.ClassStatus;
import com.classmanager.enums.Role;
import com.classmanager.exception.*;
import com.classmanager.repository.ClassRepository;
import com.classmanager.repository.GroupRepository;
import com.classmanager.repository.PointLogRepository;
import com.classmanager.repository.StudentProfileRepository;
import com.classmanager.repository.UserRepository;
import com.classmanager.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PointLogService {

    private final PointLogRepository pointLogRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final ClassRepository classRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Transactional
    public PointLogResponse createPointLog(Long currentUserId, PointLogCreateRequest request) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found."));

        StudentProfile targetStudent = studentProfileRepository.findById(request.getStudentId())
                .orElseThrow(ProfileNotFoundException::new);

        ClassEntity classEntity = targetStudent.getFormTemplate().getClassEntity();
        if (classEntity.getStatus() == ClassStatus.ENDED) {
            throw new ClassEndedException();
        }

        // BR-POINT-05: week_start_date must be a Monday
        if (request.getWeekStartDate().getDayOfWeek() != DayOfWeek.MONDAY) {
            throw new InvalidWeekDateException();
        }

        // BR-POINT-03: Permissions
        if (currentUser.getRole() == Role.STUDENT) {
            // To fetch the leader profile matching currentUser in this class
            StudentProfile currentStudentProfile = studentProfileRepository.findByUserIdAndClassId(currentUserId, classEntity.getId())
                    .orElseThrow(() -> new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không thuộc lớp học này."));

            Group ownedGroup = groupRepository.findByLeaderId(currentStudentProfile.getEnrollmentId())
                    .orElseThrow(() -> new StudentNotInGroupException());

            Enrollment targetEnrollment = targetStudent.getEnrollment();
            if (targetEnrollment == null || targetEnrollment.getGroup() == null || !targetEnrollment.getGroup().getId().equals(ownedGroup.getId())) {
                throw new StudentNotInGroupException();
            }
        } else if (currentUser.getRole() == Role.TEACHER) {
            if (!classEntity.getTeacher().getId().equals(currentUserId)) {
                throw new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không phải giáo viên chủ nhiệm lớp này.");
            }
        } else {
            throw new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Quyền hạn không hợp lệ.");
        }

        PointLog pointLog = PointLog.builder()
                .student(targetStudent)
                .classEntity(classEntity)
                .createdByUser(currentUser)
                .pointValue(request.getPointValue())
                .reason(request.getReason())
                .weekStartDate(request.getWeekStartDate())
                .build();

        return mapToResponse(pointLogRepository.save(pointLog));
    }

    @Transactional(readOnly = true)
    public List<PointLogResponse> getStudentPointLogs(Long currentUserId, Role role, Integer studentProfileId) {
        StudentProfile targetStudent = studentProfileRepository.findByIdWithRelations(studentProfileId)
                .orElseThrow(ProfileNotFoundException::new);

        ClassEntity classEntity = targetStudent.getFormTemplate().getClassEntity();

        // Permission check on RAM
        if (role == Role.STUDENT) {
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
        } else if (role == Role.TEACHER) {
            if (classEntity.getTeacher() == null || !classEntity.getTeacher().getId().equals(currentUserId)) {
                throw new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không phải giáo viên chủ nhiệm lớp này.");
            }
        } else {
            throw new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Quyền hạn không hợp lệ.");
        }

        return pointLogRepository.findByStudentIdAndClassEntityId(studentProfileId, classEntity.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StudentCurrentPointResponse getStudentCurrentPoint(Integer studentProfileId) {
        StudentProfile student = studentProfileRepository.findByIdWithRelations(studentProfileId)
                .orElseThrow(ProfileNotFoundException::new);

        ClassEntity classEntity = student.getFormTemplate().getClassEntity();
        Integer basePoint = classEntity.getBasePoint();
        Integer totalDelta = pointLogRepository.sumPointValuesByStudentIdAndClassId(studentProfileId, classEntity.getId());
        
        String fullName = student.getEnrollment() != null ? student.getEnrollment().getUser().getFullName() : "Học sinh";

        return StudentCurrentPointResponse.builder()
                .studentId(studentProfileId)
                .fullName(fullName)
                .basePoint(basePoint)
                .totalDelta(totalDelta)
                .currentPoint(basePoint + totalDelta)
                .build();
    }

    @Transactional
    public void createPointLogsBatch(Long currentUserId, PointLogBatchRequest request) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found."));

        // BR-POINT-05: week_start_date must be a Monday
        if (request.getWeekStartDate().getDayOfWeek() != DayOfWeek.MONDAY) {
            throw new InvalidWeekDateException();
        }

        java.util.List<StudentProfile> targetStudents = studentProfileRepository.findAllByIdsWithEnrollmentAndGroupAndClass(request.getStudentIds());
        if (targetStudents.size() != request.getStudentIds().size()) {
            throw new ProfileNotFoundException();
        }

        StudentProfile firstStudent = targetStudents.get(0);
        ClassEntity classEntity = firstStudent.getFormTemplate().getClassEntity();
        if (classEntity.getStatus() == ClassStatus.ENDED) {
            throw new ClassEndedException();
        }

        // Verify that all students belong to the same class
        for (StudentProfile student : targetStudents) {
            if (!student.getFormTemplate().getClassEntity().getId().equals(classEntity.getId())) {
                throw new CustomException(HttpStatus.BAD_REQUEST, "BAD_REQUEST", "Tất cả học sinh phải thuộc cùng một lớp học.");
            }
        }

        Group ownedGroup = null;
        boolean isStudent = currentUser.getRole() == Role.STUDENT;

        if (isStudent) {
            StudentProfile currentStudentProfile = studentProfileRepository.findByUserIdAndClassId(currentUserId, classEntity.getId())
                    .orElseThrow(() -> new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không thuộc lớp học này."));

            ownedGroup = groupRepository.findByLeaderId(currentStudentProfile.getEnrollmentId())
                    .orElseThrow(() -> new StudentNotInGroupException());
        } else if (currentUser.getRole() == Role.TEACHER) {
            if (!classEntity.getTeacher().getId().equals(currentUserId)) {
                throw new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không phải giáo viên chủ nhiệm lớp này.");
            }
        } else {
            throw new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Quyền hạn không hợp lệ.");
        }

        java.util.List<PointLog> pointLogsToSave = new java.util.ArrayList<>();
        for (StudentProfile targetStudent : targetStudents) {
            if (isStudent) {
                Enrollment targetEnrollment = targetStudent.getEnrollment();
                if (targetEnrollment == null || targetEnrollment.getGroup() == null || !targetEnrollment.getGroup().getId().equals(ownedGroup.getId())) {
                    throw new StudentNotInGroupException();
                }
            }

            PointLog pointLog = PointLog.builder()
                    .student(targetStudent)
                    .classEntity(classEntity)
                    .createdByUser(currentUser)
                    .pointValue(request.getPointValue())
                    .reason(request.getReason())
                    .weekStartDate(request.getWeekStartDate())
                    .build();

            pointLogsToSave.add(pointLog);
        }

        pointLogRepository.saveAll(pointLogsToSave);
    }

    @Transactional(readOnly = true)
    public List<PointLogResponse> getClassPointLogs(Long currentUserId, Role role, Integer classId) {
        if (role == Role.TEACHER) {
            boolean isOwner = classRepository.existsByIdAndTeacherId(classId, currentUserId);
            if (!isOwner) {
                throw new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không phải giáo viên chủ nhiệm lớp này.");
            }
        } else if (role == Role.STUDENT) {
            boolean isEnrolled = enrollmentRepository.existsByClassEntityIdAndUserIdAndStatus(classId, currentUserId, com.classmanager.enums.EnrollmentStatus.ACTIVE);
            if (!isEnrolled) {
                throw new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không thuộc lớp học này.");
            }
        } else {
            throw new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Quyền hạn không hợp lệ.");
        }

        return pointLogRepository.findByClassEntityIdOrderByCreatedAtDesc(classId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deletePointLog(Long currentUserId, Long pointLogId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found."));

        PointLog pointLog = pointLogRepository.findById(pointLogId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "POINT_LOG_NOT_FOUND", "Point log not found."));

        // Only the creator or the teacher of the class may delete
        boolean isCreator = pointLog.getCreatedByUser().getId().equals(currentUserId);
        boolean isTeacherOfClass = currentUser.getRole() == Role.TEACHER
                && pointLog.getClassEntity().getTeacher().getId().equals(currentUserId);

        if (!isCreator && !isTeacherOfClass) {
            throw new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không có quyền xóa log điểm này.");
        }

        pointLogRepository.delete(pointLog);
    }

    @Transactional
    public PointLogResponse updatePointLog(Long currentUserId, Long pointLogId, PointLogUpdateRequest request) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found."));

        PointLog pointLog = pointLogRepository.findById(pointLogId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "POINT_LOG_NOT_FOUND", "Point log not found."));

        // Only the creator or the teacher of the class may edit
        boolean isCreator = pointLog.getCreatedByUser().getId().equals(currentUserId);
        boolean isTeacherOfClass = currentUser.getRole() == Role.TEACHER
                && pointLog.getClassEntity().getTeacher().getId().equals(currentUserId);

        if (!isCreator && !isTeacherOfClass) {
            throw new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không có quyền chỉnh sửa log điểm này.");
        }

        if (request.getPointValue() != null) {
            pointLog.setPointValue(request.getPointValue());
        }
        if (request.getReason() != null) {
            pointLog.setReason(request.getReason());
        }

        return mapToResponse(pointLogRepository.save(pointLog));
    }

    private PointLogResponse mapToResponse(PointLog log) {
        String studentName = null;
        if (log.getStudent() != null && log.getStudent().getEnrollment() != null
                && log.getStudent().getEnrollment().getUser() != null) {
            studentName = log.getStudent().getEnrollment().getUser().getFullName();
        }
        return PointLogResponse.builder()
                .id(log.getId())
                .studentId(log.getStudent().getId())
                .studentName(studentName)
                .pointValue(log.getPointValue())
                .reason(log.getReason())
                .weekStartDate(log.getWeekStartDate())
                .createdByUserId(log.getCreatedByUser().getId())
                .createdByName(log.getCreatedByUser().getFullName())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
