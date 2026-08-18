export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

export type TeacherRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWAL';

export interface AdminUser {
  id: number;
  username: string;
  fullName: string;
  googleEmail?: string;
  phoneNumber?: string;
  role?: Role;
  schoolName?: string;
  schoolId?: number;
  avatarUrl?: string;
  teacherRequestStatus?: TeacherRequestStatus;
  createdAt: string;
}

export interface ManagedClassSummary {
  id: number;
  className: string;
  grade: number;
  classCode: string;
  status: string;
  studentCount: number;
}

export interface EnrolledClassSummary {
  classId: number;
  className: string;
  groupName: string;
  teacherName: string;
  status: string;
}

export interface AdminUserDetail {
  id: number;
  username: string;
  fullName: string;
  googleEmail?: string;
  phoneNumber?: string;
  role?: Role;
  schoolName?: string;
  schoolId?: number;
  avatarUrl?: string;
  createdAt: string;
  updatedAt?: string;
  teacherRequests: TeacherRequest[];
  managedClasses: ManagedClassSummary[];
  enrolledClasses: EnrolledClassSummary[];
}

export interface TeacherRequest {
  id: number;
  userId: number;
  username: string;
  fullName: string;
  googleEmail?: string;
  phoneNumber?: string;
  schoolName?: string;
  status: TeacherRequestStatus;
  requestedAt: string;
  reviewedById?: number;
  reviewedByName?: string;
  reviewedAt?: string;
  rejectReason?: string;
}

export interface SupportActionPayload {
  targetUserId: number;
  actionType: 'RESET_PASSWORD' | 'UNLOCK_USER' | 'CHANGE_ROLE';
  newPassword?: string;
  newRole?: Role;
  reason: string;
}

export interface ViewAsSession {
  accessToken: string;
  targetUserId: number;
  targetUsername: string;
  targetFullName: string;
  targetRole: Role;
  readOnly: boolean;
  expiresIn: number;
}

export interface AdminSchoolSummary {
  id: number;
  name: string;
  address?: string;
  teacherCount: number;
  classCount: number;
  createdAt: string;
}

export interface AdminClassSummary {
  id: number;
  className: string;
  grade: number;
  classCode: string;
  teacherName: string;
  teacherId?: number;
  schoolName?: string;
  schoolId?: number;
  studentCount: number;
  status: string;
  createdAt: string;
}

export interface SystemHealthData {
  dbStatus: string;
  activeDbConnections: number;
  maxDbConnections: number;
  poolWarning: boolean;
  jvmUsedMemoryMb: number;
  jvmMaxMemoryMb: number;
  jvmMemoryUsagePercent: number;
  diskFreeSpaceGb: number;
  diskTotalSpaceGb: number;
  weeklyCronSchedule: string;
  serverTimezone: string;
  serverTime: string;
}

export interface ApiMetricsData {
  totalRequests24h: number;
  errorRatePercent: number;
  avgResponseTimeMs: number;
  count2xx: number;
  count4xx: number;
  count5xx: number;
}

export interface AdminDashboardOverview {
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalAdmins: number;
  pendingTeacherRequests: number;
  totalSchools: number;
  totalClasses: number;
  quickHealth: SystemHealthData;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}
