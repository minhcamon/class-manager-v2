package com.classmanager.controller;

import com.classmanager.dto.audit.AuditActionSummary;
import com.classmanager.dto.audit.AuditLogFilterCriteria;
import com.classmanager.dto.audit.AuditLogResponse;
import com.classmanager.enums.AuditAction;
import com.classmanager.enums.AuditActorType;
import com.classmanager.enums.AuditTargetEntity;
import com.classmanager.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/audit-logs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Audit Logs", description = "Endpoints dành cho Quản trị viên tra cứu nhật ký kiểm toán hệ thống")
public class AdminAuditLogController {

    private final AuditLogService auditLogService;

    @Operation(summary = "Danh sách nhật ký kiểm toán toàn hệ thống", description = "Hỗ trợ phân trang, sắp xếp và lọc đa tiêu chí.")
    @GetMapping
    public ResponseEntity<Page<AuditLogResponse>> getAuditLogs(
            @RequestParam(required = false) Long actorId,
            @RequestParam(required = false) AuditActorType actorType,
            @RequestParam(required = false) AuditAction action,
            @RequestParam(required = false) AuditTargetEntity targetEntity,
            @RequestParam(required = false) String targetId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        AuditLogFilterCriteria criteria = AuditLogFilterCriteria.builder()
                .actorId(actorId)
                .actorType(actorType)
                .action(action)
                .targetEntity(targetEntity)
                .targetId(targetId)
                .fromDate(fromDate)
                .toDate(toDate)
                .build();

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(auditLogService.getAuditLogs(criteria, pageable));
    }

    @Operation(summary = "Chi tiết một bản ghi nhật ký kiểm toán", description = "Trả về đầy đủ thông tin chi tiết và dữ liệu snapshot Diff.")
    @GetMapping("/{id}")
    public ResponseEntity<AuditLogResponse> getAuditLogById(@PathVariable Long id) {
        return ResponseEntity.ok(auditLogService.getAuditLogById(id));
    }

    @Operation(summary = "Thống kê tổng quan số lượng các hành động đã ghi log", description = "Hỗ trợ render số lượng thống kê theo Action trên giao diện.")
    @GetMapping("/actions-summary")
    public ResponseEntity<List<AuditActionSummary>> getActionsSummary() {
        return ResponseEntity.ok(auditLogService.getActionsSummary());
    }
}
