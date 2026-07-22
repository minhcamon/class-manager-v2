package com.classmanager.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiReportRequest {

    @NotNull(message = "classId is required")
    private Long classId;

    private Long studentId; // null = entire class summary, non-null = specific student

    @NotNull(message = "weekStartDate is required")
    private LocalDate weekStartDate;

    private String tone; // 'MOTIVATIONAL', 'STRICT', 'CONCISE' (default: 'MOTIVATIONAL')

    private String customInstruction;
}
