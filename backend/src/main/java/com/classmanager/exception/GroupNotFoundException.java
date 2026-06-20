package com.classmanager.exception;

import org.springframework.http.HttpStatus;

public class GroupNotFoundException extends CustomException {
    public GroupNotFoundException() {
        super(HttpStatus.NOT_FOUND, "GROUP_NOT_FOUND", "Group not found.");
    }
}
