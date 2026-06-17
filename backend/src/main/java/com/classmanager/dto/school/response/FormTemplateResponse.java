package com.classmanager.dto.school.response;

import com.classmanager.dto.school.request.FormFieldDto;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Response containing form template details")
public class FormTemplateResponse {
    @Schema(description = "Unique ID of the form template version", example = "1")
    private Integer id;
    
    @Schema(description = "ID of the class this form belongs to", example = "1")
    private Integer classId;
    
    @Schema(description = "Title of the form", example = "Student Profile v1")
    private String title;
    
    @Schema(description = "Structure of the dynamic fields")
    private List<FormFieldDto> structure;
    
    @Schema(description = "Version number of the form", example = "1")
    private Integer version;
    
    @Schema(description = "Whether this is the currently active form for the class", example = "true")
    private boolean isActive;
    
    @Schema(description = "Timestamp when the form template was created")
    private LocalDateTime createdAt;
}
