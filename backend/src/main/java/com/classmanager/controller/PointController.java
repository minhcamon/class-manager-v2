package com.classmanager.controller;

import com.classmanager.dto.common.APIResponse;
import com.classmanager.dto.school.request.PointLogCreateRequest;
import com.classmanager.dto.school.request.PointLogBatchRequest;
import com.classmanager.dto.school.request.PointLogUpdateRequest;
import com.classmanager.dto.school.response.PointLogResponse;
import com.classmanager.dto.school.response.StudentCurrentPointResponse;
import com.classmanager.service.PointLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Points", description = "APIs for logging point rewards/penalties and computing current standings")
public class PointController {

    private final PointLogService pointLogService;

    @PostMapping("/points")
    @PreAuthorize("hasAnyRole('TEACHER', 'STUDENT')")
    @Operation(
        summary = "Create point log",
        description = "Create a new points log (reward or penalty) for a student. Only accessible by teachers or group leaders.",
        responses = {
            @ApiResponse(responseCode = "201", description = "Point log created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid date or point values"),
            @ApiResponse(responseCode = "403", description = "Forbidden - student not in group or class ended")
        }
    )
    public ResponseEntity<APIResponse<PointLogResponse>> createPointLog(@Valid @RequestBody PointLogCreateRequest request) {
        Long currentUserId = getCurrentUserId();
        PointLogResponse response = pointLogService.createPointLog(currentUserId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(APIResponse.success("Point log created successfully", response));
    }

    @PostMapping("/points/batch")
    @PreAuthorize("hasAnyRole('TEACHER', 'STUDENT')")
    @Operation(
        summary = "Create point logs in batch",
        description = "Create new points logs (reward or penalty) for multiple students in a single request. Only accessible by teachers or group leaders.",
        responses = {
            @ApiResponse(responseCode = "201", description = "Point logs created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid date or point values"),
            @ApiResponse(responseCode = "403", description = "Forbidden - student not in group or class ended")
        }
    )
    public ResponseEntity<APIResponse<Void>> createPointLogsBatch(@Valid @RequestBody PointLogBatchRequest request) {
        Long currentUserId = getCurrentUserId();
        pointLogService.createPointLogsBatch(currentUserId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(APIResponse.success("Point logs created successfully", null));
    }

    @GetMapping("/points")
    @PreAuthorize("hasAnyRole('TEACHER', 'STUDENT')")
    @Operation(
        summary = "Get student point logs",
        description = "Retrieve list of all point logs for a student profile.",
        responses = {
            @ApiResponse(responseCode = "200", description = "Point logs retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Forbidden - cannot view logs for this student")
        }
    )
    public ResponseEntity<APIResponse<List<PointLogResponse>>> getPointLogs(
            @Parameter(description = "ID of the student profile") @RequestParam Integer studentProfileId) {
        Long currentUserId = getCurrentUserId();
        List<PointLogResponse> response = pointLogService.getStudentPointLogs(currentUserId, studentProfileId);
        return ResponseEntity.ok(APIResponse.success("Point logs retrieved successfully", response));
    }

    @GetMapping("/classes/{classId}/point-logs")
    @PreAuthorize("hasAnyRole('TEACHER', 'STUDENT')")
    @Operation(
        summary = "Get all point logs for a class",
        description = "Retrieve all point log entries for a class, ordered by most recent first. Accessible by the class teacher or any enrolled student.",
        responses = {
            @ApiResponse(responseCode = "200", description = "Class point logs retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Forbidden - not a member of this class"),
            @ApiResponse(responseCode = "404", description = "Class not found")
        }
    )
    public ResponseEntity<APIResponse<List<PointLogResponse>>> getClassPointLogs(
            @Parameter(description = "ID of the class") @PathVariable Integer classId) {
        Long currentUserId = getCurrentUserId();
        List<PointLogResponse> response = pointLogService.getClassPointLogs(currentUserId, classId);
        return ResponseEntity.ok(APIResponse.success("Class point logs retrieved successfully", response));
    }

    @DeleteMapping("/points/{logId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'STUDENT')")
    @Operation(
        summary = "Delete a point log",
        description = "Delete a specific point log entry. Only the creator or the class teacher may delete it.",
        responses = {
            @ApiResponse(responseCode = "204", description = "Point log deleted successfully"),
            @ApiResponse(responseCode = "403", description = "Forbidden - not the creator or class teacher"),
            @ApiResponse(responseCode = "404", description = "Point log not found")
        }
    )
    public ResponseEntity<APIResponse<Void>> deletePointLog(
            @Parameter(description = "ID of the point log") @PathVariable Long logId) {
        Long currentUserId = getCurrentUserId();
        pointLogService.deletePointLog(currentUserId, logId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(APIResponse.success("Point log deleted successfully", null));
    }

    @PatchMapping("/points/{logId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'STUDENT')")
    @Operation(
        summary = "Update a point log",
        description = "Edit the pointValue and/or reason of a point log. Only the creator or the class teacher may edit it.",
        responses = {
            @ApiResponse(responseCode = "200", description = "Point log updated successfully"),
            @ApiResponse(responseCode = "403", description = "Forbidden - not the creator or class teacher"),
            @ApiResponse(responseCode = "404", description = "Point log not found")
        }
    )
    public ResponseEntity<APIResponse<PointLogResponse>> updatePointLog(
            @Parameter(description = "ID of the point log") @PathVariable Long logId,
            @Valid @RequestBody PointLogUpdateRequest request) {
        Long currentUserId = getCurrentUserId();
        PointLogResponse response = pointLogService.updatePointLog(currentUserId, logId, request);
        return ResponseEntity.ok(APIResponse.success("Point log updated successfully", response));
    }

    @GetMapping("/classes/{classId}/students/{studentId}/current-point")
    @PreAuthorize("hasAnyRole('TEACHER', 'STUDENT')")
    @Operation(
        summary = "Get student current points",
        description = "Retrieve aggregate dynamically calculated points for a student profile.",
        responses = {
            @ApiResponse(responseCode = "200", description = "Current points retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Student profile not found")
        }
    )
    public ResponseEntity<APIResponse<StudentCurrentPointResponse>> getStudentCurrentPoint(
            @Parameter(description = "ID of the class") @PathVariable Integer classId,
            @Parameter(description = "ID of the student profile") @PathVariable Integer studentId) {
        StudentCurrentPointResponse response = pointLogService.getStudentCurrentPoint(studentId);
        return ResponseEntity.ok(APIResponse.success("Current points retrieved successfully", response));
    }

    private Long getCurrentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}

