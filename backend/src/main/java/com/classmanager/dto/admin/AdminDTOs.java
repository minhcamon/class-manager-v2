package com.classmanager.dto.admin;

import com.classmanager.enums.Role;
import com.classmanager.enums.TeacherRequestStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class AdminDTOs {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminUserSearchResponse {
        private Long id;
        private String username;
        private String fullName;
        private String googleEmail;
        private String phoneNumber;
        private Role role;
        private String schoolName;
        private Long schoolId;
        private String avatarUrl;
        private TeacherRequestStatus teacherRequestStatus;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminUserDetailResponse {
        private Long id;
        private String username;
        private String fullName;
        private String googleEmail;
        private String phoneNumber;
        private Role role;
        private String schoolName;
        private Long schoolId;
        private String avatarUrl;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private List<TeacherRequestResponse> teacherRequests;
        private List<ManagedClassSummary> managedClasses;
        private List<EnrolledClassSummary> enrolledClasses;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ManagedClassSummary {
        private Integer id;
        private String className;
        private Integer grade;
        private String classCode;
        private String status;
        private Long studentCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EnrolledClassSummary {
        private Integer classId;
        private String className;
        private String groupName;
        private String teacherName;
        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SupportActionRequest {
        @NotNull(message = "Target user ID is required")
        private Long targetUserId;

        @NotBlank(message = "Action type is required")
        private String actionType; // RESET_PASSWORD, UNLOCK_USER, CHANGE_ROLE

        private String newPassword;
        private Role newRole;

        @NotBlank(message = "Reason is mandatory for audit trail")
        private String reason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ViewAsSessionResponse {
        private String accessToken;
        private Long targetUserId;
        private String targetUsername;
        private String targetFullName;
        private Role targetRole;
        private boolean readOnly;
        private Long expiresIn;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeacherRequestResponse {
        private Long id;
        private Long userId;
        private String username;
        private String fullName;
        private String googleEmail;
        private String phoneNumber;
        private String schoolName;
        private TeacherRequestStatus status;
        private LocalDateTime requestedAt;
        private Long reviewedById;
        private String reviewedByName;
        private LocalDateTime reviewedAt;
        private String rejectReason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeacherRequestReviewRequest {
        private String reason; // Mandatory when REJECT
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminSchoolSummaryResponse {
        private Long id;
        private String name;
        private String address;
        private Long teacherCount;
        private Long classCount;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminClassSummaryResponse {
        private Integer id;
        private String className;
        private Integer grade;
        private String classCode;
        private String teacherName;
        private Long teacherId;
        private String schoolName;
        private Long schoolId;
        private Long studentCount;
        private String status;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SystemHealthResponse {
        private String dbStatus;
        private int activeDbConnections;
        private int maxDbConnections;
        private boolean poolWarning;
        private long jvmUsedMemoryMb;
        private long jvmMaxMemoryMb;
        private double jvmMemoryUsagePercent;
        private double diskFreeSpaceGb;
        private double diskTotalSpaceGb;
        private String weeklyCronSchedule;
        private String serverTimezone;
        private LocalDateTime serverTime;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApiMetricsResponse {
        private long totalRequests24h;
        private double errorRatePercent;
        private long avgResponseTimeMs;
        private long count2xx;
        private long count4xx;
        private long count5xx;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminDashboardOverviewResponse {
        private long totalUsers;
        private long totalTeachers;
        private long totalStudents;
        private long totalAdmins;
        private long pendingTeacherRequests;
        private long totalSchools;
        private long totalClasses;
        private SystemHealthResponse quickHealth;
    }
}
