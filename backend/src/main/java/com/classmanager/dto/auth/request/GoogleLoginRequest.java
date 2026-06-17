package com.classmanager.dto.auth.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Yêu cầu đăng nhập hoặc đăng ký bằng tài khoản Google")
public class GoogleLoginRequest {

    @NotBlank(message = "Google ID Token cannot be blank")
    @Schema(description = "ID Token của Google nhận được từ thư viện client phía Frontend", example = "eyJhbGciOiJSUzI1NiIsImtpZCI6...")
    private String idToken;
}
