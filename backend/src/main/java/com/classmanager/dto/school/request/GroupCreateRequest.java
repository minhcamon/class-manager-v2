package com.classmanager.dto.school.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Request to create a new group (Tổ)")
public class GroupCreateRequest {

    @NotNull(message = "Class ID is required")
    @Schema(description = "ID of the class", example = "1")
    private Integer classId;

    @NotBlank(message = "Group name is required")
    @Schema(description = "Name of the group", example = "Tổ 1")
    private String groupName;
}
