# FEATURE CONTEXT: CLASS LIFE-CYCLE, VERSIONED DYNAMIC FORM & STUDENT PROFILE SYSTEM (FEATURE-02)

> **Trạng thái cấu hình:** Sẵn sàng cho Agent Code Generation
> **Kiến trúc áp dụng:** Clean Architecture / Controller - Service - Repository Pattern
> **Công nghệ đích:** Java 21, Spring Boot 3.x, Gradle, PostgreSQL (JSONB), Spring Security 6

---

## 1. PHÂN TÍCH GAP GIỮA SRS GỐC VÀ YÊU CẦU MỚI (GAP ANALYSIS)

Để tránh xung đột dữ liệu, Agent cần lưu ý các thay đổi chiến lược từ tài liệu SRS gốc sang Scope mới của Feature này:

* **Tách bảng Student Profile:** SRS gốc lưu `dynamic_profile` dạng JSONB trực tiếp trong bảng `students`. Cấu hình mới yêu cầu tách thành bảng `student_profiles` riêng biệt, gắn với `enrollment_id` — chuẩn bị cho Module Enrollment ở Feature-03.
* **Profile theo từng lớp:** Mỗi Student có profile riêng cho mỗi lớp tham gia (thông qua enrollment). Không có global profile. Khi Student join lớp mới → profile mới được tạo độc lập.
* **Form Versioning bất biến:** SRS gốc chỉ đề cập 1 form active. Cấu hình mới yêu cầu hệ thống Versioning — mỗi lần Teacher cập nhật form cấu trúc, hệ thống tạo version mới (INSERT) thay vì ghi đè (UPDATE) lên bản cũ, bảo toàn toàn vẹn dữ liệu đã điền.
* **Số Flyway Migration:** Feature-01 đã sử dụng V1 (schools) và V2 (users). Feature-02 tiếp tục từ **V3**.

---

## 2. KIẾN TRÚC CƠ SỞ DỮ LIỆU (DATABASE SCHEMA CONTEXT)

Tiếp nối Schema của Feature-01. Agent triển khai 4 bảng mới theo thứ tự dependency.

### Thống kê các bảng và mối quan hệ

```
[users] 1 ─────── N [classes]
                      │
              ┌───────┴────────────┐
              │                    │
        N [form_templates]    N [student_profiles]
          (versioning)           (per enrollment)
                                  │
                            [enrollments]  ← Feature-03
```

### V3__create_classes.sql

```sql
CREATE TABLE classes (
    id          SERIAL       PRIMARY KEY,
    class_name  VARCHAR(50)  NOT NULL,
    grade       INT          NOT NULL CHECK (grade BETWEEN 10 AND 12),
    teacher_id  INT          NOT NULL REFERENCES users(id),
    school_id   INT          NOT NULL REFERENCES schools(id),
    status      VARCHAR(10)  NOT NULL DEFAULT 'ACTIVE'
                             CHECK (status IN ('ACTIVE', 'ENDED')),
    base_point  INT          NOT NULL DEFAULT 100,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Ràng buộc cốt lõi: Mỗi Teacher chỉ có 1 lớp ACTIVE tại một thời điểm
CREATE UNIQUE INDEX uq_class_active_per_teacher
    ON classes (teacher_id)
    WHERE status = 'ACTIVE';
```

### V4__create_form_templates.sql

```sql
CREATE TABLE form_templates (
    id         SERIAL        PRIMARY KEY,
    class_id   INT           NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    title      VARCHAR(200)  NOT NULL,
    -- Mảng cấu trúc các trường câu hỏi
    -- Ví dụ: [{"fieldName":"birthPlace","label":"Nơi sinh","type":"text","required":true}]
    structure  JSONB         NOT NULL DEFAULT '[]',
    version    INT           NOT NULL DEFAULT 1,
    is_active  BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (class_id, version)
);

-- Ràng buộc: Chỉ 1 form active trong 1 lớp tại một thời điểm
CREATE UNIQUE INDEX uq_form_active_per_class
    ON form_templates (class_id)
    WHERE is_active = TRUE;
```

### V5__create_student_profiles.sql

```sql
-- Bảng này tham chiếu enrollments (Feature-03)
-- Tạo trước với enrollment_id nullable, FK sẽ thêm ở Feature-03
CREATE TABLE student_profiles (
    id              SERIAL    PRIMARY KEY,
    enrollment_id   INT       UNIQUE,           -- UNIQUE: 1 enrollment = 1 profile
                                                -- FK thêm ở Feature-03
    form_version_id INT       NOT NULL REFERENCES form_templates(id),
    -- Câu trả lời của Student theo cấu trúc form
    -- Key = fieldName từ form_templates.structure
    -- Ví dụ: {"birthPlace": "Hà Nội", "bloodType": "A"}
    data            JSONB     NOT NULL DEFAULT '{}',
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_student_profiles_enrollment
    ON student_profiles(enrollment_id);
CREATE INDEX idx_student_profiles_form_version
    ON student_profiles(form_version_id);
```

