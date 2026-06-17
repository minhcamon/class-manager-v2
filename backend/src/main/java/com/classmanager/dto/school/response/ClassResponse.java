package com.classmanager.dto.school.response;

import com.classmanager.enums.ClassStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Response containing class details")
public class ClassResponse {
    @Schema(description = "Unique ID of the class", example = "1")
    private Integer id;
    
    @Schema(description = "Name of the class", example = "10A1")
    private String className;
    
    @Schema(description = "Grade level", example = "10")
    private Integer grade;
    
    @Schema(description = "Current status of the class")
    private ClassStatus status;
    
    @Schema(description = "Base point for the class", example = "100")
    private Integer basePoint;
    
    @Schema(description = "ID of the teacher managing this class", example = "42")
    private Long teacherId;

    @Schema(description = "Full name of the teacher", example = "Nguyễn Văn A")
    private String teacherName;
    
    @Schema(description = "ID of the school this class belongs to", example = "5")
    private Long schoolId;
    
    @Schema(description = "Name of the school", example = "Lê Hồng Phong High School")
    private String schoolName;

    @Schema(description = "Unique code to join the class", example = "CLASS-123456")
    private String classCode;

    @Schema(description = "Number of students enrolled in this class", example = "42")
    private Long studentCount;
    
    @Schema(description = "Timestamp when the class was created")
    private LocalDateTime createdAt;
}
