package com.classmanager.exception;

import org.springframework.http.HttpStatus;

public class InvalidWeekDateException extends CustomException {
    public InvalidWeekDateException() {
        super(HttpStatus.BAD_REQUEST, "INVALID_WEEK_DATE", "Week start date must be a Monday.");
    }
}
