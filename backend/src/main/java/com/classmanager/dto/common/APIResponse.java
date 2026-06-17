package com.classmanager.dto.common;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class APIResponse<T> {
    private boolean isSuccess;
    private int code;
    private String message;
    private T data;

    public static <T> APIResponse<T> success(String message, T data) {
        return APIResponse.<T>builder()
                .isSuccess(true)
                .code(200)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> APIResponse<T> success(int code, String message, T data) {
        return APIResponse.<T>builder()
                .isSuccess(true)
                .code(code)
                .message(message)
                .data(data)
                .build();
    }
}
