# FEATURE CONTEXT: AUDIT LOG & HISTORY TRACKING SYSTEM (FEATURE-08)

> **Trạng thái cấu hình:** Sẵn sàng cho Agent Code Generation
> **Kiến trúc áp dụng:** Controller - Service - Repository Pattern / Optional `@Auditable` AOP Metadata
> **Môi trường build:** Maven + Java 21 / Spring Boot 3.x / PostgreSQL / React 19 + TypeScript

---

# 1. PHÂN TÍCH GAP VÀ MỤC TIÊU (CONTEXT BOUNDARY)

Từ Feature 1 đến Feature 7, ClassManager đã hình thành đầy đủ các nghiệp vụ chính của User, Teacher, Student và Admin:

* Authentication & Onboarding
* School / Class / Group Management
* Student Profile & Dynamic Form
* Daily Point Logging
* Weekly Closeout & Snapshot
* AI Assistant
* System Admin & Support Monitoring

Tuy nhiên hệ thống vẫn thiếu một lớp **lịch sử thao tác quản trị và nghiệp vụ quan trọng** để Admin có thể trả lời các câu hỏi:

* Ai đã thực hiện thao tác này?
* Thao tác gì đã xảy ra?
* Tác động lên User / Class / Group / Point Log / Teacher Request nào?
* Dữ liệu quan trọng đã thay đổi từ giá trị nào sang giá trị nào?
* Thao tác xảy ra vào thời điểm nào?
* Nếu cần điều tra một vấn đề, Admin có thể truy lại chuỗi hành động nào?

Feature 8 xây dựng **Audit Log System** tập trung cho mục tiêu truy vết các hành động quan trọng.

Luồng cốt lõi:

```text
Important Business / Admin Action
              ↓
        AuditLogService
              ↓
      INSERT audit_logs
              ↓
       Commit cùng Transaction
              ↓
        Admin Audit Viewer
```

> **Ghi chú phạm vi:** Audit Log trong Feature 8 là **Audit Log thông thường**, ưu tiên đơn giản và dễ bảo trì. Không triển khai cryptographic hash-chain, distributed tracing, retention/partitioning, SIEM, hoặc compliance ledger nâng cao ở giai đoạn này.

> **Ghi chú phạm vi dữ liệu:** Audit Log chỉ lưu các thông tin thực sự cần thiết để truy vết. Không lưu mật khẩu, refresh token hoặc raw secret. Với các entity chứa nhiều dữ liệu cá nhân, snapshot chỉ ghi những field nghiệp vụ cần thiết hoặc những field thực sự thay đổi.

> **Ghi chú quyền hạn:** Chỉ `ADMIN` được xem Audit Log toàn hệ thống.

---

# 2. KIẾN TRÚC DỮ LIỆU (ENTITY CONTEXT)

Agent cần bổ sung Entity JPA mới.

Database sử dụng mô hình Code First hiện tại của ClassManager.

## AuditLog

Lưu lịch sử các hành động quan trọng của User hoặc System.

Thông tin chính:

* actorType (`USER` / `SYSTEM`)
* actorId (nullable khi actor là System)
* actorName (snapshot tại thời điểm audit)
* actorRole (`ADMIN` / `TEACHER` / `STUDENT` / `SYSTEM`)
* targetEntity
* targetId
* action
* oldValue (`JSONB`, nullable)
* newValue (`JSONB`, nullable)
* description
* ipAddress (nullable)
* userAgent (nullable)
* createdAt

### Quy tắc snapshot

`oldValue` và `newValue` không được serialize toàn bộ entity một cách tự động nếu không cần thiết.

Ưu tiên:

```text
CREATE
→ lưu subset field quan trọng

UPDATE
→ chỉ lưu field thay đổi

ACTION không có state change trực tiếp
→ oldValue / newValue có thể null
```

Ví dụ:

```json
oldValue: {
  "leaderId": 10
}

newValue: {
  "leaderId": 15
}
```

---

# 3. DOMAIN LAYER CONTEXT

## Entities

* AuditLog

## Enum

