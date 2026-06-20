package com.classmanager.dto.school.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Response containing point log details")
public class PointLogResponse {

    @Schema(description = "ID of the point log", example = "100")
    private Long id;

    @Schema(description = "ID of the target student profile", example = "1")
    private Integer studentId;

    @Schema(description = "Full name of the target student", example = "Nguyễn Văn An")
    private String studentName;

    @Schema(description = "Point reward or penalty value", example = "10")
    private Integer pointValue;

    @Schema(description = "Reason for the reward or penalty", example = "Phát biểu xây dựng bài học")
    private String reason;

    @Schema(description = "Starting Monday of the evaluation week (YYYY-MM-DD)", example = "2026-06-15")
    private LocalDate weekStartDate;

    @Schema(description = "ID of the user who logged the points", example = "2")
    private Long createdByUserId;

    @Schema(description = "Name of the user who logged the points", example = "Nguyễn Văn Giáo Viên")
    private String createdByName;

    @Schema(description = "Timestamp when the log was created", example = "2026-06-16T10:15:30")
    private LocalDateTime createdAt;
}
