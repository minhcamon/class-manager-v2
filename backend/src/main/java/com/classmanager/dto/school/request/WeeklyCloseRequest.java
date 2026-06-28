package com.classmanager.dto.school.request;

import lombok.*;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyCloseRequest {
    private Integer classId;
    private LocalDate weekStartDate;
}
