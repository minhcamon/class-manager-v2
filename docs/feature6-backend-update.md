# FEATURE CONTEXT: MATRIX POINT BOARD & DYNAMIC AGGREGATION SYSTEM (FEATURE 6 - BACKEND UPDATE)

> **Trạng thái cấu hình:** Sẵn sàng cho Agent Code Generation
> **Kiến trúc áp dụng:** Controller - Service - Repository Pattern (On-demand Dynamic Aggregation)
> **Môi trường build:** Maven + Java 21

---

# 1. PHÂN TÍCH GAP VÀ MỤC TIÊU (CONTEXT BOUNDARY)

Hệ thống loại bỏ hoàn toàn mô hình Snapshot tĩnh (`CurrentWeekSnapshot`) và bản chốt sổ đóng băng (`WeeklyReport`), chuyển đổi toàn bộ sang mô hình **Single Source of Truth (SSOT)** dựa trên thực thể ghi nhận hành vi trung tâm (`StudentWeeklyBehavior`).

Feature 6 - Backend Update tái thiết kế toàn bộ cơ chế tính điểm, xếp hạng và ma trận tuần sang dạng **tổng hợp động (Dynamic Aggregation On-demand)**:

```
StudentWeeklyBehavior (SSOT Central Entity)
        │
        ├───► Dynamic Matrix Aggregation (Group Tree & Multiple Weeks)
        │
        ├───► Dynamic Weekly & Academic Leaderboard (Real-time Ranking)
        │
        └───► Student Weekly Detail (Inspector Drawer Data & Audit History)

```

Kiến trúc này cho phép:

1. Hiển thị bảng ma trận đa tuần (`Matrix Point Board`) theo cấu trúc lồng nhau (Tổ > Học sinh) với hiệu năng cao mà không phụ thuộc vào snapshot.
2. Thao tác CRUD linh hoạt trực tiếp trên từng hành vi/tiêu chí vi phạm/khen thưởng.
3. Kiểm soát quyền chỉnh sửa dữ liệu quá khứ bằng chính sách cửa sổ thời gian (`Time-window Policy`).

---

# 2. KIẾN TRÚC CƠ SỞ DỮ LIỆU (DATABASE SCHEMA CONTEXT)

Agent cần loại bỏ các Entity cũ (`CurrentWeekSnapshot`, `WeeklyReport`) và bổ sung thực thể trung tâm mới. Database sẽ được Hibernate tự động cập nhật.

## StudentWeeklyBehavior

Bảng trung tâm lưu trữ toàn bộ các sự kiện cộng/trừ điểm và hành vi thi đua của học sinh.

Thông tin chính:

* `id` (UUID, Primary Key)
* `studentProfile` (ManyToOne -> `StudentProfile`)
* `classEntity` (ManyToOne -> `ClassEntity`)
* `academicYear` (Integer)
* `semester` (Integer)
* `weekNumber` (Integer)
* `ruleName` (String, max 100)
* `type` (Enum: `BONUS`, `PENALTY`)
* `unitPoint` (Integer)
* `quantity` (Integer)
* `totalPoints` (Integer: `unitPoint * quantity`)
* `dayOfWeek` (String, nullable: `MONDAY`, `TUESDAY`,...)
* `note` (Text, nullable)
* `createdBy` (UUID)
* `createdAt` (Instant)
* `updatedAt` (Instant)

**Chỉ mục tối ưu (Database Indexes):**

* `idx_behavior_class_week`: `(class_id, week_number)`
* `idx_behavior_student_week`: `(student_profile_id, week_number)`

---

# 3. DOMAIN LAYER CONTEXT

## Entities

* `StudentWeeklyBehavior`

## Projection Interfaces

* `StudentWeekAggregatedProjection` (studentId, weekNumber, totalBonus, totalPenalty, netScore, logCount)

## DTO

* `MatrixBoardResponse`
* `GroupMatrixDTO`
* `StudentMatrixDTO`
* `WeekCellDTO`
* `StudentWeeklyDetailResponse`
* `BehaviorLogItemDTO`
* `AcademicLeaderboardResponse`
* `WeeklyLeaderboardResponse`
* `BehaviorCreateRequest`
* `BehaviorUpdateRequest`

---

# 4. BUSINESS RULES

| Rule | Nội dung |
| --- | --- |
| **BR-WEEK-01** | `StudentWeeklyBehavior` là Single Source of Truth duy nhất của toàn bộ hệ thống điểm, ma trận và bảng xếp hạng. |
| **BR-WEEK-02** | Toàn bộ dữ liệu Matrix Board và Leaderboard được tổng hợp động trực tiếp từ Database thông qua Index và Aggregate Query, không sử dụng bảng trung gian. |
| **BR-WEEK-03** | Điểm Net Score của một tuần được tính bằng công thức: $\text{NetScore} = \text{TotalBonus} + \text{TotalPenalty}$. |
| **BR-WEEK-04** | Academic Leaderboard luôn phản ánh tổng điểm tích lũy của toàn năm học bằng cách tổng hợp toàn bộ các bản ghi trong năm học đó. |
| **BR-WEEK-05** | Weekly Leaderboard phản ánh điểm thi đua và thứ hạng được tính động theo `weekNumber` cụ thể. |
| **BR-WEEK-06** | Hệ thống áp dụng Time-window Policy: Cho phép chỉnh sửa điểm của tuần hiện tại và các tuần trước đó trong giới hạn vùng đệm (Grace Period). Quá thời hạn quy định, chỉ tài khoản có quyền ADMIN mới được can thiệp. |
| **BR-WEEK-07** | Không sử dụng cơ chế đóng tuần thủ công (`closeWeek`) hay bảng chốt sổ bất biến (`WeeklyReport`). |

