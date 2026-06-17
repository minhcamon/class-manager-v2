package com.classmanager.exception;

import com.classmanager.dto.common.ErrorDetail;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import java.util.List;

@Getter
public class CustomException extends RuntimeException {
    private final HttpStatus status;
    private final String error;
    private final List<ErrorDetail> details;

    public CustomException(HttpStatus status, String error, String message) {
        super(message);
        this.status = status;
        this.error = error;
        this.details = null;
    }

    public CustomException(HttpStatus status, String error, String message, List<ErrorDetail> details) {
        super(message);
        this.status = status;
        this.error = error;
        this.details = details;
    }
}
