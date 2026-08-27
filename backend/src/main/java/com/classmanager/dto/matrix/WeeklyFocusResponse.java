package com.classmanager.dto.matrix;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WeeklyFocusResponse {
    private Integer classId;
    private Integer academicYear;
    private Integer weekNumber;
    private LocalDate weekStartDate;
    private Boolean isLocked;
    private List<WeeklyFocusGroupDTO> groups;
}
