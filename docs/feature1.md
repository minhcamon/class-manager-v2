
---

# FEATURE CONTEXT: MULTI-TENANT AUTHENTICATION & ONBOARDING SYSTEM (FEATURE-01)

> **Trạng thái cấu hình:** Sẵn sàng cho Agent Code Generation
> **Kiến trúc áp dụng:** Clean Architecture / Controller - Service - Repository Pattern
> **Công nghệ đích:** Java 21, Spring Boot 3.x, Gradle, PostgreSQL, Spring Security 6 (OAuth2 / JWT)

---

## 1. PHÂN TÍCH GAP GIỮA SRS GỐC VÀ YÊU CẦU MỚI (GAP ANALYSIS)

Để tránh xung đột dữ liệu, Agent cần lưu ý sự thay đổi chiến lược từ tài liệu SRS gốc sang Scope mới của Feature này:

* **Cơ chế Authentication bổ sung:** SRS gốc chỉ định dạng đăng ký bằng `google_email` hoặc `phone_number` + OTP. Cấu hình mới yêu cầu mở rộng thêm phương thức đăng nhập truyền thống **Username/Password** (Bắt buộc kèm `phone_number`).
* **Trạng thái Onboarding (Role = NULL):** SRS gốc quy định User chọn Role ngay lúc đăng ký và nhận trạng thái `PENDING` để duyệt. Luồng mới yêu cầu: Đăng ký/Đăng nhập lần đầu qua Google/Password sẽ tạo User với **`role = NULL`**. Hệ thống sẽ chặn bằng Auth Guard và bắt buộc điều hướng qua luồng Chọn Role (`/onboarding/select-role`) trước khi xét duyệt hay phân bổ dữ liệu lớp học.
* **Mở rộng Thực thể Trường học (`schools`):** Bổ sung thực thể `schools` để quản lý đa trường (Multi-tenant) mà SRS gốc chưa thiết lập cấu trúc bảng. Giáo viên tạo trường mới sẽ trở thành chủ sở hữu trường đó.

---

## 2. KIẾN TRÚC CƠ SỞ DỮ LIỆU (DATABASE SCHEMA CONTEXT)

Điểm khởi tạo cho Database Migration (Flyway/Liquibase). Các trường ràng buộc dữ liệu toàn vẹn phải được cấu hình chính xác tuyệt đối.

### Thống kê các bảng và mối quan hệ

```
   [schools] 1 ─────── N [users]
      │                     ▲
      └─────── (created_by) ┘

```

### V1__create_schools.sql

```sql
CREATE TABLE schools (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    address    VARCHAR(500) NOT NULL,
    created_by INT, -- Sẽ tạo FK sau khi bảng users được khởi tạo
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

```

### V2__create_users.sql

```sql
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    username        VARCHAR(50) UNIQUE,              -- NULL nếu đăng nhập thuần bằng Google
    password_hash   VARCHAR(100),                     -- NULL nếu đăng nhập thuần bằng Google
    google_email    VARCHAR(100) UNIQUE,             -- NULL nếu đăng ký bằng Username/Password
    phone_number    VARCHAR(15) UNIQUE,              -- Bắt buộc nếu đăng ký bằng Username/Password
    full_name       VARCHAR(100) NOT NULL,
    role            VARCHAR(20) DEFAULT NULL CHECK (role IN ('ADMIN', 'TEACHER', 'STUDENT')),
    school_id       INT REFERENCES schools(id) ON DELETE SET NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_auth_method CHECK (
        (username IS NOT NULL AND password_hash IS NOT NULL AND phone_number IS NOT NULL) OR
        (google_email IS NOT NULL)
    )
);

-- Thêm khóa ngoại chéo từ schools về users sau khi cả 2 bảng đã tồn tại
ALTER TABLE schools ADD CONSTRAINT fk_schools_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX idx_users_username ON users(username) WHERE username IS NOT NULL;
CREATE INDEX idx_users_google ON users(google_email) WHERE google_email IS NOT NULL;

```

---

## 3. MAPPING ĐỐI TƯỢNG NGHIỆP VỤ (DOMAIN LAYER CONTEXT)

### Thực thể JPA (Entities)

* **User.java:** Chứa các annotation `@Entity`, `@Table(name = "users")`. Ánh xạ các trường chính xác theo SQL Schema. Trường `role` ánh xạ dạng Enum hoặc String. Mối quan hệ `@ManyToOne` với `School` thông qua `@JoinColumn(name = "school_id")`.
* **School.java:** Ánh xạ tới `@Table(name = "schools")`. Trường `created_by` được cấu hình để tránh vòng lặp tuần tự hóa tuần hoàn khi build DTO (Sử dụng `@JsonIgnore` hoặc mapping Id thủ công tại tầng Service).

