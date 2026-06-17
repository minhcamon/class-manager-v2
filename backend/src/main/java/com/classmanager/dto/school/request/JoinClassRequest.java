package com.classmanager.dto.school.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class JoinClassRequest {
    @NotBlank(message = "Class code is required")
    private String classCode;
    private String classPassword;
}
