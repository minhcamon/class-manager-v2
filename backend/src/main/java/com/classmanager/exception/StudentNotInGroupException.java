package com.classmanager.exception;

import org.springframework.http.HttpStatus;

public class StudentNotInGroupException extends CustomException {
    public StudentNotInGroupException() {
        super(HttpStatus.FORBIDDEN, "STUDENT_NOT_IN_GROUP", "Student is not in your group.");
    }
}