* AuditActorType
* AuditAction
* AuditTargetEntity

## DTO

* AuditLogResponse
* AuditLogFilterCriteria
* AuditActionSummary
* AuditLogSnapshot

---

# 4. BUSINESS RULES

| Rule        | Nội dung                                                                                                                                                |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BR-AUDIT-01 | Chỉ User có `role == ADMIN` mới được truy cập các endpoint `/api/v1/admin/audit-logs/**`.                                                               |
| BR-AUDIT-02 | Audit Log chỉ ghi các hành động quan trọng có tác động tới dữ liệu nghiệp vụ, quyền hạn, bảo mật hoặc trạng thái hệ thống.                              |
| BR-AUDIT-03 | Audit Log không cung cấp bất kỳ API nào cho phép `UPDATE` hoặc `DELETE`.                                                                                |
| BR-AUDIT-04 | Audit Log phải được tạo trong cùng transaction với business operation quan trọng. Nếu ghi Audit Log thất bại, toàn bộ business operation phải rollback. |
| BR-AUDIT-05 | Không sử dụng `@Async` hoặc asynchronous event processing cho Audit Log trong phiên bản hiện tại.                                                       |
| BR-AUDIT-06 | `oldValue` và `newValue` chỉ chứa dữ liệu cần thiết cho việc truy vết; không serialize toàn bộ entity một cách mù quáng.                                |
| BR-AUDIT-07 | Các trường nhạy cảm như `password`, `refreshToken`, `rawSecret` và secret tương đương không được lưu trong Audit Snapshot.                              |
| BR-AUDIT-08 | Với dữ liệu cá nhân của Student, chỉ lưu các field thực sự cần cho việc truy vết hoặc các field thực sự thay đổi.                                       |
| BR-AUDIT-09 | Mỗi Audit Log phải xác định được `actorType`, `action`, `targetEntity`, `targetId` và `createdAt`.                                                      |
| BR-AUDIT-10 | Với `actorType = SYSTEM`, `actorId` có thể null và `actorRole = SYSTEM`.                                                                                |
| BR-AUDIT-11 | Admin chỉ được xem Audit Log; Feature 8 không cho phép Admin sửa nội dung lịch sử Audit Log.                                                            |
| BR-AUDIT-12 | Filter Audit Log hỗ trợ kết hợp nhiều điều kiện: Actor, Action, Target Entity, Target ID và Date Range.                                                 |
| BR-AUDIT-13 | `ADMIN_START_VIEW_AS` và `ADMIN_END_VIEW_AS` phải được audit. Actor của hai action là Admin thực hiện View-As.                                          |
| BR-AUDIT-14 | Các action phát sinh trong View-As vẫn giữ Admin là actor; có thể lưu thêm `viewAsTargetId` trong snapshot/context nếu cần truy vết.                    |
| BR-AUDIT-15 | Không triển khai Export, Hash Chain, Request Tracing, Retention Policy hoặc Partitioning trong Feature 8.                                               |
| BR-AUDIT-16 | Audit Log là append-only ở tầng Application: chỉ có đường ghi `INSERT` và đường đọc `SELECT`.                                                           |

---

# 5. AUDIT ACTION MATRIX

## Feature 1: Auth & Onboarding

```text
SELECT_ROLE
```

Target:

```text
USER
```

Ghi nhận User chọn vai trò.

```text
CREATE_SCHOOL
```

Target:

```text
SCHOOL
```

Snapshot:

```json
{
  "schoolName": "...",
  "address": "..."
}
```

```text
WITHDRAW_TEACHER_REQUEST
```

Target:

```text
TEACHER_REQUEST
```

---

## Feature 2: Class & Groups

```text
CREATE_CLASS
END_CLASS
CREATE_GROUP
ASSIGN_GROUP_LEADER
TRANSFER_STUDENT_GROUP
KICK_STUDENT
```

Ví dụ `ASSIGN_GROUP_LEADER`:

```json
oldValue: {
  "leaderId": 10
}

newValue: {
  "leaderId": 15
}
```

---

