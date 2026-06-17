package com.classmanager.dto.school.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class EnrollmentResponse {
    private Integer id;
    private Long studentId;
    private Integer classId;
    private String status;
    private LocalDateTime createdAt;
}
