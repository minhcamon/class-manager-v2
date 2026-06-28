package com.classmanager.dto.school.response;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyReportResponse {
    private LocalDate weekStartDate;
    private LocalDate weekEndDate;
    private LocalDateTime lockedAt;
    private String lockedBy;
    private List<WeeklyReportEntry> entries;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeeklyReportEntry {
        private Integer studentId;
        private String name;
        private String groupName;
        private Integer finalPoint;
        private Integer totalBonus;
        private Integer totalPenalty;
        private Integer classRank;
        private Integer groupRank;
    }
}
