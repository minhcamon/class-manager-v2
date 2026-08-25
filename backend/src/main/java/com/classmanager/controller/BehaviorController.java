package com.classmanager.controller;

import com.classmanager.dto.behavior.*;
import com.classmanager.dto.common.APIResponse;
import com.classmanager.service.StudentWeeklyBehaviorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/behaviors")
@RequiredArgsConstructor
@Tag(name = "Behaviors", description = "APIs for logging, updating, and deleting student weekly behaviors")
public class BehaviorController {

    private final StudentWeeklyBehaviorService behaviorService;

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'STUDENT', 'ADMIN')")
    @Operation(summary = "Create student behavior log")
    public ResponseEntity<APIResponse<BehaviorLogItemDTO>> createBehavior(
            @Valid @RequestBody BehaviorCreateRequest request) {
        Long currentUserId = getCurrentUserId();
        BehaviorLogItemDTO response = behaviorService.createBehavior(currentUserId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(APIResponse.success("Ghi nhận điểm thi đua thành công", response));
    }

    @PostMapping("/batch")
    @PreAuthorize("hasAnyRole('TEACHER', 'STUDENT', 'ADMIN')")
    @Operation(summary = "Create behavior logs in batch for multiple students")
    public ResponseEntity<APIResponse<Void>> createBehaviorsBatch(
            @Valid @RequestBody BehaviorBatchRequest request) {
        Long currentUserId = getCurrentUserId();
        behaviorService.createBehaviorsBatch(currentUserId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(APIResponse.success("Ghi nhận điểm thi đua hàng loạt thành công", null));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'STUDENT', 'ADMIN')")
    @Operation(summary = "Update an existing behavior log within time-window")
    public ResponseEntity<APIResponse<BehaviorLogItemDTO>> updateBehavior(
            @PathVariable Long id,
            @Valid @RequestBody BehaviorUpdateRequest request) {
        Long currentUserId = getCurrentUserId();
        BehaviorLogItemDTO response = behaviorService.updateBehavior(currentUserId, id, request);
        return ResponseEntity.ok(APIResponse.success("Cập nhật bản ghi thành công", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'STUDENT', 'ADMIN')")
    @Operation(summary = "Delete a behavior log within time-window")
    public ResponseEntity<APIResponse<Void>> deleteBehavior(@PathVariable Long id) {
        Long currentUserId = getCurrentUserId();
        behaviorService.deleteBehavior(currentUserId, id);
        return ResponseEntity.ok(APIResponse.success("Xóa bản ghi thành công", null));
    }

    private Long getCurrentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
