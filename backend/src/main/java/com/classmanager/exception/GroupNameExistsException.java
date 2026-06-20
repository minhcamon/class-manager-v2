package com.classmanager.exception;

import org.springframework.http.HttpStatus;

public class GroupNameExistsException extends CustomException {
    public GroupNameExistsException() {
        super(HttpStatus.CONFLICT, "GROUP_NAME_EXISTS", "Group name already exists in this class.");
    }
}
