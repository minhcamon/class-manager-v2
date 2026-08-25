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
    private List<WeekCellDTO> weekCells;
}
