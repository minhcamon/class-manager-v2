package com.classmanager.dto.school.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Response containing class member details with points and group mapping")
public class ClassStudentResponse {

    @Schema(description = "ID of the student's profile", example = "1")
    private Integer studentProfileId;

    @Schema(description = "ID of the user", example = "5")
    private Long userId;

    @Schema(description = "Full name of the student", example = "Nguyễn Văn Học Sinh")
    private String fullName;

    @Schema(description = "Username of the student", example = "student1")
    private String username;

    @Schema(description = "Phone number of the student", example = "0987654321")
    private String phoneNumber;

    @Schema(description = "ID of the group (Tổ)", example = "2")
    private Integer groupId;

    @Schema(description = "Name of the group", example = "Tổ 1")
    private String groupName;

    @Schema(description = "Whether this student is the leader of their group", example = "true")
    private Boolean isLeader;

    @Schema(description = "Dynamically calculated points", example = "115")
    private Integer currentPoint;
}
