package com.classmanager.dto.school.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "DTO representing a row parsed from an Excel or CSV file during group import")
public class GroupImportRowDto {

    @Schema(description = "Row number in the uploaded file", example = "2")
    private int rowNumber;

    @Schema(description = "Student identifier (Roll Code / Email / Full Name)", example = "HS001")
    private String studentIdentifier;

    @Schema(description = "Student full name found in database or file", example = "Nguyễn Văn A")
    private String studentName;

    @Schema(description = "Matched student profile ID if found", example = "10")
    private Integer studentProfileId;

    @Schema(description = "Target group name", example = "Tổ 1")
    private String groupName;

    @Schema(description = "Whether this student is designated as group leader", example = "true")
    @Builder.Default
    private Boolean isLeader = false;

    public boolean isLeader() {
        return Boolean.TRUE.equals(isLeader);
    }

    @Schema(description = "Validation status (VALID, STUDENT_NOT_FOUND, MISSING_GROUP, MULTIPLE_LEADERS, DUPLICATE_STUDENT)", example = "VALID")
    private String status;

    @Schema(description = "Detailed validation or error message", example = "Hợp lệ")
    private String statusMessage;
}
