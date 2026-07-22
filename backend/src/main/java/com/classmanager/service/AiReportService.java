package com.classmanager.service;

import com.classmanager.dto.AiChatRefineRequest;
import com.classmanager.dto.AiReportRequest;
import com.classmanager.dto.AiReportResponse;
import com.classmanager.entity.AiRequestLog;
import com.classmanager.entity.CurrentWeekSnapshot;
import com.classmanager.entity.StudentProfile;
import com.classmanager.repository.AiRequestLogRepository;
import com.classmanager.repository.CurrentWeekSnapshotRepository;
import com.classmanager.repository.StudentProfileRepository;
import com.classmanager.service.ai.LlmProviderChain;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiReportService {

    private final StudentProfileRepository studentProfileRepository;
    private final CurrentWeekSnapshotRepository snapshotRepository;
    private final LlmProviderChain providerChain;
    private final AiRequestLogRepository requestLogRepository;

    @Transactional(readOnly = true)
    public AiReportResponse generateWeeklySummary(AiReportRequest request, String currentUsername) {
        long startTime = System.currentTimeMillis();

        String realStudentName = "Học sinh";
        int totalBonus = 0;
        int totalPenalty = 0;
        int finalPoint = 100;
        Integer classRank = null;

        if (request.getStudentId() != null) {
            Optional<StudentProfile> studentOpt = studentProfileRepository.findByIdWithRelations(request.getStudentId().intValue());
            if (studentOpt.isPresent() && studentOpt.get().getEnrollment() != null && studentOpt.get().getEnrollment().getUser() != null) {
                realStudentName = studentOpt.get().getEnrollment().getUser().getFullName();
            }

            Optional<CurrentWeekSnapshot> snapshotOpt = snapshotRepository.findByStudentIdAndWeekStartDate(
                    request.getStudentId().intValue(), request.getWeekStartDate()
            );

            if (snapshotOpt.isPresent()) {
                CurrentWeekSnapshot snapshot = snapshotOpt.get();
                totalBonus = snapshot.getTotalBonus() != null ? snapshot.getTotalBonus() : 0;
                totalPenalty = snapshot.getTotalPenalty() != null ? snapshot.getTotalPenalty() : 0;
                finalPoint = snapshot.getCurrentPoint() != null ? snapshot.getCurrentPoint() : 100;
                classRank = snapshot.getClassRank();
            }
        }

        // PII Masking: Replace real student name with anonymized ID during LLM API call
        String anonymizedName = "Học_Sinh_" + (request.getStudentId() != null ? request.getStudentId() : "1");

        String prompt = buildPrompt(anonymizedName, totalBonus, totalPenalty, finalPoint, classRank, request.getTone(), request.getCustomInstruction());

        AiReportResponse response = providerChain.generateWithFallbackChain(
                prompt, realStudentName, totalBonus, totalPenalty, finalPoint, classRank, request.getTone()
        );

        // Un-mask anonymized name back to real student name if needed
        if (response.getSummaryText() != null) {
            response.setSummaryText(response.getSummaryText().replace(anonymizedName, realStudentName));
        }

        long latency = System.currentTimeMillis() - startTime;
        logAiRequest(request.getStudentId(), request.getClassId(), response.getProviderUsed(),
                response.isFallback() ? "FALLBACK" : "SUCCESS", latency, currentUsername);

        return response;
    }

    public String refineSummary(AiChatRefineRequest request) {
        return providerChain.refineWithFallbackChain(
                request.getCurrentSummary(), request.getUserFeedback(), request.getTone()
        );
    }

    private String buildPrompt(String anonymizedName, int bonus, int penalty, int finalPoint, Integer rank, String tone, String customInstruction) {
        StringBuilder sb = new StringBuilder();
        sb.append("Bạn là một Trợ lý Giáo viên chủ nhiệm chuyên nghiệp tại Việt Nam.\n");
        sb.append("Hãy viết bản nhận xét thi đua nề nếp tuần cho học sinh dựa trên dữ liệu sau:\n");
        sb.append("- Danh tính bảo mật: ").append(anonymizedName).append("\n");
        sb.append("- Điểm thưởng (Cộng): +").append(bonus).append("\n");
        sb.append("- Điểm vi phạm (Trừ): -").append(penalty).append("\n");
        sb.append("- Tổng điểm tuần: ").append(finalPoint).append("\n");
        if (rank != null) {
            sb.append("- Thứ hạng trong lớp: ").append(rank).append("\n");
        }
        sb.append("- Văn phong yêu cầu: ").append(tone != null ? tone : "MOTIVATIONAL").append(" (MOTIVATIONAL: Động viên, STRICT: Nghiêm khắc/Khắc phục, CONCISE: Súc tích)\n");

        if (customInstruction != null && !customInstruction.trim().isEmpty()) {
            sb.append("- Yêu cầu bổ sung của Giáo viên: ").append(customInstruction).append("\n");
        }

        sb.append("\nYêu cầu trả về định dạng JSON duy nhất như sau:\n");
        sb.append("{\n");
        sb.append("  \"summaryText\": \"Đoạn văn nhận xét đầy đủ mang văn phong sư phạm...\",\n");
        sb.append("  \"strengths\": [\"Điểm mạnh 1\", \"Điểm mạnh 2\"],\n");
        sb.append("  \"improvements\": [\"Điểm cần khắc phục 1\"],\n");
        sb.append("  \"suggestedActions\": [\"Lời khuyên hành động 1\"]\n");
        sb.append("}\n");

        return sb.toString();
    }

    private void logAiRequest(Long studentId, Long classId, String provider, String status, long latencyMs, String username) {
        try {
            AiRequestLog logEntity = AiRequestLog.builder()
                    .studentId(studentId)
                    .classId(classId)
                    .provider(provider != null ? provider : "UNKNOWN")
                    .status(status)
                    .latencyMs(latencyMs)
                    .createdByUsername(username)
                    .build();
            requestLogRepository.save(logEntity);
        } catch (Exception e) {
            log.warn("Failed to save AI request log", e);
        }
    }
}
