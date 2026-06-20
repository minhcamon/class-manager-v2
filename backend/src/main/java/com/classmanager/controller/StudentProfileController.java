package com.classmanager.controller;

import com.classmanager.dto.common.APIResponse;
import com.classmanager.dto.school.request.StudentProfileUpdateRequest;
import com.classmanager.dto.school.response.StudentProfileResponse;
import com.classmanager.dto.school.response.ClassStudentResponse;
import com.classmanager.service.StudentProfileService;
import java.util.List;
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

import com.classmanager.entity.Enrollment;
import com.classmanager.exception.CustomException;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Student Profile Management", description = "APIs for students to fill their profile and teachers to view them")
public class StudentProfileController {

    private final StudentProfileService studentProfileService;
    private final com.classmanager.repository.EnrollmentRepository enrollmentRepository;

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

    @GetMapping("/classes/{classId}/students")
    @PreAuthorize("hasAnyRole('TEACHER', 'STUDENT')")
    @Operation(
        summary = "Get class students", 
        description = "Teacher or Student retrieves the list of students in the class with their points and group mapping.",
        responses = {
            @ApiResponse(responseCode = "200", description = "Class students retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Not authorized for this class"),
            @ApiResponse(responseCode = "404", description = "Class not found")
        }
    )
    public ResponseEntity<APIResponse<List<ClassStudentResponse>>> getClassStudents(
            @Parameter(description = "ID of the class") @PathVariable Integer classId) {
        Long currentUserId = getCurrentUserId();
        com.classmanager.enums.Role role = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .map(auth -> auth.getAuthority())
                .filter(auth -> auth.startsWith("ROLE_"))
                .map(auth -> com.classmanager.enums.Role.valueOf(auth.replace("ROLE_", "")))
                .findFirst()
                .orElse(com.classmanager.enums.Role.STUDENT);
        
        List<ClassStudentResponse> response = studentProfileService.getClassStudents(currentUserId, role, classId);
        return ResponseEntity.ok(APIResponse.success("Class students retrieved successfully", response));
    }

    private Long getCurrentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private Integer getCurrentEnrollmentId() {
        Long userId = getCurrentUserId();
        return enrollmentRepository.findByUserId(userId)
                .map(Enrollment::getId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "ENROLLMENT_NOT_FOUND", "Bạn chưa tham gia lớp học nào."));
    }

    private Integer getCurrentClassId() {
        Long userId = getCurrentUserId();
        return enrollmentRepository.findByUserId(userId)
                .map(e -> e.getClassEntity().getId())
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "ENROLLMENT_NOT_FOUND", "Bạn chưa tham gia lớp học nào."));
    }

    private Integer findEnrollmentId(Integer classId, Long studentId) {
        return enrollmentRepository.findByUserId(studentId)
                .filter(e -> e.getClassEntity().getId().equals(classId))
                .map(Enrollment::getId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "ENROLLMENT_NOT_FOUND", "Học sinh chưa tham gia lớp học này."));
    }
}
