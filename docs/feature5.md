Báo cáo phân tích hiện trạng và đề xuất hướng đi cho **FEATURE-05** của bạn cực kỳ bài bản, bám sát tư duy kiến trúc phân lớp và quy tắc cô lập tài nguyên hệ thống (role-free URLs / contextual security).

Để chuẩn bị một **Feature Context** đóng gói hoàn chỉnh, sẵn sàng kích hoạt các Code Generation Agents triển khai viết mã nguồn (qua Maven + Java 21) không bị sai lệch, dưới đây là phần phân tích chuyên sâu, bổ sung các góc khuất kiến trúc (Edge Cases) và chuẩn hóa dữ liệu cho Feature-05.

---

# FEATURE CONTEXT: IMMUTABLE LEDGER & ROSTER GROUPS (FEATURE-05)

> **Trạng thái cấu hình:** Sẵn sàng kích hoạt sinh mã nguồn.
> **Kiến trúc áp dụng:** Controller ➔ Service ➔ Repository (Bất biến tầng Ledger).
> **Môi trường:** Java 21, Spring Boot 3.x, Maven, PostgreSQL (JSONB / Index chuyên sâu).

---

## 1. THIẾT KẾ CƠ SỞ DỮ LIỆU & CHIẾN LƯỢC QUÉT INDEX (DATABASE LAYER)

Bảng `point_logs` được định nghĩa là **Immutable Ledger** (Sổ cái bất biến). Tần suất ghi (Write) và truy vấn tính toán tổng (Aggregation Read) sẽ diễn ra liên tục. Do đó, cấu trúc bảng dữ liệu cần được tối ưu hóa bằng Composite Index (được cấu hình trực tiếp qua các Annotation JPA trên Entity).

### Cấu trúc Schema Tham chiếu (Database Schema Reference)

> [!IMPORTANT]
> **Dự án KHÔNG sử dụng các tệp migration (Flyway/Liquibase).**
> Toàn bộ cấu trúc bảng sẽ được Hibernate tự động sinh và cập nhật qua JPA Entity (`ddl-auto=update`).
> Đoạn SQL dưới đây chỉ dùng để tham chiếu thiết kế cấu trúc quan hệ và các Index tối ưu hóa (được cấu hình bằng các annotation `@Table(indexes = ...)` trên JPA Entities).

```sql
-- 1. TẠO BẢNG NHÓM TỔ (GROUPS)
CREATE TABLE groups (
    id                 SERIAL PRIMARY KEY,
    class_id           INT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    group_name         VARCHAR(50) NOT NULL,
    leader_student_id  INT, -- Sẽ tạo FK liên kết ngược sau khi xử lý vòng lặp tham chiếu
    created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (class_id, group_name)
);

-- 2. CẬP NHẬT BẢNG STUDENT_PROFILES ĐỂ LIÊN KẾT NHÓM
ALTER TABLE student_profiles ADD COLUMN group_id INT REFERENCES groups(id) ON DELETE SET NULL;
CREATE INDEX idx_student_profiles_group ON student_profiles(group_id);

-- Thêm ràng buộc khóa ngoại từ groups về ngược student_profiles cho vị trí Tổ trưởng
ALTER TABLE groups ADD CONSTRAINT fk_groups_leader FOREIGN KEY (leader_student_id) REFERENCES student_profiles(id) ON DELETE SET NULL;

-- 3. TẠO BẢNG NHẬT KÝ ĐIỂM SỐ BẤT BIẾN (POINT LOGS)
CREATE TABLE point_logs (
    id                 BIGSERIAL PRIMARY KEY,
    student_id         INT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    class_id           INT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    created_by_user_id INT NOT NULL REFERENCES users(id),
    point_value        INT NOT NULL CHECK (point_value <> 0 AND point_value BETWEEN -100 AND 100),
    reason             TEXT NOT NULL,
    week_start_date    DATE NOT NULL, -- Định dạng YYYY-MM-DD (Luôn là ngày Thứ Hai đầu tuần)
    created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. CHIẾN LƯỢC TỐI ƯU HÓA TRUY VẤN (INDEXING)
-- Index phục vụ tính toán điểm động (Aggregation) của từng học sinh trong một tuần/lớp cụ thể
CREATE INDEX idx_point_logs_aggregate ON point_logs(student_id, class_id, week_start_date);
-- Index phục vụ truy vết lịch sử theo tuần của toàn lớp
CREATE INDEX idx_point_logs_class_week ON point_logs(class_id, week_start_date);

```

---

## 2. QUY TẮC NGHIỆP VỤ BỔ SUNG CHO ĐỘI NGŨ AGENTS (BUSINESS LOGIC CODES)

Bên cạnh các quy tắc bạn đã định nghĩa (`BR-POINT-01` đến `BR-POINT-04`), Agent cần được ràng buộc thêm 2 quy tắc xử lý biên (Edge Cases) cực kỳ quan trọng sau để tránh phá vỡ tính toàn vẹn dữ liệu:

| Mã Quy Tắc | Mô tả chi tiết điều kiện kiểm tra | Giải pháp xử lý kỹ thuật |
| --- | --- | --- |
| **BR-POINT-05** | **Xác thực Ngày đầu tuần (`week_start_date`)**: Dữ liệu truyền lên từ client bắt buộc phải rơi vào đúng **Ngày Thứ Hai** đầu tuần. Hệ thống không chấp nhận bất kỳ ngày nào khác giữa tuần. | Tại Service, sử dụng: `if (date.getDayOfWeek() != DayOfWeek.MONDAY) throw new InvalidWeekDateException();` |
| **BR-GROUP-03** | **Bảo vệ toàn vẹn Tổ trưởng**: Một Học sinh chỉ được làm Tổ trưởng của **chính tổ mà học sinh đó đang sinh hoạt** (`student_profiles.group_id == groups.id`). Không cho phép gán học sinh tổ A làm tổ trưởng tổ B. | Kiểm tra chéo dữ liệu trước khi thực hiện câu lệnh cập nhật `leader_student_id`. |

---

## 3. THIẾT KẾ DATA FIELDS CHO TẦNG DTO (MAPPED TRỰC TIẾP TỪ MAVEN POM)

Mọi luồng dữ liệu vào và ra của Feature-05 không được phép rò rỉ cấu trúc Entity gốc ra ngoài.

### DTO Đầu vào (Requests)

* **`PointLogCreateRequest`**:
* `studentId`: `Integer` (NotNull)
* `pointValue`: `Integer` (NotNull, `@Min(-100)`, `@Max(100)`)
* `reason`: `String` (NotBlank, `@Size(min = 5, max = 500)`)
* `weekStartDate`: `LocalDate` (NotNull, format `yyyy-MM-dd`)


* **`GroupCreateRequest`**:
* `classId`: `Integer` (NotNull)
* `groupName`: `String` (NotBlank, e.g., "Tổ 1")



### DTO Đầu ra (Responses)

* **`StudentCurrentPointResponse`**:
* `studentId`: `Integer`
* `fullName`: `String`
* `basePoint`: `Integer`
* `totalDelta`: `Integer` (Tổng cộng/trừ từ bảng log)
* `currentPoint`: `Integer` (`basePoint` + `totalDelta`)



---

## 4. CHI TIẾT ĐIỀU HƯỚNG ROUTE GUARD TẠI WEB SECURITY (BE)

Tại phân hệ bảo mật đã dựng ở Feature-03, logic kiểm tra Context quyền hạn của API Chấm điểm (`POST /api/v1/points`) cần áp dụng kỹ thuật **Custom Security Expression** hoặc xử lý sâu tại tầng Service như sau:

```java
@Transactional
public PointLogResponse createPointLog(PointLogCreateRequest request, User currentUser) {
    // 1. Kiểm tra lớp kết thúc chưa (BR-CLASS-02)
    // 2. Kiểm tra tuần bị khóa chưa (BR-POINT-04)
    // 3. Thực thi BR-POINT-03 (Phân quyền chấm điểm thực tế):
    if (currentUser.getRole() == UserRole.STUDENT) {
        StudentProfile leaderProfile = studentProfileRepository.findByUserId(currentUser.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Hồ sơ học sinh không tồn tại"));
            
        // Kiểm tra xem học sinh này có phải là tổ trưởng của tổ nào không
        Group ownedGroup = groupRepository.findByLeaderStudentId(leaderProfile.getId())
            .orElseThrow(() -> new ForbiddenException("STUDENT_NOT_IN_GROUP"));
            
        // Kiểm tra học sinh bị chấm có nằm trong tổ của Tổ trưởng này không
        StudentProfile targetStudent = studentProfileRepository.findById(request.getStudentId())
            .orElseThrow(() -> new ResourceNotFoundException("Học sinh bị chấm không tồn tại"));
            
        if (!targetStudent.getGroupId().equals(ownedGroup.getId())) {
            throw new ForbiddenException("STUDENT_NOT_IN_GROUP"); // Chặn đứng hành vi chấm chéo tổ
        }
    }
    // 4. Nếu là TEACHER hoặc thỏa mãn điều kiện tổ trưởng -> Tiến hành ghi Ledger
}

```

---

## 5. ĐỊNH HƯỚNG PHÁT TRIỂN TIẾP THEO CHO BẠN (NEXT STEP EXECUTION)

Lộ trình bóc tách của bạn hoàn toàn chính xác. Để khởi động quá trình viết code tự động, bạn có thể thực hiện tuần tự các đầu việc sau:

1. Triển khai các JPA Entities mới (`Group.java`, `PointLog.java`) và cập nhật các liên kết trên `StudentProfile.java`. Sử dụng các Annotation của Hibernate để cấu hình khóa ngoại `@JoinColumn` và các Index `@Table(indexes = ...)` thay vì tạo tệp SQL migration.
2. Thực hiện chạy ngay lệnh biên dịch để kiểm tra tính toàn vẹn của cấu hình Maven hiện tại:
```bash
./mvnw clean compile
```


3. Khi hệ thống biên dịch thành công mà không gặp lỗi cấu trúc, bạn có thể tiếp tục triển khai chi tiết mã nguồn cho các lớp Java tương ứng (Repository, Service, DTO, Controller) theo luồng Clean Architecture của dự án.