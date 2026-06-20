package com.classmanager.exception;

import org.springframework.http.HttpStatus;

public class GroupLeaderConflictException extends CustomException {
    public GroupLeaderConflictException() {
        super(HttpStatus.BAD_REQUEST, "LEADER_NOT_IN_GROUP", "Group leader must belong to the group.");
    }
}
