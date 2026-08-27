package com.classmanager.dto.matrix;

import lombok.*;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WeeklyFocusStudentDTO {
    private Integer studentId;
    private String studentName;
    private String groupName;
    private Boolean isLeader;
    private List<String> roles;
    private Integer totalPlus;
    private Integer totalMinus;
    private Integer netScore;
    private List<WeeklyStudentLogDTO> logs;
}
