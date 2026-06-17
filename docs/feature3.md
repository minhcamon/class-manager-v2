# FEATURE CONTEXT: CLASS ENROLLMENT & ACCESS CONTROL (FEATURE-03)

> **Trạng thái cấu hình:** Ready for Agent Code Generation
>
> **Kiến trúc áp dụng:** Clean Architecture / Controller - Service - Repository Pattern
>
> **Công nghệ đích:** Java 21, Spring Boot 3.x, Maven, PostgreSQL, Spring Security 6
>
> **Flyway Version Start:** V7 (Feature-01 và Feature-02 đã sử dụng đến V6)

---

# 1. MỤC TIÊU NGHIỆP VỤ

Sau khi Student hoàn thành Authentication và Select Role ở Feature-01, họ chưa được phép sử dụng hệ thống cho đến khi tham gia một lớp học cụ thể.

Mỗi lớp học có:

* Class Code (công khai)
* Class Password (bí mật)

Student nhập:

```text
Class Code
+
Class Password
```

để tham gia lớp học ngay lập tức.

Không tồn tại luồng:

```text
PENDING_APPROVAL
REJECTED
APPROVAL WORKFLOW
```

---

# 2. KIẾN TRÚC DỮ LIỆU

## Quan hệ dữ liệu

```text
User
 │
 ▼
Enrollment
 │
 ▼
StudentProfile
 │
 ▼
FormTemplate Version
```

Enrollment là nguồn dữ liệu xác định Student đang thuộc lớp nào.

StudentProfile tiếp tục phụ thuộc Enrollment theo Feature-02.

---

## V7__add_class_access_control.sql

```sql
ALTER TABLE classes
ADD COLUMN class_code VARCHAR(20) UNIQUE NOT NULL;

ALTER TABLE classes
ADD COLUMN class_password_hash VARCHAR(100) NOT NULL;

CREATE INDEX idx_classes_code
ON classes(class_code);
```

---

## V8__create_enrollments.sql

```sql
CREATE TABLE enrollments (
    id          SERIAL PRIMARY KEY,

    user_id     INT NOT NULL
                REFERENCES users(id)
                ON DELETE CASCADE,

    class_id    INT NOT NULL
                REFERENCES classes(id)
                ON DELETE CASCADE,

    status      VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                CHECK (
                    status IN (
                        'ACTIVE',
                        'LEFT',
                        'GRADUATED'
                    )
                ),

    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id)
);

CREATE INDEX idx_enrollments_user
ON enrollments(user_id);

CREATE INDEX idx_enrollments_class
ON enrollments(class_id);
```

---

## V9__add_enrollment_fk_to_student_profiles.sql

```sql
ALTER TABLE student_profiles
ADD CONSTRAINT fk_student_profiles_enrollment
FOREIGN KEY (enrollment_id)
REFERENCES enrollments(id)
ON DELETE CASCADE;
```

---

# 3. DOMAIN MODEL

## Enrollment Entity

```java
Enrollment
```

Fields:

* id
* user
* classEntity
* status
* createdAt
* updatedAt

---

## EnrollmentStatus Enum

```java
ACTIVE
LEFT
GRADUATED
```

---

## ClassEntity Update

Add:

```java
String classCode;
String classPasswordHash;
```

---

# 4. DTOs

## JoinClassRequest

```java
String classCode;
String classPassword;
```

---

## EnrollmentResponse

```java
Integer enrollmentId;
Integer classId;
String className;
String classCode;
String status;
LocalDateTime joinedAt;
```

---

## StudentEnrollmentResponse

```java
Integer userId;
String fullName;
String username;
String phoneNumber;
LocalDateTime joinedAt;
```

---

# 5. BUSINESS RULES

