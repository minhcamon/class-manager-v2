package com.classmanager.exception;

import org.springframework.http.HttpStatus;

public class ProfileNotFoundException extends CustomException {
    public ProfileNotFoundException() {
        super(HttpStatus.NOT_FOUND, "PROFILE_NOT_FOUND", "Student profile not found.");
    }
}