### Cấu trúc Biểu mẫu Dữ liệu (DTOs Quy chuẩn)

Mọi dữ liệu trao đổi qua API biên giới bắt buộc sử dụng DTO. Dưới đây là cấu trúc Data Fields mà Agent cần triển khai:

* `UserRegisterRequest`: `username`, `password`, `phoneNumber`, `fullName`
* `UserLoginRequest`: `username`, `password`
* `GoogleLoginRequest`: `idToken`
* `SelectRoleRequest`: `role` ('TEACHER' hoặc 'STUDENT')
* `SchoolCreateRequest`: `name`, `address`
* `UserResponse`: `id`, `username`, `googleEmail`, `phoneNumber`, `fullName`, `role`, `schoolId`, `createdAt`
* `AuthResponse`: `accessToken`, `expiresIn` (Đồng thời đính kèm Refresh Token vào HttpOnly Cookie)

---

## 4. QUY TẮC NGHIỆP VỤ CHO SERVICE LAYER (BUSINESS LOGIC ENGINE)

Tầng Service xử lý logic phải cài đặt cơ chế kiểm tra Validation nghiêm ngặt, ném ra các Ngoại lệ kiểm soát (Custom Runtime Exceptions):

| Mã Quy Tắc | Logic Điều Kiện Kiểm Tra | Mã Lỗi Trả Về (HTTP Status) |
| --- | --- | --- |
| **BR-AUTH-01** | Đăng ký bằng Username/Password mà `phone_number` trống hoặc trùng lặp. | `400 BAD_REQUEST` / `VALIDATION_ERROR` |
| **BR-AUTH-02** | Đăng nhập/Đăng ký bằng Google Token hợp lệ $\rightarrow$ Cho phép `phone_number` để trống. | `200 OK` / `201 CREATED` |
| **BR-AUTH-03** | Mọi tài khoản mới khởi tạo thông qua cổng Auth công khai đều phải gán mặc định `role = NULL`. | Thiết lập cứng tại code Service |
| **BR-AUTH-04** | Khi User thực hiện gửi Request có Token mà `role == NULL` (Ngoại trừ API `/auth/select-role` và `/auth/me`). | `403 FORBIDDEN` / `ROLE_NOT_SELECTED` |
| **BR-AUTH-05** | Gọi API `/auth/select-role` khi trường `users.role` trong DB đã có giá trị (`TEACHER` hoặc `STUDENT`). | `409 CONFLICT` / `ROLE_ALREADY_SELECTED` |
| **BR-AUTH-06** | User có `role == TEACHER` nhưng trường `school_id == NULL` khi cố gắng truy cập các tài nguyên sâu. | `403 FORBIDDEN` / `PROFILE_INCOMPLETE` |
| **BR-AUTH-07** | Học sinh chọn `role == STUDENT` $\rightarrow$ Không kích hoạt bất kỳ validation nào về School tại Sprint này. | Bỏ qua bước kiểm tra điều kiện trường |
| **BR-AUTH-08** | Mọi mật khẩu thô lưu vào DB bắt buộc phải đi qua mã hóa `BCryptPasswordEncoder`. | Mã hóa 1 chiều trước khi lưu |
| **BR-AUTH-09** | Luồng xử lý sinh mã `Refresh Token` phải được set vào Header `Set-Cookie` dạng `HttpOnly; Secure; SameSite=Strict; Max-Age=604800`. | Xử lý tại tầng Controller/Filter |

---

## 5. ĐẶC TẢ CHI TIẾT API ENDPOINTS

Mọi API Response khi gặp lỗi nghiệp vụ phải tuân thủ định dạng JSON lỗi thống nhất của hệ thống:

```json
{
  "timestamp": "2026-06-17T02:55:17+07:00",
  "status": 403,
  "error": "FORBIDDEN",
  "message": "Chi tiết thông điệp lỗi nghiệp vụ tại đây",
  "path": "/api/v1/..."
}

```

### Chi tiết các API cần sinh code:

1. **`POST /api/v1/auth/register`**
* *Nghiệp vụ:* Tạo tài khoản dạng Username/Password. Cài đặt mã hóa Password, gán `role = NULL`.


2. **`POST /api/v1/auth/login`**
* *Nghiệp vụ:* Xác thực Username/Password. Sinh JWT Access Token + HttpOnly Refresh Token.


3. **`POST /api/v1/auth/google`**
* *Nghiệp vụ:* Tiếp nhận Google `idToken`, giải mã qua `GoogleTokenVerifier`. Nếu Email chưa tồn tại $\rightarrow$ tự động đăng ký tài khoản mới với `role = NULL`. Nếu đã tồn tại $\rightarrow$ Trả về token đăng nhập.


