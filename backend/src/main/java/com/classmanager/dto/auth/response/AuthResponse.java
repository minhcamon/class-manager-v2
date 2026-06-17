package com.classmanager.dto.auth.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Thông tin phản hồi chứa JWT Access Token và thông tin bổ sung")
public class AuthResponse {

    @Schema(description = "JWT Access Token dùng để truy cập các API được bảo vệ", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6...")
    private String accessToken;

    @Schema(description = "Thời gian hết hạn của Access Token (tính bằng mili giây)", example = "7200000")
    private long expiresIn;

    @Schema(description = "Thông điệp bổ sung phản hồi từ hệ thống", example = "Login successfully")
    private String message;
}
