package com.classmanager.exception;

import org.springframework.http.HttpStatus;

public class FormNotFoundException extends CustomException {
    public FormNotFoundException() {
        super(HttpStatus.NOT_FOUND, "FORM_NOT_FOUND", "Active form not found for this class.");
    }
}
