package com.classmanager.controller;

import com.classmanager.dto.behavior.StudentWeeklyDetailResponse;
import com.classmanager.dto.common.APIResponse;
import com.classmanager.enums.Role;
import com.classmanager.service.StudentWeeklyBehaviorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/students/{studentId}/weekly-detail")
@RequiredArgsConstructor
@Tag(name = "Student Weekly Detail", description = "API for student weekly behavior detail and drawer")
public class StudentWeeklyDetailController {

    private final StudentWeeklyBehaviorService behaviorService;

    @GetMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'STUDENT', 'ADMIN')")
    @Operation(summary = "Get student weekly behavior details and daily logs")
    public ResponseEntity<APIResponse<StudentWeeklyDetailResponse>> getStudentWeeklyDetail(
            @PathVariable Integer studentId,
            @RequestParam Integer classId,
            @RequestParam(required = false, defaultValue = "2026") Integer academicYear,
            @RequestParam Integer weekNumber) {

        Long currentUserId = getCurrentUserId();
        Role role = getRole();

        StudentWeeklyDetailResponse response = behaviorService.getStudentWeeklyDetail(
                currentUserId, role, studentId, classId, academicYear, weekNumber);

        return ResponseEntity.ok(APIResponse.success("Weekly details retrieved successfully", response));
    }

    private Long getCurrentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private Role getRole() {
        return SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .map(auth -> auth.getAuthority())
                .filter(auth -> auth.startsWith("ROLE_"))
                .map(auth -> Role.valueOf(auth.replace("ROLE_", "")))
                .findFirst()
                .orElse(Role.STUDENT);
    }
}