| Rule         | Description                                                               | Error                  |
| ------------ | ------------------------------------------------------------------------- | ---------------------- |
| BR-ENROLL-01 | Class Code không tồn tại                                                  | CLASS_NOT_FOUND        |
| BR-ENROLL-02 | Lớp đã ENDED                                                              | CLASS_ENDED            |
| BR-ENROLL-03 | Sai mật khẩu lớp                                                          | INVALID_CLASS_PASSWORD |
| BR-ENROLL-04 | Student đã tham gia lớp khác                                              | ALREADY_ENROLLED       |
| BR-ENROLL-05 | Chỉ STUDENT mới được join lớp                                             | ACCESS_DENIED          |
| BR-ENROLL-06 | Khi join thành công phải tạo Enrollment                                   | Auto                   |
| BR-ENROLL-07 | Nếu StudentProfile chưa tồn tại thì khởi tạo profile tương ứng Enrollment | Auto                   |

---

# 6. API ENDPOINTS

## 1. Student Join Class

### POST

```http
/api/v1/enrollments/join
```

Authentication:

```text
STUDENT
```

Request:

```json
{
  "classCode": "10A12026",
  "classPassword": "abc123"
}
```

Logic:

1. Tìm lớp theo classCode
2. Kiểm tra lớp ACTIVE
3. Verify BCrypt Password
4. Kiểm tra Student chưa có Enrollment
5. Tạo Enrollment
6. Khởi tạo StudentProfile
7. Trả về EnrollmentResponse

---

## 2. Get Current Enrollment

### GET

```http
/api/v1/enrollments/me
```

Authentication:

```text
STUDENT
```

Trả về lớp hiện tại của Student.

---

## 3. Teacher View Class Members

### GET

```http
/api/v1/classes/{classId}/students
```

Authentication:

```text
TEACHER
```

Teacher phải là chủ lớp.

Trả về danh sách Student trong lớp.

---

## 4. Student Leave Class

### PUT

```http
/api/v1/enrollments/leave
```

Authentication:

```text
STUDENT
```

Cập nhật:

```text
ACTIVE
→ LEFT
```

---

# 7. AUTH GUARD UPDATE

Sau Feature-03:

```text
STUDENT
      │
      ▼
Check Enrollment
```

---

## Case 1

```text
Enrollment == NULL
```

Chỉ cho phép:

```text
POST /api/v1/enrollments/join
GET  /api/v1/auth/me
```

Các API khác:

```text
403 ENROLLMENT_REQUIRED
```

---

## Case 2

```text
Enrollment.status == ACTIVE
```

Cho phép sử dụng hệ thống.

---

## Case 3

```text
Enrollment.status == LEFT
```

Redirect về Join Class.

---

# 8. CLASS CREATION UPDATE (FEATURE-02 PATCH)

Khi Teacher tạo lớp:

```java
classCode = RandomCodeGenerator.generate();
classPasswordHash =
    passwordEncoder.encode(request.getClassPassword());
```

Class Code:

```text
A-Z
0-9
Length = 6
```

Ví dụ:

```text
X87D2A
```

Class Password:

```text
Teacher tự nhập
BCrypt Hash trước khi lưu
```

---

# 9. CUSTOM EXCEPTIONS

```java
ClassNotFoundException
ClassEndedException
AlreadyEnrolledException
InvalidClassPasswordException
EnrollmentNotFoundException
EnrollmentRequiredException
```

---

# 10. AGENT DIRECTIVES

Thứ tự output bắt buộc:

```text
1. V7__add_class_access_control.sql
2. V8__create_enrollments.sql
3. V9__add_enrollment_fk_to_student_profiles.sql

4. EnrollmentStatus.java
5. Enrollment.java

6. EnrollmentRepository.java

7. EnrollmentService.java

8. EnrollmentController.java

9. DTOs:
   - JoinClassRequest
   - EnrollmentResponse
   - StudentEnrollmentResponse

10. Exceptions:
   - ClassNotFoundException
   - ClassEndedException
   - AlreadyEnrolledException
   - InvalidClassPasswordException
   - EnrollmentNotFoundException
   - EnrollmentRequiredException
```

Không được sửa đổi các Feature trước đó ngoài các migration và entity update được mô tả trong tài liệu này.
