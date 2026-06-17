package com.classmanager.exception;

import org.springframework.http.HttpStatus;

public class InvalidFormStructureException extends CustomException {
    public InvalidFormStructureException(String message) {
        super(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", message);
    }
}
