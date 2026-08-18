package com.classmanager.dto.school.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Response summary after executing group import")
public class GroupImportResultResponse {

    @Schema(description = "Number of new groups created", example = "4")
    private int groupsCreated;

    @Schema(description = "Number of students assigned to groups", example = "32")
    private int studentsAssigned;

    @Schema(description = "Number of group leaders assigned", example = "4")
    private int leadersAssigned;

    @Schema(description = "Names of groups created or modified", example = "[\"Tổ 1\", \"Tổ 2\"]")
    private List<String> groupNames;

    @Schema(description = "Success message summary", example = "Import thành công 32 học sinh vào 4 tổ.")
    private String message;
}
