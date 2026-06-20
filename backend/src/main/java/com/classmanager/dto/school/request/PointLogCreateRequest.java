package com.classmanager.dto.school.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Request to log point rewards/penalties")
public class PointLogCreateRequest {

    @NotNull(message = "Student profile ID is required")
    @Schema(description = "ID of the target student's profile", example = "1")
    private Integer studentId;

    @NotNull(message = "Point value is required")
    @Min(value = -100, message = "Point value must be at least -100")
    @Max(value = 100, message = "Point value must be at most 100")
    @Schema(description = "Value of point reward (positive) or penalty (negative). Must not be 0.", example = "10")
    private Integer pointValue;

    @NotBlank(message = "Reason is required")
    @Size(min = 5, max = 500, message = "Reason must be between 5 and 500 characters")
    @Schema(description = "Reason for the reward or penalty", example = "Phát biểu xây dựng bài học")
    private String reason;

    @NotNull(message = "Week start date is required")
    @Schema(description = "Starting Monday of the evaluation week (YYYY-MM-DD)", example = "2026-06-15")
    private LocalDate weekStartDate;
}
