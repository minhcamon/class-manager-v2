package com.classmanager.dto.school.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Definition of a single field in the dynamic form")
public class FormFieldDto {
    @Schema(description = "Internal field name (camelCase recommended)", example = "parentPhone")
    private String fieldName;
    
    @Schema(description = "Display label for the field", example = "Parent's Phone Number")
    private String label;
    
    @Schema(description = "Data type of the field", allowableValues = {"text", "number", "boolean", "select", "date", "textarea"}, example = "text")
    private String type; 
    
    @Schema(description = "Whether this field is mandatory", example = "true")
    private boolean required;
    
    @Schema(description = "List of options for 'select' type fields", example = "[\"Option 1\", \"Option 2\"]")
    private List<String> options;
}
