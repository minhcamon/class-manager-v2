# FEATURE CONTEXT: WEEKLY CYCLE & LEADERBOARD SYSTEM (FEATURE-06)

> **Trạng thái cấu hình:** Sẵn sàng cho Agent Code Generation
> **Kiến trúc áp dụng:** Controller - Service - Repository Pattern
> **Môi trường build:** Maven + Java 21

---

# 1. PHÂN TÍCH GAP VÀ MỤC TIÊU (CONTEXT BOUNDARY)

Sau Feature 5, hệ thống đã có **PointLog** hoạt động theo mô hình **Immutable Ledger**, tuy nhiên vẫn chưa hoàn thiện vòng đời dữ liệu của một tuần học.

Feature 6 bổ sung toàn bộ cơ chế tổng hợp, xếp hạng và lưu trữ lịch sử điểm nhằm hoàn thiện chu trình:

```
PointLog
        ↓
CurrentWeekSnapshot
        ↓
Weekly Leaderboard
        ↓
Weekly Cycle Engine
        ↓
Weekly Report
```

Đồng thời hệ thống cũng xây dựng **Academic Leaderboard** nhằm hiển thị bảng xếp hạng xuyên suốt năm học.

---

# 2. KIẾN TRÚC CƠ SỞ DỮ LIỆU (DATABASE SCHEMA CONTEXT)

Agent cần bổ sung các Entity JPA mới. Database sẽ được Hibernate tự động cập nhật.

## CurrentWeekSnapshot

Lưu dữ liệu tổng hợp của tuần hiện tại.

Thông tin chính:

* enrollment
* weekStartDate
* currentPoint
* totalBonus
* totalPenalty
* classRank
* groupRank
* updatedAt

Entity này luôn được cập nhật sau mỗi PointLog nhằm phục vụ Dashboard và Weekly Leaderboard mà không cần tính toán lại toàn bộ lịch sử.

---

## WeeklyReport

Lưu Snapshot bất biến sau khi kết thúc tuần.

Thông tin chính:

* enrollment
* weekStartDate
* finalPoint
* totalBonus
* totalPenalty
* classRank
* groupRank
* createdAt

Sau khi tạo sẽ không cho phép chỉnh sửa.

---

# 3. DOMAIN LAYER CONTEXT

## Entities

* CurrentWeekSnapshot
* WeeklyReport

## DTO

* AcademicLeaderboardResponse
* WeeklyLeaderboardResponse
* WeeklyReportResponse
* WeeklyHistoryResponse
* WeeklyCloseRequest

---

# 4. BUSINESS RULES

| Rule       | Nội dung                                                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| BR-WEEK-01 | PointLog luôn là Source of Truth của toàn bộ hệ thống.                                                                             |
| BR-WEEK-02 | Sau mỗi PointLog, CurrentWeekSnapshot phải được cập nhật ngay lập tức.                                                             |
| BR-WEEK-03 | Academic Leaderboard luôn phản ánh tổng điểm xuyên suốt năm học và không reset theo tuần.                                          |
| BR-WEEK-04 | Weekly Leaderboard chỉ phản ánh điểm của tuần hiện tại.                                                                            |
| BR-WEEK-05 | Khi đóng tuần, hệ thống phải sinh WeeklyReport từ CurrentWeekSnapshot.                                                             |
| BR-WEEK-06 | Sau khi tuần đã khóa, không cho phép tạo thêm PointLog thuộc tuần đó.                                                              |
| BR-WEEK-07 | Không hỗ trợ Unlock Week. Nếu cần điều chỉnh phải sử dụng Compensation PointLog ở tuần kế tiếp nhằm đảm bảo tính Immutable Ledger. |

---

# 5. API ENDPOINTS

## Academic Leaderboard

```
GET /api/v1/leaderboard/academic
```

Trả về:

* Student Ranking
* Group Ranking
* Overall Points

---

## Weekly Leaderboard

```
GET /api/v1/leaderboard/weekly
```

Trả về:

* Weekly Student Ranking
* Weekly Group Ranking

---

## Weekly Reports

```
GET /api/v1/reports/weeks
```

Danh sách các tuần đã khóa.

---

```
GET /api/v1/reports/weeks/{week}
```

Chi tiết báo cáo của một tuần.

---

## Student Weekly History

```
GET /api/v1/me/history
```

Lịch sử điểm và thứ hạng theo tuần của học sinh.

---

## Close Current Week

```
POST /api/v1/weeks/close
```

Giáo viên thực hiện đóng tuần thủ công.

---

# 6. WEEKLY CYCLE ENGINE

WeeklyCycleEngine chịu trách nhiệm điều phối toàn bộ vòng đời của một tuần học.

Khi thực hiện đóng tuần:

1. Khóa tuần hiện tại.
2. Tính toán Class Rank và Group Rank.
3. Sinh WeeklyReport.
4. Reset CurrentWeekSnapshot.
5. Khởi tạo tuần mới.

Hệ thống hỗ trợ:

* Manual Close Week.
* Scheduler tự động vào cuối tuần.

---

# 7. FRONTEND CONTEXT

## Teacher Dashboard

Hiển thị:

* Academic Leaderboard
* Weekly Leaderboard
* Current Week Statistics
* Recent Point Logs
* Weekly Reports

---

## Student Dashboard

Hiển thị:

* Academic Ranking
* Weekly Ranking
* Current Weekly Point
* Total Academic Point
* Weekly History

---

# 8. SYSTEM ARCHITECTURE

```
                PointLog (Immutable Ledger)
                           │
          ┌────────────────┴────────────────┐
          │                                 │
          ▼                                 ▼
 Academic Leaderboard             CurrentWeekSnapshot
 (Academic Year)                  (Current Week)
          │                                 │
          └────────────────┬────────────────┘
                           ▼
                   Weekly Leaderboard
                           │
                           ▼
                   Weekly Cycle Engine
                           │
                           ▼
                      Weekly Report
                  (Immutable History)
```

---

# 9. AGENT DIRECTIVES

* Không tính Leaderboard trực tiếp từ PointLog cho mỗi request.
* CurrentWeekSnapshot là lớp dữ liệu tổng hợp phục vụ Dashboard thời gian thực.
* Academic Leaderboard phản ánh tổng điểm toàn năm học.
* Weekly Leaderboard phản ánh điểm của tuần hiện tại.
* WeeklyReport là Snapshot bất biến và không được phép cập nhật sau khi sinh.
* Weekly Cycle Engine là thành phần duy nhất được phép tạo WeeklyReport.
* Không hỗ trợ Unlock Week để đảm bảo tính toàn vẹn của Immutable Ledger.
* Mọi logic tổng hợp điểm phải xuất phát từ PointLog nhằm đảm bảo PointLog luôn là Source of Truth của hệ thống.
