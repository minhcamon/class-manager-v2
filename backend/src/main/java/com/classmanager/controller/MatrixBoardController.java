package com.classmanager.controller;

import com.classmanager.dto.common.APIResponse;
import com.classmanager.dto.matrix.MatrixBoardResponse;
import com.classmanager.enums.Role;
import com.classmanager.service.MatrixAggregationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/classes/{classId}/matrix-board")
@RequiredArgsConstructor
@Tag(name = "Matrix Point Board", description = "API for multi-week nested tree matrix aggregation")
public class MatrixBoardController {

    private final MatrixAggregationService matrixAggregationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'STUDENT', 'ADMIN')")
    @Operation(summary = "Get multi-week matrix board data")
    public ResponseEntity<APIResponse<MatrixBoardResponse>> getMatrixBoard(
            @PathVariable Integer classId,
            @RequestParam(required = false, defaultValue = "2026") Integer academicYear,
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false, defaultValue = "1") Integer fromWeek,
            @RequestParam(required = false, defaultValue = "4") Integer toWeek) {

        Long currentUserId = getCurrentUserId();
        Role role = getRole();

        MatrixBoardResponse response = matrixAggregationService.getMatrixBoard(
                currentUserId, role, classId, academicYear, semester, fromWeek, toWeek);

        return ResponseEntity.ok(APIResponse.success("Matrix board retrieved successfully", response));
    }

    @GetMapping("/weekly-focus")
    @PreAuthorize("hasAnyRole('TEACHER', 'STUDENT', 'ADMIN')")
    @Operation(summary = "Get single-week detailed focus data with behavioral logs")
    public ResponseEntity<APIResponse<com.classmanager.dto.matrix.WeeklyFocusResponse>> getWeeklyFocusBoard(
            @PathVariable Integer classId,
            @RequestParam(required = false, defaultValue = "2026") Integer academicYear,
            @RequestParam(required = false, defaultValue = "1") Integer weekNumber) {

        Long currentUserId = getCurrentUserId();
        Role role = getRole();

        com.classmanager.dto.matrix.WeeklyFocusResponse response = matrixAggregationService.getWeeklyFocusBoard(
                currentUserId, role, classId, academicYear, weekNumber);

        return ResponseEntity.ok(APIResponse.success("Weekly focus board retrieved successfully", response));
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
