package com.classmanager.dto.matrix;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WeeklyStudentLogDTO {
    private Long id;
    private Integer pointValue;
    private String reason;
    private String dayOfWeek;
    private Long createdByUserId;
    private String createdByName;
    private LocalDateTime createdAt;
}
