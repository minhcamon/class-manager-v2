package com.classmanager.dto.audit;

import com.classmanager.enums.AuditAction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditActionSummary {
    private AuditAction action;
    private Long count;
}
