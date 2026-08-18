package com.classmanager.controller;

import com.classmanager.dto.admin.AdminDTOs.*;
import com.classmanager.enums.Role;
import com.classmanager.enums.TeacherRequestStatus;
import com.classmanager.service.AdminService;
import com.classmanager.service.SystemHealthService;
import com.classmanager.service.TeacherApprovalEngine;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Operations", description = "Endpoints dành riêng cho Quản trị viên hệ thống (Role = ADMIN)")
public class AdminController {

    private final AdminService adminService;
    private final TeacherApprovalEngine teacherApprovalEngine;
    private final SystemHealthService systemHealthService;

    @Operation(summary = "Tổng quan bảng điều khiển Admin", description = "Lấy các chỉ số thống kê tổng thể và tình trạng sức khỏe nhanh.")
    @GetMapping("/dashboard/overview")
    public ResponseEntity<AdminDashboardOverviewResponse> getDashboardOverview() {
        return ResponseEntity.ok(adminService.getDashboardOverview());
    }

    @Operation(summary = "Tổng quan danh sách Trường học", description = "Danh sách trường học và số lượng lớp/giáo viên tổng quan.")
    @GetMapping("/schools")
    public ResponseEntity<List<AdminSchoolSummaryResponse>> getSchoolsSummary() {
        return ResponseEntity.ok(adminService.getSchoolsSummary());
    }

    @Operation(summary = "Tổng quan danh sách Lớp học theo Trường", description = "Danh sách tóm tắt các lớp học thuộc trường (không kèm chi tiết học sinh).")
    @GetMapping("/schools/{schoolId}/classes")
    public ResponseEntity<List<AdminClassSummaryResponse>> getClassesBySchool(@PathVariable Long schoolId) {
        return ResponseEntity.ok(adminService.getClassesBySchoolSummary(schoolId));
    }

    @Operation(summary = "Tổng quan danh sách Lớp học toàn hệ thống", description = "Danh sách tóm tắt tất cả các lớp học trong hệ thống (không kèm chi tiết điểm học sinh).")
    @GetMapping("/classes")
    public ResponseEntity<Page<AdminClassSummaryResponse>> getClasses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(adminService.getAllClassesSummary(pageable));
    }

    @Operation(summary = "Tìm kiếm & Tra cứu người dùng", description = "User Inspector: tìm kiếm theo từ khóa và vai trò.")
    @GetMapping("/users")
    public ResponseEntity<Page<AdminUserSearchResponse>> searchUsers(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Role role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(adminService.searchUsers(query, role, pageable));
    }

    @Operation(summary = "Chi tiết hồ sơ người dùng", description = "Lấy đầy đủ thông tin, lớp học liên quan và lịch sử yêu cầu của User.")
    @GetMapping("/users/{userId}")
    public ResponseEntity<AdminUserDetailResponse> getUserDetail(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.getUserDetail(userId));
    }

    @Operation(summary = "Thực thi hành động hỗ trợ kỹ thuật", description = "Thực hiện Reset Password, Unlock User hoặc Change Role.")
    @PostMapping("/support/action")
    public ResponseEntity<AdminUserDetailResponse> executeSupportAction(
            @Valid @RequestBody SupportActionRequest request,
            Authentication authentication) {
        Long adminUserId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(adminService.executeSupportAction(request, adminUserId));
    }

    @Operation(summary = "Khởi tạo phiên View-As Read-Only", description = "Sinh token quan sát chế độ chỉ đọc dưới danh nghĩa user mục tiêu.")
    @PostMapping("/view-as/{userId}")
    public ResponseEntity<ViewAsSessionResponse> viewAsUser(
            @PathVariable Long userId,
            Authentication authentication) {
        Long adminUserId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(adminService.generateViewAsSession(userId, adminUserId));
    }

    @Operation(summary = "Danh sách yêu cầu cấp quyền Giáo viên", description = "Tra cứu các yêu cầu TeacherRoleRequest theo trạng thái.")
    @GetMapping("/teacher-requests")
    public ResponseEntity<Page<TeacherRequestResponse>> getTeacherRequests(
            @RequestParam(required = false) TeacherRequestStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "requestedAt"));
        return ResponseEntity.ok(teacherApprovalEngine.getRequests(status, pageable));
    }

    @Operation(summary = "Phê duyệt yêu cầu Giáo viên", description = "Chuyển trạng thái yêu cầu sang APPROVED và gán role TEACHER.")
    @PostMapping("/teacher-requests/{id}/approve")
    public ResponseEntity<TeacherRequestResponse> approveTeacherRequest(
            @PathVariable Long id,
            Authentication authentication) {
        Long adminUserId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(teacherApprovalEngine.approveRequest(id, adminUserId));
    }

    @Operation(summary = "Từ chối yêu cầu Giáo viên", description = "Chuyển trạng thái yêu cầu sang REJECTED kèm lý do.")
    @PostMapping("/teacher-requests/{id}/reject")
    public ResponseEntity<TeacherRequestResponse> rejectTeacherRequest(
            @PathVariable Long id,
            @RequestBody(required = false) TeacherRequestReviewRequest request,
            Authentication authentication) {
        Long adminUserId = (Long) authentication.getPrincipal();
        String reason = request != null ? request.getReason() : null;
        return ResponseEntity.ok(teacherApprovalEngine.rejectRequest(id, adminUserId, reason));
    }

    @Operation(summary = "Giám sát sức khỏe hệ thống máy chủ", description = "Thông số kết nối HikariCP, bộ nhớ JVM, dung lượng ổ đĩa.")
    @GetMapping("/metrics/health")
    public ResponseEntity<SystemHealthResponse> getSystemHealth() {
        return ResponseEntity.ok(systemHealthService.getSystemHealth());
    }

    @Operation(summary = "Thống kê chỉ số API", description = "Tần suất gọi API, thời gian phản hồi và phân bổ mã trạng thái.")
    @GetMapping("/metrics/api")
    public ResponseEntity<ApiMetricsResponse> getApiMetrics() {
        return ResponseEntity.ok(systemHealthService.getApiMetrics());
    }
}
