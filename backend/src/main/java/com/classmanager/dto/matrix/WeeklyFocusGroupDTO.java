package com.classmanager.dto.matrix;

import lombok.*;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WeeklyFocusGroupDTO {
    private Integer groupId;
    private String groupName;
    private Double groupAvgScore;
    private Integer totalGroupPlus;
    private Integer totalGroupMinus;
    private Integer totalGroupNet;
    private Integer rank;
    private Integer leaderStudentId;
    private String leaderName;
    private List<WeeklyFocusStudentDTO> students;
}
