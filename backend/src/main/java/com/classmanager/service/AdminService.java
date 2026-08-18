package com.classmanager.service;

import com.classmanager.dto.admin.AdminDTOs.*;
import com.classmanager.entity.ClassEntity;
import com.classmanager.entity.Enrollment;
import com.classmanager.entity.User;
import com.classmanager.enums.Role;
import com.classmanager.enums.TeacherRequestStatus;
import com.classmanager.exception.CustomException;
import com.classmanager.repository.*;
import com.classmanager.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final SchoolRepository schoolRepository;
    private final ClassRepository classRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final TeacherRoleRequestRepository teacherRoleRequestRepository;
    private final TeacherApprovalEngine teacherApprovalEngine;
    private final SystemHealthService systemHealthService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional(readOnly = true)
    public Page<AdminUserSearchResponse> searchUsers(String query, Role role, Pageable pageable) {
        Page<User> usersPage;
        String q = (query != null && !query.trim().isEmpty()) ? "%" + query.trim().toLowerCase() + "%" : null;

        if (q != null && role != null) {
            usersPage = userRepository.searchByQueryAndRole(q, role, pageable);
        } else if (q != null) {
            usersPage = userRepository.searchByQuery(q, pageable);
        } else if (role != null) {
            usersPage = userRepository.findByRole(role, pageable);
        } else {
            usersPage = userRepository.findAll(pageable);
        }

        return usersPage.map(user -> {
            TeacherRequestStatus reqStatus = null;
            if (user.getRole() == null) {
                reqStatus = teacherRoleRequestRepository.findTopByUserIdOrderByRequestedAtDesc(user.getId())
                        .map(r -> r.getStatus())
                        .orElse(null);
            }

            return AdminUserSearchResponse.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .fullName(user.getFullName())
                    .googleEmail(user.getGoogleEmail())
                    .phoneNumber(user.getPhoneNumber())
                    .role(user.getRole())
                    .schoolName(user.getSchool() != null ? user.getSchool().getName() : null)
                    .schoolId(user.getSchool() != null ? user.getSchool().getId() : null)
                    .avatarUrl(user.getAvatarUrl())
                    .teacherRequestStatus(reqStatus)
                    .createdAt(user.getCreatedAt())
                    .build();
        });
    }

    @Transactional(readOnly = true)
    public AdminUserDetailResponse getUserDetail(Long userId) {
        User user = userRepository.findByIdWithSchool(userId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found with id: " + userId));

        List<TeacherRequestResponse> teacherRequests = teacherRoleRequestRepository.findByUserIdOrderByRequestedAtDesc(userId)
                .stream()
                .map(teacherApprovalEngine::mapToResponse)
                .collect(Collectors.toList());

        List<ManagedClassSummary> managedClasses = List.of();
        if (user.getRole() == Role.TEACHER) {
            managedClasses = classRepository.findByTeacherId(userId).stream()
                    .map(c -> ManagedClassSummary.builder()
                            .id(c.getId())
                            .className(c.getClassName())
                            .grade(c.getGrade())
                            .classCode(c.getClassCode())
                            .status(c.getStatus().name())
                            .studentCount(enrollmentRepository.countByClassEntityId(c.getId()))
                            .build())
                    .collect(Collectors.toList());
        }

        List<EnrolledClassSummary> enrolledClasses = List.of();
        if (user.getRole() == Role.STUDENT) {
            enrolledClasses = enrollmentRepository.findAllByUserIdWithDetails(userId).stream()
                    .map(e -> EnrolledClassSummary.builder()
                            .classId(e.getClassEntity().getId())
                            .className(e.getClassEntity().getClassName())
                            .groupName(e.getGroup() != null ? e.getGroup().getGroupName() : "Chưa phân tổ")
                            .teacherName(e.getClassEntity().getTeacher() != null ? e.getClassEntity().getTeacher().getFullName() : "N/A")
                            .status(e.getStatus().name())
                            .build())
                    .collect(Collectors.toList());
        }

        return AdminUserDetailResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .googleEmail(user.getGoogleEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .schoolName(user.getSchool() != null ? user.getSchool().getName() : null)
                .schoolId(user.getSchool() != null ? user.getSchool().getId() : null)
                .avatarUrl(user.getAvatarUrl())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .teacherRequests(teacherRequests)
                .managedClasses(managedClasses)
                .enrolledClasses(enrolledClasses)
                .build();
    }

    @Transactional
    public AdminUserDetailResponse executeSupportAction(SupportActionRequest request, Long adminUserId) {
        // BR-ADMIN-02: Mọi Support Action bắt buộc phải kèm reason
        if (request.getReason() == null || request.getReason().trim().isEmpty()) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "REASON_REQUIRED", "Reason is required for all administrative support actions.");
        }

        User user = userRepository.findById(request.getTargetUserId())
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Target user not found"));

        String action = request.getActionType().toUpperCase();

        switch (action) {
            case "RESET_PASSWORD":
                if (request.getNewPassword() == null || request.getNewPassword().trim().length() < 6) {
                    throw new CustomException(HttpStatus.BAD_REQUEST, "INVALID_PASSWORD", "New password must have at least 6 characters.");
                }
                user.setPasswordHash(passwordEncoder.encode(request.getNewPassword().trim()));
                log.info("Admin id={} RESET_PASSWORD for user id={}, reason: {}", adminUserId, user.getId(), request.getReason());
                break;

            case "UNLOCK_USER":
                log.info("Admin id={} UNLOCK_USER for user id={}, reason: {}", adminUserId, user.getId(), request.getReason());
                break;

            case "CHANGE_ROLE":
                if (request.getNewRole() == null) {
                    throw new CustomException(HttpStatus.BAD_REQUEST, "INVALID_ROLE", "New role must be specified.");
                }
                user.setRole(request.getNewRole());
                if (request.getNewRole() == Role.ADMIN) {
                    user.setSchool(null); // Admin accounts do not belong to any specific school
                }
                log.info("Admin id={} CHANGE_ROLE to {} for user id={}, reason: {}", adminUserId, request.getNewRole(), user.getId(), request.getReason());
                break;

            default:
                throw new CustomException(HttpStatus.BAD_REQUEST, "UNSUPPORTED_ACTION", "Unsupported support action: " + request.getActionType());
        }

        User updated = userRepository.save(user);
        return getUserDetail(updated.getId());
    }

    @Transactional(readOnly = true)
    public ViewAsSessionResponse generateViewAsSession(Long targetUserId, Long adminUserId) {
        User targetUser = userRepository.findByIdWithSchool(targetUserId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Target user not found"));

        Integer classId = null;
        if (targetUser.getRole() == Role.STUDENT) {
            Enrollment enrollment = enrollmentRepository.findByUserIdWithClass(targetUser.getId()).orElse(null);
            if (enrollment != null) {
                classId = enrollment.getClassEntity().getId();
            }
        }

        // BR-ADMIN-03: View-As sinh token tạm với cờ readOnly = true
        String token = jwtUtil.generateViewAsToken(
                targetUser.getId(),
                targetUser.getUsername(),
                targetUser.getRole(),
                targetUser.getSchool() != null ? targetUser.getSchool().getName() : null,
                targetUser.getAvatarUrl(),
                targetUser.getGoogleEmail(),
                classId
        );

        log.info("Admin id={} generated View-As token for target user id={}", adminUserId, targetUserId);

        return ViewAsSessionResponse.builder()
                .accessToken(token)
                .targetUserId(targetUser.getId())
                .targetUsername(targetUser.getUsername())
                .targetFullName(targetUser.getFullName())
                .targetRole(targetUser.getRole())
                .readOnly(true)
                .expiresIn(jwtUtil.getExpirationMs() / 1000)
                .build();
    }

    @Transactional(readOnly = true)
    public List<AdminSchoolSummaryResponse> getSchoolsSummary() {
        return schoolRepository.findAll().stream()
                .map(s -> AdminSchoolSummaryResponse.builder()
                        .id(s.getId())
                        .name(s.getName())
                        .address(s.getAddress())
                        .teacherCount(userRepository.countBySchoolIdAndRole(s.getId(), Role.TEACHER))
                        .classCount(classRepository.countBySchoolId(s.getId()))
                        .createdAt(s.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AdminClassSummaryResponse> getClassesBySchoolSummary(Long schoolId) {
        List<ClassEntity> classes;
        if (schoolId != null) {
            classes = classRepository.findBySchoolId(schoolId);
        } else {
            classes = classRepository.findAll();
        }

        return classes.stream()
                .map(c -> AdminClassSummaryResponse.builder()
                        .id(c.getId())
                        .className(c.getClassName())
                        .grade(c.getGrade())
                        .classCode(c.getClassCode())
                        .teacherName(c.getTeacher() != null ? c.getTeacher().getFullName() : "N/A")
                        .teacherId(c.getTeacher() != null ? c.getTeacher().getId() : null)
                        .schoolName(c.getSchool() != null ? c.getSchool().getName() : "N/A")
                        .schoolId(c.getSchool() != null ? c.getSchool().getId() : null)
                        .studentCount(enrollmentRepository.countByClassEntityId(c.getId()))
                        .status(c.getStatus().name())
                        .createdAt(c.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<AdminClassSummaryResponse> getAllClassesSummary(Pageable pageable) {
        Page<ClassEntity> classes = classRepository.findAll(pageable);

        return classes.map(c -> AdminClassSummaryResponse.builder()
                .id(c.getId())
                .className(c.getClassName())
                .grade(c.getGrade())
                .classCode(c.getClassCode())
                .teacherName(c.getTeacher() != null ? c.getTeacher().getFullName() : "Chưa phân công")
                .teacherId(c.getTeacher() != null ? c.getTeacher().getId() : null)
                .schoolName(c.getSchool() != null ? c.getSchool().getName() : "N/A")
                .schoolId(c.getSchool() != null ? c.getSchool().getId() : null)
                .studentCount(enrollmentRepository.countByClassEntityId(c.getId()))
                .status(c.getStatus().name())
                .createdAt(c.getCreatedAt())
                .build());
    }

    @Transactional(readOnly = true)
    public AdminDashboardOverviewResponse getDashboardOverview() {
        long totalUsers = userRepository.count();
        long totalTeachers = userRepository.countByRole(Role.TEACHER);
        long totalStudents = userRepository.countByRole(Role.STUDENT);
        long totalAdmins = userRepository.countByRole(Role.ADMIN);
        long pendingRequests = teacherRoleRequestRepository.countByStatus(TeacherRequestStatus.PENDING);
        long totalSchools = schoolRepository.count();
        long totalClasses = classRepository.count();
        SystemHealthResponse health = systemHealthService.getSystemHealth();

        return AdminDashboardOverviewResponse.builder()
                .totalUsers(totalUsers)
                .totalTeachers(totalTeachers)
                .totalStudents(totalStudents)
                .totalAdmins(totalAdmins)
                .pendingTeacherRequests(pendingRequests)
                .totalSchools(totalSchools)
                .totalClasses(totalClasses)
                .quickHealth(health)
                .build();
    }
}
