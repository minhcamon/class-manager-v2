package com.classmanager.controller;

import com.classmanager.dto.common.APIResponse;
import com.classmanager.dto.school.request.GroupAssignRequest;
import com.classmanager.dto.school.request.GroupCreateRequest;
import com.classmanager.dto.school.request.LeaderAssignRequest;
import com.classmanager.dto.school.response.GroupResponse;
import com.classmanager.service.GroupService;
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
@Tag(name = "Groups", description = "APIs for managing class groups (Tổ) and leader assignments")
public class GroupController {

    private final GroupService groupService;
    private final com.classmanager.service.GroupImportService groupImportService;

    @PostMapping("/groups")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(
        summary = "Create a new group",
        description = "Teacher creates a new study group (Tổ) for the class.",
        responses = {
            @ApiResponse(responseCode = "201", description = "Group created successfully"),
            @ApiResponse(responseCode = "400", description = "Validation error"),
            @ApiResponse(responseCode = "409", description = "Group name already exists in this class")
        }
    )
    public ResponseEntity<APIResponse<GroupResponse>> createGroup(@Valid @RequestBody GroupCreateRequest request) {
        Long teacherId = getCurrentUserId();
        GroupResponse response = groupService.createGroup(teacherId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(APIResponse.success("Group created successfully", response));
    }

    @PutMapping("/groups/{id}/leader")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(
        summary = "Assign group leader",
        description = "Teacher assigns a student as the leader of a group. The student must belong to this group.",
        responses = {
            @ApiResponse(responseCode = "200", description = "Group leader assigned successfully"),
            @ApiResponse(responseCode = "400", description = "Student is not in this group"),
            @ApiResponse(responseCode = "404", description = "Group or student not found")
        }
    )
    public ResponseEntity<APIResponse<GroupResponse>> assignLeader(
            @Parameter(description = "ID of the group") @PathVariable Integer id,
            @Valid @RequestBody LeaderAssignRequest request) {
        Long teacherId = getCurrentUserId();
        GroupResponse response = groupService.assignGroupLeader(teacherId, id, request.getStudentProfileId());
        return ResponseEntity.ok(APIResponse.success("Group leader assigned successfully", response));
    }

    @PutMapping("/students/{id}/group")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(
        summary = "Assign student to group",
        description = "Teacher adds or moves a student to a group. If groupId is null, the student is removed from their group.",
        responses = {
            @ApiResponse(responseCode = "200", description = "Student assigned to group successfully"),
            @ApiResponse(responseCode = "404", description = "Student or group not found")
        }
    )
    public ResponseEntity<APIResponse<Void>> assignStudentGroup(
            @Parameter(description = "ID of the student profile") @PathVariable Integer id,
            @Valid @RequestBody GroupAssignRequest request) {
        Long teacherId = getCurrentUserId();
        groupService.addStudentToGroup(teacherId, id, request.getGroupId());
        return ResponseEntity.ok(APIResponse.success("Student group updated successfully", null));
    }

    @GetMapping("/classes/{classId}/groups")
    @PreAuthorize("hasAnyRole('TEACHER', 'STUDENT')")
    @Operation(
        summary = "Get class groups",
        description = "Retrieve all groups for a class.",
        responses = {
            @ApiResponse(responseCode = "200", description = "Groups retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Class not found")
        }
    )
    public ResponseEntity<APIResponse<List<GroupResponse>>> getClassGroups(
            @Parameter(description = "ID of the class") @PathVariable Integer classId) {
        List<GroupResponse> response = groupService.getClassGroups(classId);
        return ResponseEntity.ok(APIResponse.success("Groups retrieved successfully", response));
    }

    @PostMapping(value = "/classes/{classId}/groups/import-preview", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(
        summary = "Preview group import file",
        description = "Parse Excel or CSV file to preview group assignment mapping and validation status without saving.",
        responses = {
            @ApiResponse(responseCode = "200", description = "File parsed successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid or malformed file")
        }
    )
    public ResponseEntity<APIResponse<com.classmanager.dto.school.response.GroupImportPreviewResponse>> previewGroupImport(
            @Parameter(description = "ID of the class") @PathVariable Integer classId,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        Long teacherId = getCurrentUserId();
        com.classmanager.dto.school.response.GroupImportPreviewResponse response = groupImportService.previewImport(teacherId, classId, file);
        return ResponseEntity.ok(APIResponse.success("Preview generated successfully", response));
    }

    @PostMapping("/classes/{classId}/groups/import")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(
        summary = "Execute group import",
        description = "Confirm and batch apply group assignment and leader designation.",
        responses = {
            @ApiResponse(responseCode = "200", description = "Import executed successfully"),
            @ApiResponse(responseCode = "400", description = "Validation or data error")
        }
    )
    public ResponseEntity<APIResponse<com.classmanager.dto.school.response.GroupImportResultResponse>> executeGroupImport(
            @Parameter(description = "ID of the class") @PathVariable Integer classId,
            @Valid @RequestBody com.classmanager.dto.school.request.GroupImportConfirmRequest request) {
        Long teacherId = getCurrentUserId();
        com.classmanager.dto.school.response.GroupImportResultResponse response = groupImportService.executeImport(teacherId, classId, request);
        return ResponseEntity.ok(APIResponse.success(response.getMessage(), response));
    }

    @GetMapping("/classes/{classId}/groups/export-template")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(
        summary = "Download group import Excel template",
        description = "Download standard Excel template (.xlsx) for importing group assignments."
    )
    public ResponseEntity<byte[]> downloadImportTemplate(
            @Parameter(description = "ID of the class") @PathVariable Integer classId) {
        byte[] excelBytes = groupImportService.generateTemplate();
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", "Mau_Import_Danh_Sach_To.xlsx");
        return new ResponseEntity<>(excelBytes, headers, HttpStatus.OK);
    }

    private Long getCurrentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