4. **`POST /api/v1/auth/refresh`**
* *Nghiệp vụ:* Đọc chuỗi Refresh Token từ Cookie, xác thực tính hợp lệ để cấp mới Access Token.


5. **`POST /api/v1/auth/logout`**
* *Nghiệp vụ:* Xóa bỏ/Ghi đè Cookie Refresh Token cũ với thời gian sống bằng 0 (`Max-Age=0`).


6. **`PUT /api/v1/auth/select-role`**
* *Xác thực:* Yêu cầu Access Token hợp lệ (Kể cả khi `role == NULL`).
* *Nghiệp vụ:* Cập nhật trường `role` cho User hiện tại. Áp dụng nghiêm ngặt **BR-AUTH-05**.


7. **`POST /api/v1/schools`**
* *Xác thực:* Yêu cầu Access Token phải có `role == TEACHER`.
* *Nghiệp vụ:* Tạo bản ghi trường học mới. Cập nhật ID trường vừa tạo ngược lại vào cột `school_id` của chính User (Giáo viên) thực hiện.


8. **`GET /api/v1/auth/me`**
* *Xác thực:* Yêu cầu Access Token hợp lệ.
* *Nghiệp vụ:* Trả về toàn bộ thông tin chi tiết cấu trúc hồ sơ User hiện tại dựa trên Claims nhận dạng.



---

## 6. CẤU HÌNH BẢO MẬT & ĐIỀU HƯỚNG LUỒNG (SECURITY & AUTH GUARD)

### Cấu trúc JWT Claims

Chuỗi mã hóa JWT sinh ra sau quá trình Authenticate bắt buộc chứa các tham số định danh:

```json
{
  "sub": "string (chứa ID của user gốc)",
  "username": "string",
  "role": "TEACHER | STUDENT | null",
  "schoolId": "integer | null",
  "iat": 1770000000,
  "exp": 1770007200
}

```

### Logic Xử lý lớp bảo mật (JwtAuthFilter)

Tại bộ lọc Request đầu vào, Agent cần cài đặt luồng thuật toán kiểm soát (Auth Guard Luồng) tuần tự:

```
[Incoming Request] ──► [Xác thực chuỗi JWT Token thành công]
                             │
                             ├──► Nếu URI thuộc whitelist (/auth/login, /auth/register, /auth/google) ──► Bỏ qua filter
                             │
                             └──► Kiểm tra Claims dữ liệu:
                                       │
                                       ├──► Nếu role == NULL và URI khác "/auth/select-role" và "/auth/me"
                                       │         └──► Ném ngay lỗi 403 (ROLE_NOT_SELECTED)
                                       │
                                       └──► Nếu role == TEACHER và schoolId == NULL và URI là các tài nguyên hệ thống chuyên sâu (không bao gồm "/schools" hoặc "/auth/me")
                                                 └──► Ném ngay lỗi 403 (PROFILE_INCOMPLETE)

```

---

## 7. FILE CẤU HÌNH KHỞI TẠO (APPLICATION ENVIRONMENT)

### application.yml (Cấu hình chuẩn cho Agent)

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/classmanager
    username: postgres
    password: yourpassword
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true
    properties:
      hibernate:
        format_sql: true

jwt:
  secret: 4036717551323267566B5970337336763979244226452F484F4D514D58753978
  access-expiration: 7200 # 2 giờ tính bằng giây
  refresh-expiration: 604800 # 7 ngày tính bằng giây

google:
  client-id: your-google-client-id.apps.googleusercontent.com

```

---

## 8. CHỈ THỊ THỰC THI CHO AGENTS (AGENTS DIRECTIVES)

Khi lệnh `/orchestrate` kích hoạt cấu hình này cho các Sub-Agents thực hiện viết mã nguồn, các Agent phải tuân thủ:

1. **Cấm tuyệt đối** sử dụng mã giả (Placeholder) hoặc comment `// TODO: Implement later`. Mọi hàm nghiệp vụ phải được viết trọn vẹn logic từ đầu đến cuối.
2. Tất cả các lỗi nghiệp vụ không được xử lý cục bộ bằng khối `try-catch` trả về đối tượng ResponseEntity rỗng, mà phải định nghĩa lớp Exception cụ thể kế thừa `RuntimeException` và ném ra để `GlobalExceptionHandler` xử lý tập trung.
3. Tuân thủ cấu trúc phân rã thư mục Clean Architecture đã đề xuất trong SRS gốc (Tách rõ rệt `controller`, `service`, `repository`, `entity`, `dto`, `exception`).