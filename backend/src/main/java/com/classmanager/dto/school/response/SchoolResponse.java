package com.classmanager.dto.school.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Response containing school details")
public class SchoolResponse {
    @Schema(description = "Unique ID of the school", example = "1")
    private Long id;

    @Schema(description = "Name of the school", example = "Lê Hồng Phong High School")
    private String name;

    @Schema(description = "Address of the school", example = "123 Nguyễn Du, District 1, HCMC")
    private String address;
}
