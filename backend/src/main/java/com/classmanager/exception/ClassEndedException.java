package com.classmanager.exception;

import org.springframework.http.HttpStatus;

public class ClassEndedException extends CustomException {
    public ClassEndedException() {
        super(HttpStatus.CONFLICT, "CLASS_ENDED", "Class has already ended and is read-only.");
    }
}
