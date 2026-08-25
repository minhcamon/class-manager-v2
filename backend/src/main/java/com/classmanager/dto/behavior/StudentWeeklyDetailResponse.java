package com.classmanager.dto.behavior;

import lombok.*;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StudentWeeklyDetailResponse {
    private Integer studentId;
    private String studentName;
    private String groupName;
    private Integer classId;
    private Integer academicYear;
    private Integer weekNumber;
    private Integer netScore;
    private Integer totalBonus;
    private Integer totalPenalty;
    private Integer totalAcademicPoints;
    private List<BehaviorLogItemDTO> logs;
}
