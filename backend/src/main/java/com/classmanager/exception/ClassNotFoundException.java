package com.classmanager.exception;

import org.springframework.http.HttpStatus;

public class ClassNotFoundException extends CustomException {
    public ClassNotFoundException() {
        super(HttpStatus.NOT_FOUND, "CLASS_NOT_FOUND", "Class not found.");
    }
}
