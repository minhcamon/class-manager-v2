package com.classmanager.exception;

import org.springframework.http.HttpStatus;

public class ActiveClassExistsException extends CustomException {
    public ActiveClassExistsException() {
        super(HttpStatus.CONFLICT, "ACTIVE_CLASS_EXISTS", "Teacher already has an active class.");
    }
}