---

## 3. MAPPING ĐỐI TƯỢNG NGHIỆP VỤ (DOMAIN LAYER CONTEXT)

### Thực thể JPA (Entities)

* **ClassEntity.java:** Ánh xạ `@Table(name = "classes")`. Trường `status` dùng `@Enumerated(EnumType.STRING)` với enum `ClassStatus { ACTIVE, ENDED }`. Quan hệ `@ManyToOne` tới `User` qua `teacher_id` và tới `School` qua `school_id`.

* **FormTemplate.java:** Ánh xạ `@Table(name = "form_templates")`. Trường `structure` dùng `@Type(JsonBinaryType.class)` từ thư viện `hypersistence-utils` để mapping JSONB. Ánh xạ thành `List<FormFieldDto>` tại tầng Service thông qua `ObjectMapper`.

* **StudentProfile.java:** Ánh xạ `@Table(name = "student_profiles")`. Trường `data` dùng `@Type(JsonBinaryType.class)`, ánh xạ thành `Map<String, Object>`. Trường `enrollment_id` để nullable cho đến Feature-03.

### Cấu trúc Biểu mẫu Dữ liệu (DTOs Quy chuẩn)

* `ClassCreateRequest`: `className`, `grade`, `basePoint`
* `ClassResponse`: `id`, `className`, `grade`, `status`, `basePoint`, `teacherId`, `schoolId`, `createdAt`
* `FormTemplateCreateRequest`: `classId`, `title`, `structure` (List\<FormFieldDto\>)
* `FormFieldDto`: `fieldName` (String, camelCase), `label` (String), `type` (String: text/number/boolean/select/date/textarea), `required` (Boolean), `options` (List\<String\>, bắt buộc nếu type = select)
* `FormTemplateResponse`: `id`, `classId`, `title`, `structure`, `version`, `isActive`, `createdAt`
* `StudentProfileUpdateRequest`: `data` (Map\<String, Object\>)
* `StudentProfileResponse`: `id`, `enrollmentId`, `formVersionId`, `formVersion`, `data`, `updatedAt`

---

## 4. QUY TẮC NGHIỆP VỤ CHO SERVICE LAYER (BUSINESS LOGIC ENGINE)

Tầng Service (`ClassService`, `FormTemplateService`, `StudentProfileService`) validate nghiêm ngặt các quy tắc sau:

| Mã Quy Tắc | Logic Điều Kiện Kiểm Tra | Mã Lỗi Trả Về |
|-------------|--------------------------|----------------|
| **BR-CLASS-01** | Teacher tạo lớp mới khi đã có lớp `status = ACTIVE` → chặn. | `409 CONFLICT` / `ACTIVE_CLASS_EXISTS` |
| **BR-CLASS-02** | Mọi thao tác ghi (tạo form, cập nhật profile) trên lớp có `status = ENDED` → chặn. | `409 CONFLICT` / `CLASS_ENDED` |
| **BR-CLASS-03** | Chỉ Teacher sở hữu lớp (`teacher_id = currentUserId`) mới được gọi `PUT /classes/{id}/end`. | `403 FORBIDDEN` |
| **BR-CLASS-04** | Teacher phải có `school_id` hợp lệ (PROFILE_INCOMPLETE) trước khi tạo lớp. | `403 FORBIDDEN` / `PROFILE_INCOMPLETE` |
| **BR-FORM-01** | Tạo/cập nhật form structure → thực hiện tuần tự trong `@Transactional`: **1.** SET `is_active = false` cho form hiện tại. **2.** INSERT form mới với `version = version_cũ + 1` và `is_active = true`. Không UPDATE structure form cũ. | Thực hiện tự động trong `@Transactional` |
| **BR-FORM-02** | `type = 'select'` → trường `options` không được null hoặc rỗng. | `400 BAD_REQUEST` / `VALIDATION_ERROR` |
| **BR-FORM-03** | `fieldName` phải unique trong cùng 1 form (không trùng lặp trong mảng structure). | `400 BAD_REQUEST` / `VALIDATION_ERROR` |
| **BR-PROFILE-01** | Student cập nhật profile: đối chiếu key của `data` gửi lên với `fieldName` trong form `is_active = true`. Các field `required = true` không được null hoặc rỗng. | `400 BAD_REQUEST` / `VALIDATION_ERROR` |
| **BR-PROFILE-02** | Mỗi `enrollment_id` chỉ có 1 `student_profile` (UNIQUE). Lần đầu → INSERT. Lần sau → UPDATE `data` + `form_version_id`. | Dùng UPSERT / kiểm tra tồn tại trước khi lưu |
| **BR-PROFILE-03** | Khi Student cập nhật profile, lưu lại `form_version_id` của form active tại thời điểm đó. | Thiết lập cứng tại Service |
| **BR-PROFILE-04** | Khi form có version mới, profile cũ KHÔNG bị xóa hay reset. Student tự điền lại khi Teacher yêu cầu. | Không tự động xóa profile cũ |