## Feature 3: Form & Dossier

```text
PUBLISH_FORM_TEMPLATE
UPDATE_STUDENT_DOSSIER
```

`UPDATE_STUDENT_DOSSIER` chỉ lưu các field nghiệp vụ được phép audit.

Không lưu raw secret hoặc dữ liệu không cần thiết.

---

## Feature 5: Daily Point Ledger

```text
CREATE_POINT_LOG
BATCH_POINT_EVALUATION
```

Ví dụ:

```json
{
  "studentId": 101,
  "pointValue": -2,
  "reason": "..."
}
```

Không thay đổi nguyên tắc Immutable của `point_logs`.

Audit Log chỉ ghi nhận hành động tạo/chấm, không trở thành nơi sửa Point Log.

---

## Feature 6: Weekly Closeout

```text
EXECUTE_WEEKLY_LOCK
TRIGGER_MANUAL_WEEK_LOCK
```

Actor:

```text
SYSTEM
```

hoặc:

```text
TEACHER / ADMIN
```

tùy nguồn kích hoạt.

---

## Feature 7: Admin & Support

```text
APPROVE_TEACHER_REQUEST
REJECT_TEACHER_REQUEST
SUPPORT_RESET_PASSWORD
SUPPORT_CHANGE_ROLE
SUPPORT_UNLOCK_USER
ADMIN_START_VIEW_AS
ADMIN_END_VIEW_AS
```

Các Support Action phải giữ lại `reason` trong Audit Snapshot hoặc `description` khi nghiệp vụ yêu cầu.

---

# 6. AUDIT LOGGING ENGINE

`AuditLogService` chịu trách nhiệm tạo Audit Log cho các mutation quan trọng.

## 6.1. Business Flow

Mỗi business operation quan trọng chạy trong một transaction:

```text
@Transactional
Business Service
      │
      ├── Business Mutation
      │
      └── AuditLogService.log(...)
                │
                ▼
          AuditLogRepository
                │
                ▼
            INSERT
                │
                ▼
             COMMIT
```

Nếu business operation thành công nhưng Audit Log thất bại:

```text
Business Mutation
       ↓
Audit Insert FAILED
       ↓
Transaction ROLLBACK
```

Không cho phép trạng thái:

```text
Business SUCCESS
Audit MISSING
```

---

## 6.2. Audit Metadata

Audit Service phải xác định:

```text
actorType
actorId
actorName
actorRole
action
targetEntity
targetId
description
ipAddress
userAgent
createdAt
```

Thông tin Actor của User lấy từ `SecurityContext`.

Thông tin HTTP context như IP/User-Agent có thể lấy từ `HttpServletRequest`.

System Cron không có HTTP context thì các field tương ứng được để `null`.

---

## 6.3. Optional `@Auditable`

Có thể sử dụng custom annotation để khai báo metadata:

```java
@Auditable(
    action = "CREATE_CLASS",
    targetEntity = "CLASS"
)
```

Annotation chỉ hỗ trợ giảm boilerplate ở tầng service.

Agent **không được** triển khai cơ chế serialize toàn bộ method arguments / result object một cách tự động làm snapshot mặc định.

Snapshot phải được tạo có chủ đích từ business data cần audit.

---

# 7. API ENDPOINTS

## Audit Log Viewer

```http
GET /api/v1/admin/audit-logs
```

Danh sách Audit Log toàn hệ thống.

Query Parameters:

```text
actorId
actorType
action
targetEntity
targetId
fromDate
toDate
page
size
sort
```

Ví dụ:

```text
GET /api/v1/admin/audit-logs
  ?actorId=1
  &action=SUPPORT_CHANGE_ROLE
  &targetEntity=USER
  &targetId=20
  &fromDate=2026-08-01T00:00:00
  &toDate=2026-08-19T23:59:59
  &page=0
  &size=20
```

Response:

```text
Page<AuditLogResponse>
```

---

## Audit Log Detail

```http
GET /api/v1/admin/audit-logs/{id}
```

Trả về:

