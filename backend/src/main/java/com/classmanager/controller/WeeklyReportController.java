package com.classmanager.controller;

import com.classmanager.dto.common.APIResponse;
import com.classmanager.dto.school.request.WeeklyCloseRequest;
import com.classmanager.dto.school.response.AcademicLeaderboardResponse;
import com.classmanager.dto.school.response.WeeklyLeaderboardResponse;
import com.classmanager.dto.school.response.WeeklyReportResponse;
import com.classmanager.dto.school.response.WeeklyHistoryResponse;
import com.classmanager.enums.EnrollmentStatus;
import com.classmanager.exception.CustomException;
import com.classmanager.repository.ClassRepository;
import com.classmanager.repository.EnrollmentRepository;
import com.classmanager.service.WeeklyReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Weekly Reports & Leaderboards", description = "APIs for weekly cycle close operations and leaderboard standing lists")
public class WeeklyReportController {

    private final WeeklyReportService weeklyReportService;
    private final ClassRepository classRepository;
    private final EnrollmentRepository enrollmentRepository;

    @PostMapping("/weeks/close")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(summary = "Close week manually (Teacher only)")
    public ResponseEntity<APIResponse<Void>> closeWeek(@Valid @RequestBody WeeklyCloseRequest request) {
        Long currentUserId = getCurrentUserId();
        
        // Permission check: Must be the class teacher
        boolean isOwner = classRepository.existsByIdAndTeacherId(request.getClassId(), currentUserId);
        if (!isOwner) {
            throw new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không phải giáo viên chủ nhiệm lớp này.");
        }

        weeklyReportService.closeWeek(request.getClassId(), request.getWeekStartDate(), currentUserId, "TEACHER");
        return ResponseEntity.ok(APIResponse.success("Chốt điểm tuần thành công", null));
    }

    @GetMapping("/leaderboard/academic")
    @PreAuthorize("hasAnyRole('TEACHER', 'STUDENT')")
    @Operation(summary = "Get academic leaderboard (cumulative points)")
    public ResponseEntity<APIResponse<AcademicLeaderboardResponse>> getAcademicLeaderboard(@RequestParam Integer classId) {
        validateMemberAccess(classId);
        AcademicLeaderboardResponse leaderboard = weeklyReportService.getAcademicLeaderboard(classId);
        return ResponseEntity.ok(APIResponse.success("Academic leaderboard retrieved successfully", leaderboard));
    }

    @GetMapping("/leaderboard/weekly")
    @PreAuthorize("hasAnyRole('TEACHER', 'STUDENT')")
    @Operation(summary = "Get weekly leaderboard (current week net points)")
    public ResponseEntity<APIResponse<WeeklyLeaderboardResponse>> getWeeklyLeaderboard(@RequestParam Integer classId) {
        validateMemberAccess(classId);
        WeeklyLeaderboardResponse leaderboard = weeklyReportService.getWeeklyLeaderboard(classId);
        return ResponseEntity.ok(APIResponse.success("Weekly leaderboard retrieved successfully", leaderboard));
    }

    @GetMapping("/reports/weeks")
    @PreAuthorize("hasAnyRole('TEACHER', 'STUDENT')")
    @Operation(summary = "Get all closed weeks for a class")
    public ResponseEntity<APIResponse<List<LocalDate>>> getLockedWeeks(@RequestParam Integer classId) {
        validateMemberAccess(classId);
        List<LocalDate> lockedWeeks = weeklyReportService.getLockedWeeks(classId);
        return ResponseEntity.ok(APIResponse.success("Locked weeks retrieved successfully", lockedWeeks));
    }

    @GetMapping("/reports/weeks/{week}")
    @PreAuthorize("hasAnyRole('TEACHER', 'STUDENT')")
    @Operation(summary = "Get weekly report detail for a closed week")
    public ResponseEntity<APIResponse<WeeklyReportResponse>> getWeeklyReport(
            @PathVariable String week,
            @RequestParam Integer classId) {
        validateMemberAccess(classId);
        LocalDate weekStartDate = LocalDate.parse(week);
        WeeklyReportResponse report = weeklyReportService.getWeeklyReport(classId, weekStartDate);
        return ResponseEntity.ok(APIResponse.success("Weekly report retrieved successfully", report));
    }

    @GetMapping("/me/history")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get weekly performance history of logged-in student")
    public ResponseEntity<APIResponse<List<WeeklyHistoryResponse>>> getMyHistory(@RequestParam Integer classId) {
        Long currentUserId = getCurrentUserId();
        List<WeeklyHistoryResponse> history = weeklyReportService.getStudentHistoryByUserIdAndClassId(currentUserId, classId);
        return ResponseEntity.ok(APIResponse.success("My history retrieved successfully", history));
    }

    private void validateMemberAccess(Integer classId) {
        Long currentUserId = getCurrentUserId();
        com.classmanager.enums.Role role = getRole();
        
        if (role == com.classmanager.enums.Role.TEACHER) {
            boolean isOwner = classRepository.existsByIdAndTeacherId(classId, currentUserId);
            if (!isOwner) {
                throw new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không phải giáo viên chủ nhiệm lớp này.");
            }
        } else if (role == com.classmanager.enums.Role.STUDENT) {
            boolean isEnrolled = enrollmentRepository.existsByClassEntityIdAndUserIdAndStatus(classId, currentUserId, EnrollmentStatus.ACTIVE);
            if (!isEnrolled) {
                throw new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không thuộc lớp học này.");
            }
        } else {
            throw new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Quyền hạn không hợp lệ.");
        }
    }

    private Long getCurrentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private com.classmanager.enums.Role getRole() {
        return SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .map(auth -> auth.getAuthority())
                .filter(auth -> auth.startsWith("ROLE_"))
                .map(auth -> com.classmanager.enums.Role.valueOf(auth.replace("ROLE_", "")))
                .findFirst()
                .orElse(com.classmanager.enums.Role.STUDENT);
    }
}