---

## 5. ĐẶC TẢ CHI TIẾT API ENDPOINTS

Mọi API Response khi gặp lỗi nghiệp vụ tuân thủ định dạng JSON thống nhất:

```json
{
  "timestamp": "2026-06-17T02:55:17+07:00",
  "status": 409,
  "error": "ACTIVE_CLASS_EXISTS",
  "message": "Giáo viên đã có lớp đang hoạt động. Vui lòng kết thúc lớp hiện tại trước.",
  "path": "/api/v1/classes"
}
```

### 1. Tạo lớp học mới

* **Protocol:** `POST /api/v1/classes`
* **Xác thực:** Access Token hợp lệ, `role = TEACHER`, `school_id != NULL`.
* **Nghiệp vụ:** Đọc `teacherId` và `schoolId` từ JWT. Kiểm tra **BR-CLASS-04** → **BR-CLASS-01**. Lưu lớp với `status = ACTIVE`.

### 2. Kết thúc lớp học

* **Protocol:** `PUT /api/v1/classes/{id}/end`
* **Xác thực:** Access Token hợp lệ, `role = TEACHER`, phải là chủ lớp.
* **Nghiệp vụ:** Kiểm tra **BR-CLASS-03**. Cập nhật `status = ENDED`. Kể từ lúc này lớp đóng băng toàn bộ dữ liệu.

### 3. Lấy thông tin lớp học

* **Protocol:** `GET /api/v1/classes/{id}`
* **Xác thực:** `TEACHER` sở hữu lớp hoặc `STUDENT` thuộc lớp.
* **Nghiệp vụ:** Trả về `ClassResponse` kèm thông tin trường học.

### 4. Tạo / Cập nhật cấu trúc Form (Tạo Version mới)

* **Protocol:** `POST /api/v1/classes/{classId}/forms`
* **Xác thực:** Access Token hợp lệ, `role = TEACHER`, phải là chủ lớp.
* **Body mẫu:**
```json
{
  "title": "Sơ yếu lý lịch năm học 2026",
  "structure": [
    {
      "fieldName": "birthPlace",
      "label": "Nơi sinh",
      "type": "text",
      "required": true
    },
    {
      "fieldName": "bloodType",
      "label": "Nhóm máu",
      "type": "select",
      "required": false,
      "options": ["A", "B", "O", "AB"]
    }
  ]
}
```
* **Nghiệp vụ:** Kiểm tra **BR-CLASS-02** → **BR-FORM-02** → **BR-FORM-03** → Áp dụng **BR-FORM-01** trong `@Transactional`.

### 5. Lấy Form đang active của lớp

* **Protocol:** `GET /api/v1/classes/{classId}/forms/active`
* **Xác thực:** `TEACHER` sở hữu lớp hoặc `STUDENT` thuộc lớp.
* **Nghiệp vụ:** Tìm bản ghi `form_templates` có `class_id` tương ứng và `is_active = true`. Dùng để Frontend render form động cho Student điền.

### 6. Lấy lịch sử tất cả version Form

* **Protocol:** `GET /api/v1/classes/{classId}/forms`
* **Xác thực:** `TEACHER` sở hữu lớp.
* **Nghiệp vụ:** Trả về tất cả versions theo thứ tự `version DESC`.

### 7. Student điền / Cập nhật sơ yếu lý lịch

* **Protocol:** `PUT /api/v1/students/me/profile`
* **Xác thực:** Access Token hợp lệ, `role = STUDENT`.
* **Body mẫu:**
```json
{
  "data": {
    "birthPlace": "Hà Nội",
    "bloodType": "A"
  }
}
```
* **Nghiệp vụ:** Đọc `enrollmentId` từ context (Feature-03 sẽ bổ sung). Kiểm tra **BR-CLASS-02** → **BR-PROFILE-01** → UPSERT theo **BR-PROFILE-02** + **BR-PROFILE-03**.

### 8. Teacher xem profile của Student trong lớp

* **Protocol:** `GET /api/v1/classes/{classId}/students/{studentId}/profile`
* **Xác thực:** `TEACHER` sở hữu lớp.
* **Nghiệp vụ:** Query `student_profiles` qua `enrollment_id`. JOIN `form_templates` để trả về `structure` tương ứng với `form_version_id` của profile.

### 9. Student xem profile của chính mình

* **Protocol:** `GET /api/v1/students/me/profile`
* **Xác thực:** Access Token hợp lệ, `role = STUDENT`.
* **Nghiệp vụ:** Trả về profile kèm `form_structure` của version đã điền.

