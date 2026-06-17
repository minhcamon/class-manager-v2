package com.classmanager.dto.auth.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Yêu cầu đăng ký tài khoản mới bằng thông tin cục bộ")
public class UserRegisterRequest {

    @NotBlank(message = "Username cannot be blank")
    @Size(min = 4, max = 50, message = "Username must be between 4 and 50 characters")
    @Schema(description = "Tên đăng nhập", example = "teacher_dev", minLength = 4, maxLength = 50)
    private String username;

    @NotBlank(message = "Password cannot be blank")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Schema(description = "Mật khẩu bảo mật", example = "SecretPassword123")
    private String password;

    @NotBlank(message = "Phone number cannot be blank")
    @Pattern(regexp = "^\\+?[0-9]{9,15}$", message = "Phone number is invalid")
    @Schema(description = "Số điện thoại liên hệ", example = "0987654321")
    private String phoneNumber;

    @NotBlank(message = "Full name cannot be blank")
    @Size(max = 100, message = "Full name must not exceed 100 characters")
    @Schema(description = "Họ và tên đầy đủ", example = "Nguyễn Văn Giáo Viên")
    private String fullName;
}
