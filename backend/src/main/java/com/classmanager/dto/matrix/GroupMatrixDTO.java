package com.classmanager.dto.matrix;

import lombok.*;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GroupMatrixDTO {
    private Integer groupId;
    private String groupName;
    private Double groupAvgScore;
    private List<StudentMatrixDTO> students;
}
