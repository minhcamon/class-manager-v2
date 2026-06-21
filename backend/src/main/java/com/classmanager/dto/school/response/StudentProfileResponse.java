package com.classmanager.dto.school.response;

import com.classmanager.dto.school.request.FormFieldDto;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Response containing student profile details")
public class StudentProfileResponse {
    @Schema(description = "Unique ID of the student profile record", example = "1")
    private Integer id;
    
    @Schema(description = "ID of the student's enrollment", example = "101")
    private Integer enrollmentId;
    
    @Schema(description = "ID of the form version used for this data", example = "1")
    private Integer formVersionId;
    
    @Schema(description = "Version number of the form", example = "1")
    private Integer formVersion;
    
    @Schema(description = "Structure of the form that was filled")
    private List<FormFieldDto> formStructure;
    
    @Schema(description = "Profile data (key-value pairs)")
    private Map<String, Object> data;

    @Schema(description = "ID of the group the student belongs to", example = "5")
    private Integer groupId;

    @Schema(description = "Name of the group", example = "Tổ 1")
    private String groupName;

    @Schema(description = "Is student the leader of their group", example = "true")
    private Boolean isLeader;
    
    @Schema(description = "Timestamp of last update")
    private LocalDateTime updatedAt;
}
