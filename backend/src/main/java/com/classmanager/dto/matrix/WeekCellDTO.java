package com.classmanager.dto.matrix;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WeekCellDTO {
    private Integer weekNumber;
    private Integer netScore;
    private Integer posScore;
    private Integer negScore;
    private Long logCount;
}
