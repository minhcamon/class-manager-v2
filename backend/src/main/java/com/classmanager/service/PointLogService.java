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
import com.classmanager.enums.ClassStatus;
import com.classmanager.enums.Role;
import com.classmanager.exception.*;
import com.classmanager.repository.ClassRepository;
import com.classmanager.repository.GroupRepository;
import com.classmanager.repository.PointLogRepository;
import com.classmanager.repository.StudentProfileRepository;
import com.classmanager.repository.UserRepository;
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
            StudentProfile currentStudentProfile = studentProfileRepository.findAll().stream()
                    .filter(sp -> sp.getEnrollment() != null && sp.getEnrollment().getUser().getId().equals(currentUserId) 
                            && sp.getEnrollment().getClassEntity().getId().equals(classEntity.getId()))
                    .findFirst()
                    .orElseThrow(() -> new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không thuộc lớp học này."));

            Group ownedGroup = groupRepository.findByLeaderId(currentStudentProfile.getId())
                    .orElseThrow(() -> new StudentNotInGroupException());

            if (targetStudent.getGroup() == null || !targetStudent.getGroup().getId().equals(ownedGroup.getId())) {
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
    public List<PointLogResponse> getStudentPointLogs(Long currentUserId, Integer studentProfileId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found."));

        StudentProfile targetStudent = studentProfileRepository.findById(studentProfileId)
                .orElseThrow(ProfileNotFoundException::new);

        ClassEntity classEntity = targetStudent.getFormTemplate().getClassEntity();

        // Permission check
        if (currentUser.getRole() == Role.STUDENT) {
            StudentProfile currentStudentProfile = studentProfileRepository.findAll().stream()
                    .filter(sp -> sp.getEnrollment() != null && sp.getEnrollment().getUser().getId().equals(currentUserId) 
                            && sp.getEnrollment().getClassEntity().getId().equals(classEntity.getId()))
                    .findFirst()
                    .orElseThrow(() -> new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không thuộc lớp học này."));

            if (!currentStudentProfile.getId().equals(studentProfileId)) {
                // If not self, check if group leader of target student
                Group ownedGroup = groupRepository.findByLeaderId(currentStudentProfile.getId()).orElse(null);
                if (ownedGroup == null || targetStudent.getGroup() == null || !targetStudent.getGroup().getId().equals(ownedGroup.getId())) {
                    throw new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không có quyền xem điểm học sinh này.");
                }
            }
        } else if (currentUser.getRole() == Role.TEACHER) {
            if (!classEntity.getTeacher().getId().equals(currentUserId)) {
                throw new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không phải giáo viên chủ nhiệm lớp này.");
            }
        }

        return pointLogRepository.findByStudentIdAndClassEntityId(studentProfileId, classEntity.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StudentCurrentPointResponse getStudentCurrentPoint(Integer studentProfileId) {
        StudentProfile student = studentProfileRepository.findById(studentProfileId)
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

        for (Integer studentId : request.getStudentIds()) {
            StudentProfile targetStudent = studentProfileRepository.findById(studentId)
                    .orElseThrow(ProfileNotFoundException::new);

            ClassEntity classEntity = targetStudent.getFormTemplate().getClassEntity();
            if (classEntity.getStatus() == ClassStatus.ENDED) {
                throw new ClassEndedException();
            }

            // BR-POINT-03: Permissions
            if (currentUser.getRole() == Role.STUDENT) {
                StudentProfile currentStudentProfile = studentProfileRepository.findAll().stream()
                        .filter(sp -> sp.getEnrollment() != null && sp.getEnrollment().getUser().getId().equals(currentUserId) 
                                && sp.getEnrollment().getClassEntity().getId().equals(classEntity.getId()))
                        .findFirst()
                        .orElseThrow(() -> new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không thuộc lớp học này."));

                Group ownedGroup = groupRepository.findByLeaderId(currentStudentProfile.getId())
                        .orElseThrow(() -> new StudentNotInGroupException());

                if (targetStudent.getGroup() == null || !targetStudent.getGroup().getId().equals(ownedGroup.getId())) {
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

            pointLogRepository.save(pointLog);
        }
    }

    @Transactional(readOnly = true)
    public List<PointLogResponse> getClassPointLogs(Long currentUserId, Integer classId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found."));

        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "CLASS_NOT_FOUND", "Class not found."));

        // Only teacher of this class or group leaders within the class may read logs
        if (currentUser.getRole() == Role.TEACHER) {
            if (!classEntity.getTeacher().getId().equals(currentUserId)) {
                throw new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không phải giáo viên chủ nhiệm lớp này.");
            }
        } else if (currentUser.getRole() == Role.STUDENT) {
            studentProfileRepository.findAll().stream()
                    .filter(sp -> sp.getEnrollment() != null && sp.getEnrollment().getUser().getId().equals(currentUserId)
                            && sp.getEnrollment().getClassEntity().getId().equals(classId))
                    .findFirst()
                    .orElseThrow(() -> new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không thuộc lớp học này."));
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
