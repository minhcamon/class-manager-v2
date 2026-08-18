package com.classmanager.enums;

public enum AuditAction {
    // Feature 1: Auth & Onboarding
    SELECT_ROLE,
    CREATE_SCHOOL,
    WITHDRAW_TEACHER_REQUEST,

    // Feature 2: Class & Groups
    CREATE_CLASS,
    END_CLASS,
    CREATE_GROUP,
    ASSIGN_GROUP_LEADER,
    TRANSFER_STUDENT_GROUP,
    KICK_STUDENT,

    // Feature 3: Form & Dossier
    PUBLISH_FORM_TEMPLATE,
    UPDATE_STUDENT_DOSSIER,

    // Feature 5: Daily Point Ledger
    CREATE_POINT_LOG,
    BATCH_POINT_EVALUATION,

    // Feature 6: Weekly Closeout
    EXECUTE_WEEKLY_LOCK,
    TRIGGER_MANUAL_WEEK_LOCK,

    // Feature 7: Admin & Support
    APPROVE_TEACHER_REQUEST,
    REJECT_TEACHER_REQUEST,
    SUPPORT_RESET_PASSWORD,
    SUPPORT_CHANGE_ROLE,
    SUPPORT_UNLOCK_USER,
    ADMIN_START_VIEW_AS,
    ADMIN_END_VIEW_AS
}
