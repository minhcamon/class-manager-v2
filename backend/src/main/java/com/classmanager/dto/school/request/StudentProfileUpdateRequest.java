package com.classmanager.dto.school.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Request to update student profile data")
public class StudentProfileUpdateRequest {
    @Schema(description = "Key-value pairs of profile data matching the active form structure", example = "{\"parentPhone\": \"0901234567\", \"address\": \"123 Main St\"}")
    private Map<String, Object> data;
}
