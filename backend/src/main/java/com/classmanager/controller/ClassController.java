package com.classmanager.controller;

import com.classmanager.dto.common.APIResponse;
import com.classmanager.dto.school.request.ClassCreateRequest;
import com.classmanager.dto.school.response.ClassResponse;
import com.classmanager.service.ClassService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/classes")
@RequiredArgsConstructor
@Tag(name = "Class Management", description = "APIs for managing classroom life-cycle")
public class ClassController {

    private final ClassService classService;

    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(
        summary = "Create a new class", 
        description = "Teacher creates a new active class. Only one active class is allowed per teacher (BR-CLASS-01).",
        responses = {
            @ApiResponse(responseCode = "200", description = "Class created successfully"),
            @ApiResponse(responseCode = "409", description = "Teacher already has an active class", content = @Content(schema = @Schema(implementation = APIResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden - Only Teachers can create classes")
        }
    )
    public ResponseEntity<APIResponse<ClassResponse>> createClass(@Valid @RequestBody ClassCreateRequest request) {
        Long teacherId = getCurrentUserId();
        ClassResponse response = classService.createClass(teacherId, request);
        return ResponseEntity.ok(APIResponse.success("Class created successfully", response));
    }

    @PutMapping("/{id}/end")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(
        summary = "End a class", 
        description = "Marks the class as ENDED. Data becomes read-only. Teacher can then create a new class.",
        responses = {
            @ApiResponse(responseCode = "200", description = "Class ended successfully"),
            @ApiResponse(responseCode = "404", description = "Class not found"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Not the owner teacher")
        }
    )
    public ResponseEntity<APIResponse<ClassResponse>> endClass(
            @Parameter(description = "ID of the class to end") @PathVariable Integer id) {
        Long teacherId = getCurrentUserId();
        ClassResponse response = classService.endClass(teacherId, id);
        return ResponseEntity.ok(APIResponse.success("Class ended successfully", response));
    }

    @GetMapping("/active")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(
        summary = "Get active class for current teacher", 
        description = "Retrieve the active class of the logged-in teacher if one exists.",
        responses = {
            @ApiResponse(responseCode = "200", description = "Active class retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Only Teachers can query active classes")
        }
    )
    public ResponseEntity<APIResponse<ClassResponse>> getActiveClass() {
        Long teacherId = getCurrentUserId();
        ClassResponse response = classService.getActiveClassByTeacher(teacherId);
        return ResponseEntity.ok(APIResponse.success("Active class retrieved successfully", response));
    }

    @GetMapping("/{id}")
    @Operation(
        summary = "Get class details", 
        description = "Retrieve information about a specific class by ID.",
        responses = {
            @ApiResponse(responseCode = "200", description = "Class retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Class not found")
        }
    )
    public ResponseEntity<APIResponse<ClassResponse>> getClass(
            @Parameter(description = "ID of the class to retrieve") @PathVariable Integer id) {
        ClassResponse response = classService.getClassById(id);
        return ResponseEntity.ok(APIResponse.success("Class retrieved successfully", response));
    }

    private Long getCurrentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