---

## 6. BẢNG MÃ LỖI (ERROR CODES)

| Mã Lỗi | HTTP Status | Mô tả |
|--------|-------------|-------|
| `ACTIVE_CLASS_EXISTS` | 409 | Teacher đã có lớp đang hoạt động |
| `CLASS_ENDED` | 409 | Lớp đã kết thúc — không thể thay đổi |
| `CLASS_NOT_FOUND` | 404 | Lớp không tồn tại |
| `FORM_NOT_FOUND` | 404 | Không tìm thấy form active |
| `VALIDATION_ERROR` | 400 | Cấu trúc form hoặc profile không hợp lệ |
| `PROFILE_NOT_FOUND` | 404 | Student chưa có profile trong lớp này |

---

## 7. CHỈ THỊ THỰC THI CHO AGENTS (AGENTS DIRECTIVES)

Khi lệnh `/orchestrate` kích hoạt cấu hình này, Agent phải tuân thủ:

1. **Migration đánh số tiếp từ Feature-01:** V1 (schools), V2 (users) đã tồn tại. Feature-02 bắt đầu từ **V3** (classes), **V4** (form_templates), **V5** (student_profiles).

2. **Xử lý JSONB với hypersistence-utils:** Thêm dependency vào `build.gradle`:
```groovy
implementation 'io.hypersistence:hypersistence-utils-hibernate-63:3.7.0'
```
Dùng `@Type(JsonBinaryType.class)` cho cột JSONB. Tại Service, dùng `ObjectMapper` để serialize/deserialize và validate cấu trúc.

3. **Đảm bảo Atomic Transaction cho Form Versioning:**
```java
@Transactional(rollbackFor = Exception.class)
public FormTemplateResponse createNewVersion(Integer classId,
                                              FormTemplateCreateRequest request) {
    // Bước 1: Hạ active form cũ
    formTemplateRepository.deactivateCurrentForm(classId);
    // Bước 2: Tạo version mới
    int nextVersion = formTemplateRepository
        .findMaxVersionByClassId(classId).orElse(0) + 1;
    FormTemplate newForm = FormTemplate.builder()
        .classId(classId)
        .title(request.getTitle())
        .structure(request.getStructure())
        .version(nextVersion)
        .isActive(true)
        .build();
    return FormTemplateResponse.from(formTemplateRepository.save(newForm));
}
```

4. **UPSERT Student Profile:**
```java
@Transactional
public StudentProfileResponse upsertProfile(Integer enrollmentId,
                                             StudentProfileUpdateRequest request) {
    FormTemplate activeForm = formTemplateRepository
        .findActiveByClassId(classId)
        .orElseThrow(FormNotFoundException::new);
    // Validate data theo BR-PROFILE-01
    validateProfileData(request.getData(), activeForm.getStructure());
    // UPSERT
    StudentProfile profile = studentProfileRepository
        .findByEnrollmentId(enrollmentId)
        .orElse(StudentProfile.builder()
            .enrollmentId(enrollmentId).build());
    profile.setData(request.getData());
    profile.setFormVersionId(activeForm.getId());
    return StudentProfileResponse.from(studentProfileRepository.save(profile));
}
```

5. **Custom Exceptions bắt buộc:**
`ActiveClassExistsException`, `ClassEndedException`, `ClassNotFoundException`, `FormNotFoundException`, `InvalidFormStructureException`, `ProfileNotFoundException`

6. **Cấm tuyệt đối** dùng placeholder `// TODO` hay logic chưa hoàn chỉnh. Mọi hàm phải viết trọn vẹn từ đầu đến cuối.

7. **Thứ tự output bắt buộc:**

```
1.  V3__create_classes.sql
2.  V4__create_form_templates.sql
3.  V5__create_student_profiles.sql
4.  ClassStatus.java (enum)
5.  ClassEntity.java
6.  FormTemplate.java
7.  StudentProfile.java
8.  ClassRepository.java
9.  FormTemplateRepository.java
10. StudentProfileRepository.java
11. ClassService.java
12. FormTemplateService.java
13. StudentProfileService.java
14. ClassController.java
15. FormController.java
16. StudentProfileController.java
17. DTOs: ClassCreateRequest, ClassResponse,
          FormTemplateCreateRequest, FormFieldDto,
          FormTemplateResponse, StudentProfileUpdateRequest,
          StudentProfileResponse
18. Exceptions: ActiveClassExistsException,
                ClassEndedException, ClassNotFoundException,
                FormNotFoundException,
                InvalidFormStructureException,
                ProfileNotFoundException

Sau mỗi migration: kiểm tra thứ tự dependency.
Sau mỗi file Java: chạy ./mvnw clean compile
Không đụng vào Enrollment, Point, Group — đó là Feature-03+.
```