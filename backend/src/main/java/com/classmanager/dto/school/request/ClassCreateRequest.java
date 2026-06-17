package com.classmanager.dto.school.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Request to create a new class")
public class ClassCreateRequest {

    @NotBlank(message = "Class name is required")
    @Schema(description = "Name of the class", example = "10A1")
    private String className;

    @NotNull(message = "Grade is required")
    @Min(value = 10, message = "Grade must be between 10 and 12")
    @Max(value = 12, message = "Grade must be between 10 and 12")
    @Schema(description = "Grade level (10, 11, or 12)", example = "10")
    private Integer grade;

    @NotNull(message = "Base point is required")
    @Builder.Default
    @Schema(description = "Starting base point for students in this class", example = "100")
    private Integer basePoint = 100;
}
