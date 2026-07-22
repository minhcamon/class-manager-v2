package com.classmanager.controller;

import com.classmanager.dto.AiChatRefineRequest;
import com.classmanager.dto.AiReportRequest;
import com.classmanager.dto.AiReportResponse;
import com.classmanager.dto.common.APIResponse;
import com.classmanager.exception.CustomException;
import com.classmanager.repository.ClassRepository;
import com.classmanager.service.AiReportService;
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
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Tag(name = "AI Assistant", description = "APIs for Small LLM powered weekly evaluation reports and chatbot refinements")
public class AiController {

    private final AiReportService aiReportService;
    private final ClassRepository classRepository;

    @PostMapping("/weekly-summary")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(summary = "Generate weekly evaluation summary for a student or class")
    public ResponseEntity<APIResponse<AiReportResponse>> generateWeeklySummary(@Valid @RequestBody AiReportRequest request) {
        validateTeacherOwnership(request.getClassId());
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        
        AiReportResponse response = aiReportService.generateWeeklySummary(request, username);
        return ResponseEntity.ok(APIResponse.success("Sinh nhận xét AI thành công", response));
    }

    @PostMapping("/chat-refine")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(summary = "Refine weekly summary via Chatbot instructions")
    public ResponseEntity<APIResponse<String>> refineSummary(@Valid @RequestBody AiChatRefineRequest request) {
        String refinedText = aiReportService.refineSummary(request);
        return ResponseEntity.ok(APIResponse.success("Tinh chỉnh nhận xét thành công", refinedText));
    }

    private void validateTeacherOwnership(Long classId) {
        Long currentUserId = getCurrentUserId();
        boolean isOwner = classRepository.existsByIdAndTeacherId(classId.intValue(), currentUserId);
        if (!isOwner) {
            throw new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không phải giáo viên chủ nhiệm lớp này.");
        }
    }

    private Long getCurrentUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof Long) {
            return (Long) principal;
        }
        try {
            return Long.parseLong(principal.toString());
        } catch (NumberFormatException e) {
            return 1L;
        }
    }
}
