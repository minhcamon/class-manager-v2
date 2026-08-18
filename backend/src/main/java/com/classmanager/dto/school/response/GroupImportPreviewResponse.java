package com.classmanager.dto.school.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Response containing file parsing preview and validation breakdown")
public class GroupImportPreviewResponse {

    @Schema(description = "Total rows parsed from file", example = "35")
    private int totalRows;

    @Schema(description = "Number of valid rows ready for import", example = "32")
    private int validRows;

    @Schema(description = "Number of rows with validation errors", example = "3")
    private int invalidRows;

    @Schema(description = "Number of new groups that will be created", example = "4")
    private int newGroupsCount;

    @Schema(description = "List of new group names to be created", example = "[\"Tổ 1\", \"Tổ 2\", \"Tổ 3\", \"Tổ 4\"]")
    private List<String> newGroupNames;

    @Schema(description = "Detailed status of each row parsed", requiredMode = Schema.RequiredMode.REQUIRED)
    private List<GroupImportRowDto> rows;
}
