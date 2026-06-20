package com.classmanager.dto.school.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Request to assign a group leader")
public class LeaderAssignRequest {

    @NotNull(message = "Student profile ID is required")
    @Schema(description = "ID of the student profile to be assigned as leader", example = "5")
    private Integer studentProfileId;
}
