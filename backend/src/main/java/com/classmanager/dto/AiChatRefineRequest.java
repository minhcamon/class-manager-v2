package com.classmanager.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiChatRefineRequest {

    @NotBlank(message = "currentSummary is required")
    private String currentSummary;

    @NotBlank(message = "userFeedback is required")
    private String userFeedback;

    private String tone;
}
