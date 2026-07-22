package com.classmanager.service.ai;

import com.classmanager.dto.AiReportResponse;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class RuleBasedFallbackEngine {

    public AiReportResponse generateFallbackReport(String studentName, int totalBonus, int totalPenalty, int finalPoint, Integer classRank, String tone) {
        List<String> strengths = new ArrayList<>();
        List<String> improvements = new ArrayList<>();
        List<String> suggestedActions = new ArrayList<>();

        // Analyze strengths
        if (totalBonus > 0) {
            strengths.add("Có " + totalBonus + " điểm cộng khen thưởng nhờ tinh thần tích cực và hăng hái tham gia hoạt động.");
        } else {
            strengths.add("Duy trì nề nếp ổn định trong tuần học.");
        }

        // Analyze improvements
        if (totalPenalty > 0) {
            improvements.add("Cần lưu ý khắc phục " + totalPenalty + " lượt vi phạm quy định lớp học trong tuần qua.");
        } else {
            improvements.add("Cần duy trì phong độ tốt và không chủ quan trong các tuần tới.");
        }

        // Actions
        suggestedActions.add("Tăng cường tự giác chấp hành nội quy và nề nếp học tập.");
        if (totalPenalty > 0) {
            suggestedActions.add("Tránh lặp lại các lỗi vi phạm cũ để cải thiện tổng điểm thi đua.");
        }

        // Construct summary based on tone
        StringBuilder sb = new StringBuilder();

        if ("STRICT".equalsIgnoreCase(tone)) {
            sb.append("Trong tuần qua, học sinh ").append(studentName);
            sb.append(" đạt tổng điểm ").append(finalPoint).append(" (Hạng ").append(classRank != null ? classRank : "-").append("). ");
            if (totalPenalty > 0) {
                sb.append("Em còn mắc ").append(totalPenalty).append(" vi phạm cần nghiêm túc kiểm điểm và khắc phục ngay.");
            } else {
                sb.append("Em đã tuân thủ nội quy nhưng cần cố gắng hơn để đạt thành tích cao hơn.");
            }
        } else if ("CONCISE".equalsIgnoreCase(tone)) {
            sb.append("Học sinh ").append(studentName).append(": ").append(finalPoint).append(" điểm (Hạng ").append(classRank != null ? classRank : "-").append("). ");
            sb.append("Thành tích: +").append(totalBonus).append(" | Vi phạm: -").append(totalPenalty).append(". Cần tiếp tục cố gắng.");
        } else {
            // Default MOTIVATIONAL
            sb.append("Tuần vừa qua, học sinh ").append(studentName).append(" đã đạt tổng điểm ").append(finalPoint);
            if (classRank != null) {
                sb.append(" và xếp thứ ").append(classRank).append(" trong lớp.");
            } else {
                sb.append(".");
            }
            if (totalBonus > 0) {
                sb.append(" Tuyên dương tinh thần hăng hái đóng góp của em với ").append(totalBonus).append(" điểm thưởng.");
            }
            if (totalPenalty > 0) {
                sb.append(" Nhắc nhở em cần chú ý hạn chế các sơ suất làm trừ ").append(totalPenalty).append(" điểm thi đua.");
            } else {
                sb.append(" Rất biểu dương em vì giữ vững thành tích không vi phạm.");
            }
        }

        return AiReportResponse.builder()
                .summaryText(sb.toString())
                .strengths(strengths)
                .improvements(improvements)
                .suggestedActions(suggestedActions)
                .isFallback(true)
                .providerUsed("Rule-Based Fallback Engine")
                .build();
    }
}
