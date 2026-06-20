package com.classmanager.dto.school.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Response containing group (Tổ) details")
public class GroupResponse {

    @Schema(description = "ID of the group", example = "1")
    private Integer id;

    @Schema(description = "ID of the class", example = "1")
    private Integer classId;

    @Schema(description = "Name of the group", example = "Tổ 1")
    private String groupName;

    @Schema(description = "ID of the leader student profile", example = "5")
    private Integer leaderStudentId;

    @Schema(description = "Full name of the group leader", example = "Nguyễn Văn A")
    private String leaderName;
}
