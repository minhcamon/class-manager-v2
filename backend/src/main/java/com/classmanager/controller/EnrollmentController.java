package com.classmanager.controller;

import com.classmanager.dto.common.APIResponse;
import com.classmanager.dto.school.request.JoinClassRequest;
import com.classmanager.dto.school.response.EnrollmentResponse;
import com.classmanager.service.EnrollmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/enrollments")
@RequiredArgsConstructor
@Tag(name = "Enrollments", description = "Student access control and class assignments")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @PostMapping("/join")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Join a class", description = "Allows a student to join a class using a code and password")
    public ResponseEntity<APIResponse<EnrollmentResponse>> joinClass(@Valid @RequestBody JoinClassRequest request) {
        Long studentId = getCurrentUserId();
        EnrollmentResponse response = enrollmentService.joinClass(studentId, request);
        return ResponseEntity.ok(APIResponse.success("Joined class successfully", response));
    }

    private Long getCurrentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
