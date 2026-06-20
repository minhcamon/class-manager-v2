package com.classmanager.dto.school.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request body for updating an existing point log entry")
public class PointLogUpdateRequest {

    @Min(value = -100, message = "Point value must be at least -100")
    @Max(value = 100, message = "Point value must be at most 100")
    @Schema(description = "New point reward or penalty value (optional)", example = "-5")
    private Integer pointValue;

    @Size(min = 5, message = "Reason must be at least 5 characters")
    @Schema(description = "Updated reason for the point entry (optional)", example = "Không hoàn thành bài tập về nhà")
    private String reason;
}
