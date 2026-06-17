package com.classmanager.dto.auth.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Yêu cầu đăng nhập tài khoản cục bộ")
public class UserLoginRequest {

    @NotBlank(message = "Username cannot be blank")
    @Schema(description = "Tên đăng nhập", example = "teacher_dev")
    private String username;

    @NotBlank(message = "Password cannot be blank")
    @Schema(description = "Mật khẩu bảo mật", example = "SecretPassword123")
    private String password;
}
