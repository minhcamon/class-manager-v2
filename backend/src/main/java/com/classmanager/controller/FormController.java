package com.classmanager.controller;

import com.classmanager.dto.common.APIResponse;
import com.classmanager.dto.school.request.FormTemplateCreateRequest;
import com.classmanager.dto.school.response.FormTemplateResponse;
import com.classmanager.service.FormTemplateService;
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
import java.util.List;

@RestController
@RequestMapping("/api/v1/classes/{classId}/forms")
@RequiredArgsConstructor
@Tag(name = "Form Management", description = "APIs for managing versioned dynamic form templates")
public class FormController {

    private final FormTemplateService formTemplateService;

    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(
        summary = "Create new form version", 
        description = "Teacher creates a new version of the dynamic form for the class. The previous active form will be deactivated (BR-FORM-01).",
        responses = {
            @ApiResponse(responseCode = "200", description = "Form template created successfully"),
            @ApiResponse(responseCode = "404", description = "Class not found"),
            @ApiResponse(responseCode = "409", description = "Class has ended and is read-only")
        }
    )
    public ResponseEntity<APIResponse<FormTemplateResponse>> createForm(
            @Parameter(description = "ID of the class") @PathVariable Integer classId,
            @Valid @RequestBody FormTemplateCreateRequest request) {
        Long teacherId = getCurrentUserId();
        FormTemplateResponse response = formTemplateService.createNewVersion(teacherId, classId, request);
        return ResponseEntity.ok(APIResponse.success("Form template created successfully", response));
    }

    @GetMapping("/active")
    @Operation(
        summary = "Get active form", 
        description = "Retrieve the currently active form template for the class. Students use this to know which fields to fill.",
        responses = {
            @ApiResponse(responseCode = "200", description = "Active form retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Active form not found for this class")
        }
    )
    public ResponseEntity<APIResponse<FormTemplateResponse>> getActiveForm(
            @Parameter(description = "ID of the class") @PathVariable Integer classId) {
        FormTemplateResponse response = formTemplateService.getActiveForm(classId);
        return ResponseEntity.ok(APIResponse.success("Active form retrieved successfully", response));
    }

    @GetMapping
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(
        summary = "Get all form versions", 
        description = "Retrieve history of all form versions for the class. Only accessible by the teacher.",
        responses = {
            @ApiResponse(responseCode = "200", description = "Form history retrieved successfully")
        }
    )
    public ResponseEntity<APIResponse<List<FormTemplateResponse>>> getAllForms(
            @Parameter(description = "ID of the class") @PathVariable Integer classId) {
        List<FormTemplateResponse> response = formTemplateService.getAllVersions(classId);
        return ResponseEntity.ok(APIResponse.success("Form history retrieved successfully", response));
    }

    private Long getCurrentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
