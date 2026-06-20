package com.classmanager.dto.school.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Request to assign student to a group")
public class GroupAssignRequest {

    @Schema(description = "ID of the group. If null, the student will be removed from their group.", example = "2")
    private Integer groupId;
}
