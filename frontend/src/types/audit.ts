export type AuditActorType = 'USER' | 'SYSTEM';

export type AuditAction =
    // Feature 1: Auth & Onboarding
    | 'SELECT_ROLE'
    | 'CREATE_SCHOOL'
    | 'WITHDRAW_TEACHER_REQUEST'
    // Feature 2: Class & Groups
    | 'CREATE_CLASS'
    | 'END_CLASS'
    | 'CREATE_GROUP'
    | 'ASSIGN_GROUP_LEADER'
    | 'TRANSFER_STUDENT_GROUP'
    | 'KICK_STUDENT'
    // Feature 3: Form & Dossier
    | 'PUBLISH_FORM_TEMPLATE'
    | 'UPDATE_STUDENT_DOSSIER'
    // Feature 5: Daily Point Ledger
    | 'CREATE_POINT_LOG'
    | 'BATCH_POINT_EVALUATION'
    // Feature 6: Weekly Closeout
    | 'EXECUTE_WEEKLY_LOCK'
    | 'TRIGGER_MANUAL_WEEK_LOCK'
    // Feature 7: Admin & Support
    | 'APPROVE_TEACHER_REQUEST'
    | 'REJECT_TEACHER_REQUEST'
    | 'SUPPORT_RESET_PASSWORD'
    | 'SUPPORT_CHANGE_ROLE'
    | 'SUPPORT_UNLOCK_USER'
    | 'ADMIN_START_VIEW_AS'
    | 'ADMIN_END_VIEW_AS';

export type AuditTargetEntity =
    | 'USER'
    | 'SCHOOL'
    | 'CLASS'
    | 'GROUP'
    | 'FORM_TEMPLATE'
    | 'STUDENT_PROFILE'
    | 'POINT_LOG'
    | 'WEEKLY_REPORT'
    | 'TEACHER_REQUEST'
    | 'SYSTEM';

export interface AuditLog {
    id: number;
    actorType: AuditActorType;
    actorId: number | null;
    actorName: string | null;
    actorRole: string | null;
    targetEntity: AuditTargetEntity;
    targetId: string | null;
    action: AuditAction;
    oldValue: Record<string, unknown> | null;
    newValue: Record<string, unknown> | null;
    description: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: string;
}

export interface AuditLogFilterParams {
    actorId?: number;
    actorType?: AuditActorType;
    action?: AuditAction;
    targetEntity?: AuditTargetEntity;
    targetId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    size?: number;
}

export interface AuditActionSummary {
    action: AuditAction;
    count: number;
}

export type ActionCategory = 'SECURITY' | 'BUSINESS' | 'SYSTEM' | 'DATA' | 'AUTH';

export interface ActionMetadata {
    label: string;
    category: ActionCategory;
    description: string;
}

export const ACTION_METADATA_MAP: Record<AuditAction, ActionMetadata> = {
    SELECT_ROLE: {
        label: 'Chọn vai trò',
        category: 'AUTH',
        description: 'Người dùng chọn vai trò ban đầu',
    },
    CREATE_SCHOOL: {
        label: 'Tạo trường học',
        category: 'BUSINESS',
        description: 'Giáo viên đăng ký trường học mới',
    },
    WITHDRAW_TEACHER_REQUEST: {
        label: 'Rút yêu cầu giáo viên',
        category: 'AUTH',
        description: 'Người dùng hủy đơn xin cấp quyền giáo viên',
    },
    CREATE_CLASS: {
        label: 'Tạo lớp học',
        category: 'BUSINESS',
        description: 'Giáo viên tạo lớp học mới',
    },
    END_CLASS: {
        label: 'Kết thúc lớp học',
        category: 'BUSINESS',
        description: 'Giáo viên đóng / lưu trữ lớp học',
    },
    CREATE_GROUP: {
        label: 'Tạo tổ học tập',
        category: 'BUSINESS',
        description: 'Giáo viên tạo tổ mới trong lớp',
    },
    ASSIGN_GROUP_LEADER: {
        label: 'Bổ nhiệm tổ trưởng',
        category: 'BUSINESS',
        description: 'Phân công học sinh làm tổ trưởng',
    },
    TRANSFER_STUDENT_GROUP: {
        label: 'Chuyển tổ học sinh',
        category: 'DATA',
        description: 'Chuyển học sinh sang tổ khác hoặc rời tổ',
    },
    KICK_STUDENT: {
        label: 'Xóa học sinh khỏi lớp',
        category: 'DATA',
        description: 'Loại học sinh khỏi danh sách lớp',
    },
    PUBLISH_FORM_TEMPLATE: {
        label: 'Xuất bản mẫu hồ sơ',
        category: 'DATA',
        description: 'Cập nhật phiên bản form hồ sơ học sinh',
    },
    UPDATE_STUDENT_DOSSIER: {
        label: 'Cập nhật hồ sơ học sinh',
        category: 'DATA',
        description: 'Chỉnh sửa thông tin phiếu hồ sơ cá nhân',
    },
    CREATE_POINT_LOG: {
        label: 'Ghi điểm / Trừ điểm',
        category: 'BUSINESS',
        description: 'Thêm bản ghi sổ điểm cá nhân',
    },
    BATCH_POINT_EVALUATION: {
        label: 'Đánh giá điểm theo tổ',
        category: 'BUSINESS',
        description: 'Cộng / trừ điểm hàng loạt cho nhóm học sinh',
    },
    EXECUTE_WEEKLY_LOCK: {
        label: 'Chốt tuần tự động (Cron)',
        category: 'SYSTEM',
        description: 'Hệ thống tự động chốt sổ điểm và xếp hạng tuần',
    },
    TRIGGER_MANUAL_WEEK_LOCK: {
        label: 'Chốt tuần thủ công',
        category: 'BUSINESS',
        description: 'Giáo viên kích hoạt chốt điểm tuần sớm',
    },
    APPROVE_TEACHER_REQUEST: {
        label: 'Duyệt yêu cầu giáo viên',
        category: 'SECURITY',
        description: 'Quản trị viên phê duyệt đơn cấp quyền giáo viên',
    },
    REJECT_TEACHER_REQUEST: {
        label: 'Từ chối yêu cầu giáo viên',
        category: 'SECURITY',
        description: 'Quản trị viên từ chối đơn cấp quyền giáo viên',
    },
    SUPPORT_RESET_PASSWORD: {
        label: 'Đặt lại mật khẩu',
        category: 'SECURITY',
        description: 'Admin reset mật khẩu cho người dùng',
    },
    SUPPORT_CHANGE_ROLE: {
        label: 'Đổi quyền người dùng',
        category: 'SECURITY',
        description: 'Admin can thiệp điều chỉnh vai trò tài khoản',
    },
    SUPPORT_UNLOCK_USER: {
        label: 'Mở khóa tài khoản',
        category: 'SECURITY',
        description: 'Admin kích hoạt lại trạng thái tài khoản',
    },
    ADMIN_START_VIEW_AS: {
        label: 'Bắt đầu Quan sát (View-As)',
        category: 'SECURITY',
        description: 'Admin đăng nhập dưới chế độ chỉ đọc để kiểm tra',
    },
    ADMIN_END_VIEW_AS: {
        label: 'Kết thúc Quan sát (View-As)',
        category: 'SECURITY',
        description: 'Admin thoát phiên quan sát chỉ đọc',
    },
};
