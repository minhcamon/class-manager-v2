package com.classmanager.dto.matrix;

import lombok.*;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StudentMatrixDTO {
    private Integer studentId;
    private String studentName;
    private String groupName;
    private Integer totalAcademicPoints;
    private Boolean isLeader;
    private List<String> roles;
    private List<WeekCellDTO> weekCells;
}
