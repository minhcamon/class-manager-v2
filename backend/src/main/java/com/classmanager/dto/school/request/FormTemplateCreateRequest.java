package com.classmanager.dto.school.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Request to create a new form template version")
public class FormTemplateCreateRequest {
    @NotBlank(message = "Title is required")
    @Schema(description = "Title of the form version", example = "Student Profile v1")
    private String title;

    @NotEmpty(message = "Structure cannot be empty")
    @Schema(description = "List of field definitions for this form")
    private List<FormFieldDto> structure;
}
