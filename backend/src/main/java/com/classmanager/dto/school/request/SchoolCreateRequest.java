package com.classmanager.dto.school.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Yêu cầu tạo trường học mới")
public class SchoolCreateRequest {

    @NotBlank(message = "School name cannot be blank")
    @Size(max = 255, message = "School name must not exceed 255 characters")
    @Schema(description = "Tên trường học", example = "Trường THPT Amsterdam")
    private String name;

    @NotBlank(message = "School address cannot be blank")
    @Size(max = 500, message = "School address must not exceed 500 characters")
    @Schema(description = "Địa chỉ trường học", example = "1 Hoàng Minh Giám, Cầu Giấy, Hà Nội")
    private String address;
}