* Actor
* Action
* Target
* Description
* Old Value
* New Value
* IP
* User-Agent
* Created At

---

## Action Summary

```http
GET /api/v1/admin/audit-logs/actions-summary
```

Trả về danh sách action đang tồn tại và số lượng tương ứng để hỗ trợ UI filter.

---

# 8. FRONTEND CONTEXT

## Audit Logs

Route:

```text
/admin/audit-logs
```

Hiển thị:

* Audit Log Table
* Filter Bar
* Pagination
* Action badges
* Actor information
* Target information
* Timestamp

---

## Audit Log Filter Bar

Cho phép kết hợp nhiều filter:

```text
Actor
Actor Type
Action
Target Entity
Target ID
From Date
To Date
```

Không cần full-text search trong MVP.

---

## Audit Detail

Khi chọn một record:

```text
Audit Detail Modal
```

Hiển thị:

```text
Who
What
Target
When
Description
```

và:

```text
Old Value
    ↓
New Value
```

Nếu có thay đổi dữ liệu, UI hiển thị Diff trực quan.

Ví dụ:

```text
leaderId
- 10
+ 15
```

---

## Visual Classification

Badge dùng theo nhóm semantic:

```text
SECURITY
BUSINESS
SYSTEM
DATA
AUTH
```

Không tạo một màu riêng cho từng action để tránh UI phức tạp khi action tăng lên.

---

# 9. VIEW-AS AUDIT CONTEXT

Feature 7 đã có View-As Read-only.

Feature 8 phải audit vòng đời View-As:

```text
ADMIN_START_VIEW_AS
        ↓
 View-As Session
        ↓
ADMIN_END_VIEW_AS
```

Session có thể lưu:

```text
adminId
targetUserId
startedAt
endedAt
```

Audit Actor luôn là Admin:

```text
actorType = USER
actorId = adminId
actorRole = ADMIN
```

Không chuyển Actor thành User mục tiêu.

Nếu phát sinh action trong View-As, Audit Log có thể lưu:

```text
viewAsTargetId
```

để biết Admin đang điều tra dưới tài khoản nào.

---

# 10. DATABASE INDEXING

Audit Log cần hỗ trợ các truy vấn filter phổ biến.

Các index cơ bản:

```sql
CREATE INDEX idx_audit_logs_actor
ON audit_logs(actor_id);

CREATE INDEX idx_audit_logs_action
ON audit_logs(action);

CREATE INDEX idx_audit_logs_target
ON audit_logs(target_entity, target_id);

CREATE INDEX idx_audit_logs_created_at
ON audit_logs(created_at DESC);
```

Chỉ bổ sung composite index khi workload thực tế cho thấy cần thiết.

Không triển khai partitioning trong Feature 8.

---

# 11. SYSTEM ARCHITECTURE

```text
                 Important Action
                        │
                        ▼
              ┌──────────────────┐
              │ Business Service │
              │ @Transactional   │
              └────────┬─────────┘
                       │
             ┌─────────┴──────────┐
             ▼                    ▼
      Business Mutation     AuditLogService
                                  │
                                  ▼
                         AuditLogRepository
                                  │
                                  ▼
                           audit_logs INSERT
                                  │
                                  ▼
                              COMMIT
```

Admin Portal:

```text
                    ADMIN
                      │
                      ▼
              /admin/audit-logs
                      │
             ┌────────┴─────────┐
             ▼                  ▼
       Audit List          Audit Detail
             │                  │
             └────────┬─────────┘
                      ▼
                 JSON Diff
```

---

# 12. AGENT DIRECTIVES

