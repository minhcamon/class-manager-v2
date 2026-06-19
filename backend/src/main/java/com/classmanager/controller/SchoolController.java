package com.classmanager.controller;

import com.classmanager.dto.auth.response.UserResponse;
import com.classmanager.dto.common.APIResponse;
import com.classmanager.dto.school.request.SchoolCreateRequest;
import com.classmanager.dto.school.response.SchoolResponse;
import com.classmanager.service.SchoolService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/v1/schools")
@RequiredArgsConstructor
@Tag(name = "School Management", description = "Các API liên quan đến quản lý trường học")
public class SchoolController {

    private final SchoolService schoolService;

    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(summary = "Tạo trường học mới", description = "Đăng ký một trường học mới và tự động liên kết trường học đó cho giáo viên hiện tại. Yêu cầu tài khoản có vai trò TEACHER.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tạo trường học thành công"),
            @ApiResponse(responseCode = "400", description = "Dữ liệu đầu vào không hợp lệ"),
            @ApiResponse(responseCode = "403", description = "Không có quyền truy cập (không phải giáo viên hoặc chưa xác thực)")
    })
    public ResponseEntity<APIResponse<UserResponse>> createSchool(@Valid @RequestBody SchoolCreateRequest request) {
        Long userId = getCurrentUserId();
        UserResponse response = schoolService.createSchool(userId, request);
        return ResponseEntity.ok(APIResponse.success("School created and linked to teacher successfully", response));
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách trường học", description = "Lấy danh sách tất cả các trường học trong hệ thống, hỗ trợ tìm kiếm theo tên qua tham số search.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy danh sách thành công")
    })
    public ResponseEntity<APIResponse<List<SchoolResponse>>> getSchools(@RequestParam(required = false) String search) {
        List<SchoolResponse> response = schoolService.getSchools(search);
        return ResponseEntity.ok(APIResponse.success("Schools fetched successfully", response));
    }

    private Long getCurrentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
