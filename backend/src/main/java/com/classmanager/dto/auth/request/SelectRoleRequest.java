package com.classmanager.dto.auth.request;

import com.classmanager.enums.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Yêu cầu lựa chọn vai trò (Onboarding)")
public class SelectRoleRequest {

    @NotNull(message = "Role cannot be null")
    @Schema(description = "Vai trò được chọn (Chỉ chấp nhận TEACHER hoặc STUDENT)", example = "TEACHER")
    private Role role;
}
