package com.classmanager.dto.behavior;

import com.classmanager.enums.BehaviorType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Request to update an existing behavior log")
public class BehaviorUpdateRequest {

    @Size(max = 100, message = "Rule name must be at most 100 characters")
    private String ruleName;

    private BehaviorType type;

    private Integer unitPoint;

    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    private String dayOfWeek;

    private String note;
}
