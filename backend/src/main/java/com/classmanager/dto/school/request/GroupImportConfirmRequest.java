package com.classmanager.dto.school.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Request body for confirming execution of group import")
public class GroupImportConfirmRequest {

    @Schema(description = "List of validated import rows to execute", requiredMode = Schema.RequiredMode.REQUIRED)
    private List<ConfirmRow> rows;

    @Schema(description = "Automatically create new groups if group name does not exist", example = "true")
    @Builder.Default
    private Boolean createNewGroups = true;

    public boolean isCreateNewGroups() {
        return createNewGroups == null || Boolean.TRUE.equals(createNewGroups);
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ConfirmRow {
        @Schema(description = "ID of the student profile", example = "10")
        private Integer studentProfileId;

        @Schema(description = "Target group name", example = "Tổ 1")
        private String groupName;

        @Schema(description = "Whether student is group leader", example = "true")
        @Builder.Default
        private Boolean isLeader = false;

        public boolean isLeader() {
            return Boolean.TRUE.equals(isLeader);
        }
    }
}
