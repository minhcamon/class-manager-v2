package com.classmanager.dto.school.response;

import lombok.*;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyHistoryResponse {
    private LocalDate weekStartDate;
    private Integer finalPoint;
    private Integer totalBonus;
    private Integer totalPenalty;
    private Integer classRank;
    private Integer groupRank;
}
