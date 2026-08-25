package com.classmanager.dto.behavior;

import com.classmanager.enums.BehaviorType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Request to log a student behavior event")
public class BehaviorCreateRequest {

    @NotNull(message = "Student profile ID is required")
    private Integer studentId;

    @NotNull(message = "Class ID is required")
    private Integer classId;

    @NotNull(message = "Academic year is required")
    private Integer academicYear;

    @NotNull(message = "Semester is required")
    @Min(value = 1, message = "Semester must be 1 or 2")
    @Max(value = 2, message = "Semester must be 1 or 2")
    private Integer semester;

    @NotNull(message = "Week number is required")
    @Min(value = 1, message = "Week number must be between 1 and 52")
    @Max(value = 52, message = "Week number must be between 1 and 52")
    private Integer weekNumber;

    @NotBlank(message = "Rule name is required")
    @Size(max = 100, message = "Rule name must be at most 100 characters")
    private String ruleName;

    @NotNull(message = "Behavior type is required")
    private BehaviorType type;

    @NotNull(message = "Unit point is required")
    private Integer unitPoint;

    @Min(value = 1, message = "Quantity must be at least 1")
    @Builder.Default
    private Integer quantity = 1;

    private String dayOfWeek;

    private String note;
}
