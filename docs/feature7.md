# FEATURE CONTEXT: SYSTEM ADMIN & SUPPORT MONITORING CENTER (FEATURE-07)

> **Trạng thái cấu hình:** Sẵn sàng cho Agent Code Generation
> **Kiến trúc áp dụng:** Controller - Service - Repository Pattern
> **Môi trường build:** Maven + Java 21

---

# 1. PHÂN TÍCH GAP VÀ MỤC TIÊU (CONTEXT BOUNDARY)

Từ Feature 1 đến Feature 6, hệ thống đã hoàn thiện toàn bộ vòng đời nghiệp vụ của Giáo viên và Học sinh (Onboarding, Class/Group, Form, Point Logging, Weekly Cycle). Tuy nhiên hệ thống vẫn chưa có lớp **vận hành & hỗ trợ** đứng trên toàn bộ dữ liệu để:

* Kiểm soát cổng vào vai trò `TEACHER` khi Onboard (hiện tại User tự chọn Role mà không qua xác nhận, dễ bị lạm dụng).
* Tra cứu và hỗ trợ tài khoản khi người dùng gặp sự cố (quên mật khẩu, tài khoản bị khóa, chọn sai vai trò).
* Quan sát tổng quan mức độ hoạt động của các Trường/Lớp trong hệ thống mà không can thiệp vào dữ liệu nghiệp vụ (Point Log, Weekly Report vẫn giữ nguyên tính **Immutable Ledger** đã thiết lập ở Feature 4-6).
* Giám sát sức khỏe kỹ thuật của hệ thống (DB Pool, JVM, API).

Feature 7 xây dựng **Admin Portal**, hoàn thiện chu trình:

```
User Onboard Request
        ↓
Teacher Role Approval
        ↓
Support Action (Reset / Unlock / Change Role)
        ↓
View-As (Read-only Investigation)
        ↓
System & API Health Monitoring
```

> **Ghi chú phạm vi:** Admin là **admin tổng** của toàn hệ thống, không giới hạn theo `School`. Admin **không** truy cập chi tiết nghiệp vụ trong lớp học (Point Log, Weekly Evaluation, danh sách học sinh cụ thể) — chỉ xem ở mức tổng quan (summary). **Audit Log** và **Transfer Class Ownership** được tách ra khỏi phạm vi, triển khai ở giai đoạn sau.

---

# 2. KIẾN TRÚC DỮ LIỆU (ENTITY CONTEXT)

Agent cần bổ sung Entity JPA mới. Database sẽ được Hibernate tự động cập nhật (Code First).

## TeacherRoleRequest

Lưu yêu cầu xin cấp vai trò `TEACHER` của User khi Onboard, chờ Admin duyệt.

Thông tin chính:

* user (User đang request)
* status (`PENDING` / `APPROVED` / `REJECTED`)
* requestedAt
* reviewedBy (Admin đã xử lý, nullable)
* reviewedAt
* rejectReason (bắt buộc khi REJECTED)

Entity này chặn User đi thẳng vào vai trò `TEACHER` — Onboarding Flow ở Feature 1 phải tạo bản ghi `PENDING` thay vì set role trực tiếp.

---

# 3. DOMAIN LAYER CONTEXT

## Entities

* TeacherRoleRequest

## DTO

* AdminUserSearchResponse
* AdminUserDetailResponse
* SupportActionRequest
* ViewAsSessionResponse
* TeacherRequestResponse
* TeacherRequestReviewRequest
* AdminSchoolSummaryResponse
* AdminClassSummaryResponse
* SystemHealthResponse
* ApiMetricsResponse

---

# 4. BUSINESS RULES

| Rule           | Nội dung                                                                                                       |
| -------------- | ---------------------------------------------------------------------------------------------------------------- |
| BR-ADMIN-01    | Chỉ User có `role == ADMIN` mới được truy cập các endpoint `/api/v1/admin/**`.                                    |
| BR-ADMIN-02    | Mọi Support Action (`RESET_PASSWORD`, `UNLOCK_USER`, `CHANGE_ROLE`) bắt buộc phải kèm `reason`.                   |
| BR-ADMIN-03    | View-As sinh token tạm với cờ `readOnly = true`; mọi request mutation (POST/PUT/DELETE) mang token này bị chặn.   |
| BR-ADMIN-04    | Admin không có quyền xem chi tiết học sinh, điểm số hay Weekly Report bên trong lớp học.                          |
| BR-ADMIN-05    | Cảnh báo (warning) nếu active connection vượt quá 80% ngưỡng tối đa của HikariCP pool.                            |
| BR-ADMIN-06    | Chỉ Admin được duyệt (`APPROVE`) hoặc từ chối (`REJECT`) một `TeacherRoleRequest`.                                |
| BR-ADMIN-07    | Khi `APPROVED`: hệ thống set `User.role = TEACHER` ngay lập tức.                                                  |
| BR-ADMIN-08    | Khi `REJECTED`: bắt buộc có `rejectReason`, `User.role` giữ nguyên trạng thái trước đó.                           |
| BR-ADMIN-09    | Một User chỉ được có tối đa một `TeacherRoleRequest` ở trạng thái `PENDING` tại một thời điểm.                    |
| BR-ADMIN-10    | `TeacherRoleRequest` đã ở trạng thái `APPROVED`/`REJECTED` không được xử lý lại (Immutable sau khi review).       |

