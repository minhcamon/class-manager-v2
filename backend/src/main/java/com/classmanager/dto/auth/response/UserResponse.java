package com.classmanager.dto.auth.response;

import com.classmanager.enums.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Thông tin chi tiết tài khoản người dùng")
public class UserResponse {

    @Schema(description = "Tên đăng nhập (sẽ là null nếu đăng nhập bằng Google)", example = "teacher_dev")
    private String username;

    @Schema(description = "Địa chỉ email Google (sẽ là null nếu đăng ký thủ công)", example = "teacher@gmail.com")
    private String googleEmail;

    @Schema(description = "Số điện thoại liên hệ", example = "0987654321")
    private String phoneNumber;

    @Schema(description = "Họ và tên đầy đủ", example = "Nguyễn Văn Giáo Viên")
    private String fullName;

    @Schema(description = "Vai trò trong hệ thống", example = "TEACHER")
    private Role role;

    @Schema(description = "Tên trường học liên kết (sẽ là null nếu chưa chọn role hoặc là học sinh)", example = "Trường THPT Amsterdam")
    private String schoolName;

    @Schema(description = "Đường dẫn ảnh đại diện", example = "https://lh3.googleusercontent.com/...")
    private String avatarUrl;

    @Schema(description = "Thời gian tạo tài khoản", example = "2026-06-17T15:54:42")
    private LocalDateTime createdAt;
}