---

# 5. API ENDPOINTS

## Matrix Point Board

```
GET /api/v1/classes/{classId}/matrix-board

```

Query Params: `academicYear`, `semester`, `fromWeek`, `toWeek`

Trả về:

* Cấu trúc lồng nhau: Nhóm Tổ (Group) -> Học sinh (Student) -> Điểm từng tuần (`net`, `pos`, `neg`).
* Điểm trung bình tuần của từng Tổ (`avgScore`).

---

## Student Weekly Detail (Inspector Drawer)

```
GET /api/v1/students/{studentId}/weekly-detail

```

Query Params: `weekNumber`

Trả về:

* Thẻ tổng quan: `netScore`, `totalBonus`, `totalPenalty`.
* Danh sách chi tiết các hành vi ghi nhận trong tuần (`logs`).

---

## Academic Leaderboard

```
GET /api/v1/classes/{classId}/leaderboard/academic

```

Query Params: `academicYear`

Trả về:

* Xếp hạng học sinh toàn năm học (Student Ranking).
* Xếp hạng tổ toàn năm học (Group Ranking).

---

## Weekly Leaderboard

```
GET /api/v1/classes/{classId}/leaderboard/weekly

```

Query Params: `weekNumber`, `academicYear`

Trả về:

* Xếp hạng học sinh theo tuần (Weekly Student Ranking).
* Xếp hạng tổ theo tuần (Weekly Group Ranking).

---

## Behavior Management (CRUD)

```
POST /api/v1/behaviors

```

Tạo mới một ghi nhận điểm/hành vi.

---

```
PATCH /api/v1/behaviors/{id}

```

Cập nhật số lượng (`quantity`), quy chế hoặc ghi chú của một hành vi.

---

```
DELETE /api/v1/behaviors/{id}

```

Xóa một bản ghi hành vi.

---

# 6. WEEKLY DYNAMIC ENGINE

Hệ thống loại bỏ `WeeklyCycleEngine` và cơ chế đóng tuần thủ công. Thay vào đó, toàn bộ nghiệp vụ được điều phối bởi **Dynamic Aggregation Service**:

1. **Matrix Ingestion:** Tự động truy vấn mảng các tuần yêu cầu, nhóm theo danh sách `Enrollment` và `Group` hiện tại của lớp, mapping dữ liệu rỗng (`{net: 0, pos: 0, neg: 0}`) cho các tuần không phát sinh sự kiện.
2. **On-demand Leaderboard:** Tính toán Class Rank và Group Rank theo thời gian thực dựa trên `SUM(totalPoints)` của các học sinh trong phạm vi tuần hoặc năm học được chỉ định.
3. **Time-window Enforcement:** Kiểm tra tính hợp lệ của thời gian trước khi cho phép thực hiện thao tác Thêm/Sửa/Xóa điểm ở các tuần cũ.

---

# 7. FRONTEND CONTEXT

## Matrix Point Board & Inspector Drawer

Hiển thị:

* **Ma trận điểm (Matrix Board):** Dạng Tree-grid có khả năng đóng/mở Tổ, hiển thị các cột tuần với cấu trúc 2 tầng (`Net Score` và `+Pos | -Neg`).
* **Inspector Drawer:** Hiển thị thẻ tóm tắt tuần và danh sách nhật ký `Daily Logs` kèm nút thao tác chỉnh sửa/xóa trực tiếp.
* **Bộ lọc linh hoạt (Filter Toolbar):** Chuyển đổi nhanh giữa `Recent Weeks` (các tuần gần nhất), `Semester` (học kỳ) và `Full Year` (cả năm).

---

## Leaderboard & Analytics Board

Hiển thị:

* Bảng xếp hạng tuần và năm học (Học sinh & Tổ).
* Hệ thống biểu đồ trực quan hóa (Trend Line, Breakdown Bar, Double Bar, Donut Chart).

---

# 8. SYSTEM ARCHITECTURE

```
                  StudentWeeklyBehavior (SSOT Central Entity)
                                      │
           ┌──────────────────────────┼──────────────────────────┐
           │                          │                          │
           ▼                          ▼                          ▼
  Matrix Aggregator          Leaderboard Engine         Detail Drawer Provider
(Tree Group + Multi-week)   (Weekly & Academic Rank)     (Single Week Raw Logs)
           │                          │                          │
           ▼                          ▼                          ▼
   Matrix Point Board         Leaderboard Board          Student Detail Drawer

```

---

# 9. AGENT DIRECTIVES

* Tuyệt đối không tạo lại entity `CurrentWeekSnapshot` và `WeeklyReport`.
* `StudentWeeklyBehavior` là thực thể duy nhất quản lý điểm và chi tiết hành vi.
* Tất cả logic tính toán Ma trận và Bảng xếp hạng phải sử dụng Aggregation Query tối ưu có index, không load toàn bộ entity vào bộ nhớ để tính toán thủ công nếu không cần thiết.
* Trả về dữ liệu mặc định `{ net: 0, pos: 0, neg: 0 }` cho các tuần không có dữ liệu để đảm bảo tính toàn vẹn của bảng Ma trận trên Frontend.
* Áp dụng Time-window Policy trong Service layer để kiểm soát quyền sửa đổi dữ liệu theo tuần.