package com.classmanager.dto.school.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Response containing student current points calculation")
public class StudentCurrentPointResponse {

    @Schema(description = "ID of the student profile", example = "1")
    private Integer studentId;

    @Schema(description = "Full name of the student", example = "Nguyễn Văn Học Sinh")
    private String fullName;

    @Schema(description = "Base points of the class", example = "100")
    private Integer basePoint;

    @Schema(description = "Sum of all point logs for this student", example = "15")
    private Integer totalDelta;

    @Schema(description = "Calculated current point (basePoint + totalDelta)", example = "115")
    private Integer currentPoint;
}
