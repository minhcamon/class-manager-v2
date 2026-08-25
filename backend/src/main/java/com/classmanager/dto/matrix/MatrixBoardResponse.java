package com.classmanager.dto.matrix;

import lombok.*;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MatrixBoardResponse {
    private Integer classId;
    private Integer academicYear;
    private Integer semester;
    private Integer fromWeek;
    private Integer toWeek;
    private List<GroupMatrixDTO> groups;
}
