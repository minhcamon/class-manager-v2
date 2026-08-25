package com.classmanager.dto.behavior;

import com.classmanager.enums.BehaviorType;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BehaviorLogItemDTO {
    private Long id;
    private Integer studentId;
    private String studentName;
    private Integer classId;
    private Integer academicYear;
    private Integer semester;
    private Integer weekNumber;
    private String ruleName;
    private BehaviorType type;
    private Integer unitPoint;
    private Integer quantity;
    private Integer totalPoints;
    private String dayOfWeek;
    private String note;
    private Long createdByUserId;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