---

# 5. API ENDPOINTS

## User Inspector

```
GET /api/v1/admin/users
```

Tìm kiếm & phân trang User theo từ khóa (username/email/tên) và role.

```
GET /api/v1/admin/users/{userId}
```

Chi tiết hồ sơ User, trạng thái tài khoản, lịch sử duyệt Teacher Request (nếu có).

---

## Support Actions

```
POST /api/v1/admin/support/action
```

Thực thi `RESET_PASSWORD` / `UNLOCK_USER` / `CHANGE_ROLE` kèm `reason`.

---

## View-As Mode

```
POST /api/v1/admin/view-as/{userId}
```

Sinh token truy cập read-only dưới danh nghĩa User mục tiêu.

---

## Teacher Role Approval

```
GET /api/v1/admin/teacher-requests
```

Danh sách request theo trạng thái, phân trang.

```
POST /api/v1/admin/teacher-requests/{id}/approve
```

```
POST /api/v1/admin/teacher-requests/{id}/reject
```

Body: `{ reason }`

---

## School & Class Overview

```
GET /api/v1/admin/schools
```

Danh sách Trường học trong hệ thống.

```
GET /api/v1/admin/schools/{schoolId}/classes
```

Danh sách Lớp thuộc Trường ở mức summary: `className`, `teacherName`, `studentCount`, `status`.

---

## System & API Health

```
GET /api/v1/admin/metrics/health
```

```
GET /api/v1/admin/metrics/api
```

---

# 6. TEACHER APPROVAL ENGINE

TeacherApprovalEngine chịu trách nhiệm điều phối vòng đời của một `TeacherRoleRequest`.

Khi User chọn vai trò `TEACHER` ở bước Onboard (Feature 1):

1. Hệ thống không set `role = TEACHER` ngay.
2. Tạo `TeacherRoleRequest` ở trạng thái `PENDING`.
3. User bị giữ ở trạng thái chờ, không truy cập được chức năng Teacher.

Khi Admin xử lý:

1. **Approve** → set `User.role = TEACHER`, cập nhật `reviewedBy`, `reviewedAt`.
2. **Reject** → bắt buộc `rejectReason`, `User.role` không đổi, cập nhật `reviewedBy`, `reviewedAt`.
3. Request sau khi xử lý không được duyệt lại (BR-ADMIN-10).

---

# 7. FRONTEND CONTEXT

## Admin Dashboard

Hiển thị:

* Tổng quan số lượng User theo Role
* Số Teacher Request đang `PENDING`
* Tình trạng sức khỏe hệ thống (rút gọn)

## User Inspector

Hiển thị:

* Kết quả tìm kiếm User
* Chi tiết hồ sơ và thao tác Support Action / View-As

## Teacher Requests

Hiển thị:

* Danh sách request theo trạng thái
* Thao tác Approve / Reject kèm lý do

## Schools & Classes

Hiển thị:

* Danh sách Trường học
* Danh sách Lớp theo Trường (summary, không đi sâu vào học sinh)

## System Health

Hiển thị:

* DB Pool, JVM Memory, Disk
* API Error Rate, Response Time

---

# 8. SYSTEM ARCHITECTURE

```
              User Onboard (chọn role TEACHER)
                           │
                           ▼
                 TeacherRoleRequest (PENDING)
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
          APPROVED                  REJECTED
    (User.role = TEACHER)      (giữ nguyên role)
                           
                           
        Admin Portal (role = ADMIN)
                           │
        ┌──────────┬───────────┬───────────┐
        ▼          ▼           ▼           ▼
  User Inspector  Support   View-As   School/Class
                   Action   (Read-only)   Overview
                           │
                           ▼
                System & API Health Monitoring
```

---

# 9. AGENT DIRECTIVES

* Admin là admin tổng, không lọc theo `School` ở bất kỳ endpoint nào.
* Onboarding Flow (Feature 1) phải được điều chỉnh: chọn role `TEACHER` tạo `TeacherRoleRequest` thay vì set role trực tiếp.
* Không cho phép Admin truy cập chi tiết học sinh, điểm số, hoặc Weekly Report — chỉ dữ liệu tổng quan (summary) ở cấp School/Class.
* View-As chỉ được phép đọc, mọi mutation phải bị chặn tại Filter dựa trên cờ `readOnly` trong token.
* TeacherApprovalEngine là thành phần duy nhất được phép thay đổi `User.role` thông qua `TeacherRoleRequest`.
* Không triển khai Audit Log và Transfer Class Ownership trong Feature 7 — để dành cho giai đoạn sau.
* Một `TeacherRoleRequest` đã được review là bất biến, không cho phép xử lý lại.