* Chỉ `ADMIN` mới được truy cập `/api/v1/admin/audit-logs/**`.
* Audit Log chỉ dành cho **các action quan trọng**, không audit mọi GET request.
* Không tạo CRUD đầy đủ cho `AuditLog`; chỉ `INSERT` và `SELECT`.
* Không sử dụng `@Async` cho Audit Log trong phiên bản hiện tại.
* Audit Insert phải nằm cùng transaction với business operation quan trọng.
* Nếu Audit Insert thất bại, business transaction phải rollback.
* Không serialize toàn bộ method arguments hoặc result object một cách tự động để làm snapshot.
* `oldValue` / `newValue` ưu tiên chỉ chứa các field thực sự thay đổi hoặc subset field nghiệp vụ cần thiết.
* Tuyệt đối không lưu `password`, `refreshToken`, `rawSecret` hoặc secret tương đương vào Audit Log.
* PII của Student chỉ được lưu khi cần thiết cho việc truy vết.
* System Cron sử dụng `actorType = SYSTEM`, `actorId = null` nếu không có User thực hiện.
* View-As phải giữ Admin là Actor và audit `START` / `END`.
* Không triển khai Request Tracing trong Feature 8.
* Không triển khai Hash Chain / Cryptographic Signature trong Feature 8.
* Không triển khai Audit Export trong Feature 8.
* Không triển khai Retention / Partitioning trong Feature 8.
* Không cho phép Admin sửa nội dung lịch sử Audit Log.
* Không làm thay đổi nguyên tắc Immutable của `point_logs` và `weekly_reports`.
* Feature 8 là **cross-cutting infrastructure**, không phải một business module độc lập.
* Ưu tiên implementation đơn giản, dễ đọc và dễ maintain phù hợp với quy mô hiện tại của ClassManager.

---

# 13. FUTURE BACKLOG

Các chức năng sau **không thuộc Feature 8 MVP**:

```text
AUDIT_LOG_EXPORT
AUDIT_LOG_HASH_CHAIN
AUDIT_LOG_TAMPER_DETECTION
AUDIT_LOG_RETENTION
AUDIT_LOG_PARTITIONING
AUDIT_REQUEST_TRACING
AUDIT_LOG_FULL_TEXT_SEARCH
AUDIT_LOG_RESTORE / HISTORY EDITING
```

Trong tương lai, Admin có thể có một feature riêng để quản lý lịch sử nâng cao hoặc thực hiện các thao tác correction/history management, nhưng **Feature 8 hiện tại không cho phép chỉnh sửa Audit Log**.

---

# 14. FEATURE ACCEPTANCE CRITERIA

Feature 8 được xem là hoàn thành khi:

```text
1. Admin có thể xem Audit Log toàn hệ thống.
2. Admin có thể filter theo nhiều trường.
3. Các action quan trọng từ Feature 1–7 được audit.
4. Audit chứa Actor + Action + Target + Timestamp.
5. Mutation quan trọng có old/new snapshot phù hợp.
6. Password / Token / Secret không xuất hiện trong snapshot.
7. Audit được commit cùng business transaction.
8. Audit failure làm rollback business operation.
9. Không có API UPDATE/DELETE Audit Log.
10. View-As START / END được audit.
11. System Cron có actorType = SYSTEM.
12. UI có Audit Table + Filter + Detail/Diff.
13. Không ảnh hưởng đến Immutable Ledger của Point Log / Weekly Report.
14. Code không phụ thuộc vào async event hoặc infrastructure tracing phức tạp.
```

---

# 15. OUT OF SCOPE SUMMARY

```text
                    FEATURE 08
                        │
       ┌────────────────┼─────────────────┐
       ▼                ▼                 ▼
   Audit Write      Admin Viewer      History Trace
       │                │                 │
       ▼                ▼                 ▼
   INSERT only      Filter/List        Old → New
   Transaction      Detail             Actor
   Snapshot         Diff               Timestamp
```

Không bao gồm:

```text
❌ Export
❌ Hash Chain
❌ Tamper Detection
❌ Request Tracing
❌ Retention
❌ Partitioning
❌ SIEM
❌ Audit Editing
❌ Complex Compliance Workflow
```

> **Kết luận:** Feature 8 là lớp **truy vết hành động quan trọng** nằm trên các Feature nghiệp vụ hiện có. Thiết kế ưu tiên tính đúng đắn của transaction, khả năng tra cứu của Admin và khả năng maintain của codebase hơn là xây dựng một hệ thống compliance quá mức cần thiết cho quy mô hiện tại.
