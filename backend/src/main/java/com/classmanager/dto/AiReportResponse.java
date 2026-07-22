package com.classmanager.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiReportResponse {

    private String summaryText;
    private List<String> strengths;
    private List<String> improvements;
    private List<String> suggestedActions;
    private boolean isFallback;
    private String providerUsed;
}
