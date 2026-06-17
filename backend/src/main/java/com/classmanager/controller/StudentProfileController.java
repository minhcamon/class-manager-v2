package com.classmanager.controller;

import com.classmanager.dto.common.APIResponse;
import com.classmanager.dto.school.request.StudentProfileUpdateRequest;
import com.classmanager.dto.school.response.StudentProfileResponse;
import com.classmanager.service.StudentProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Student Profile Management", description = "APIs for students to fill their profile and teachers to view them")
public class StudentProfileController {

    private final StudentProfileService studentProfileService;

    @PutMapping("/students/me/profile")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(
        summary = "Update own profile", 
        description = "Student fills or updates their profile data according to the class's active form (BR-PROFILE-01).",
        responses = {
            @ApiResponse(responseCode = "200", description = "Profile updated successfully"),
            @ApiResponse(responseCode = "400", description = "Validation error - missing required fields or invalid data"),
            @ApiResponse(responseCode = "404", description = "Active form not found")
        }
    )
    public ResponseEntity<APIResponse<StudentProfileResponse>> updateMyProfile(
            @Valid @RequestBody StudentProfileUpdateRequest request) {
        // enrollmentId and classId will be extracted from JWT in Feature 03.
        Integer enrollmentId = getCurrentEnrollmentId();
        Integer classId = getCurrentClassId();
        
        StudentProfileResponse response = studentProfileService.upsertProfile(enrollmentId, classId, request);
        return ResponseEntity.ok(APIResponse.success("Profile updated successfully", response));
    }

    @GetMapping("/students/me/profile")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(
        summary = "Get own profile", 
        description = "Student views their own profile data.",
        responses = {
            @ApiResponse(responseCode = "200", description = "Profile retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Profile not found")
        }
    )
    public ResponseEntity<APIResponse<StudentProfileResponse>> getMyProfile() {
        Integer enrollmentId = getCurrentEnrollmentId();
        StudentProfileResponse response = studentProfileService.getProfile(enrollmentId);
        return ResponseEntity.ok(APIResponse.success("Profile retrieved successfully", response));
    }

    @GetMapping("/classes/{classId}/students/{studentId}/profile")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(
        summary = "View student profile", 
        description = "Teacher views a specific student's profile data.",
        responses = {
            @ApiResponse(responseCode = "200", description = "Student profile retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Student or profile not found")
        }
    )
    public ResponseEntity<APIResponse<StudentProfileResponse>> getStudentProfile(
            @Parameter(description = "ID of the class") @PathVariable Integer classId,
            @Parameter(description = "ID of the student user") @PathVariable Long studentId) {
        Integer enrollmentId = findEnrollmentId(classId, studentId);
        StudentProfileResponse response = studentProfileService.getProfile(enrollmentId);
        return ResponseEntity.ok(APIResponse.success("Student profile retrieved successfully", response));
    }

    private Long getCurrentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    // Placeholders for Feature 03 integration
    private Integer getCurrentEnrollmentId() {
        // This will be replaced by JWT claim extraction in Feature 03
        return 1; 
    }

    private Integer getCurrentClassId() {
        // This will be replaced by JWT claim extraction in Feature 03
        return 1;
    }

    private Integer findEnrollmentId(Integer classId, Long studentId) {
        // This will be implemented in Feature 03 with EnrollmentRepository
        return 1;
    }
}
