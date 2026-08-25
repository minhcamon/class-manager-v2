# FEATURE CONTEXT: MATRIX POINT BOARD & INSPECTOR DRAWER (FEATURE 6 - FRONTEND UPDATE - VER 1)

> **Trạng thái cấu hình:** Sẵn sàng cho Agent Code Generation
> **Kiến trúc áp dụng:** React + TanStack Table v8 + Shadcn UI + Tailwind CSS
> **Quản lý State & Server Cache:** TanStack Query (React Query)
> **Mục tiêu cốt lõi:** Đảm bảo trải nghiệm Single Source of Truth (SSOT) – Bảng ma trận tải tức thì, phản ánh chính xác 100% dữ liệu backend và đồng bộ hai chiều với Inspector Drawer.

---

# 1. PHÂN TÍCH GAP VÀ MỤC TIÊU (CONTEXT BOUNDARY)

Sau khi hoàn thiện Backend (Feature 6 - Backend Update), hệ thống đã có endpoint tổng hợp Ma trận điểm (`/api/v1/classes/{classId}/matrix-board`) và chi tiết theo tuần (`/api/v1/students/{studentId}/weekly-detail`).

Feature 6 - Frontend Update (Ver 1) tập trung xây dựng toàn bộ **Matrix Point Board** dạng Tree-grid lồng nhau (Tổ > Học sinh) kết hợp với **Student Inspector Drawer** bên phải:

```
┌────────────────────────────────────────────────────────────────────────┐  ┌───────────────────────┐
│ MATRIX POINT BOARD (TanStack Tree Table)                               │  │ INSPECTOR DRAWER      │
├────────────────────────────────────────────────────────────────────────┤  ├───────────────────────┤
│ [v] TỔ 1 (Avg: +4.2)      | W16      | W17      | ... | W23 (Active)   │  │ Nguyễn Văn A (Tuần 23)│
│   ├── [★ TL] Nguyễn Văn A | +5 (+5|0)| +5 (+5|0)| ... | +3 (+4|-1) ◄───┼──┤ [NET +3] [POS +4|-1]  │
│   └── [TV] Trần Thị B     | +2 (+2|0)| +2 (+2|0)| ... | +8 (+10|-2)   │  │ DAILY LOGS:           │
│ [>] TỔ 2 (Avg: +2.1)      | ...      | ...      | ... | ...            │  │ • Phát biểu (+2) [🗑] │
│ [>] TỔ 3 (Avg: -0.5)      | ...      | ...      | ... | ...            │  │ • Đi muộn (-1)   [🗑] │
└────────────────────────────────────────────────────────────────────────┘  └───────────────────────┘

```

---

# 2. KIẾN TRÚC GIAO DIỆN & COMPONENT TREE (COMPONENT CONTEXT)

```
MatrixPointBoardContainer
├── MatrixFilterToolbar
│   ├── AcademicYearSelect & SemesterSelect
│   ├── ViewScopeToggle (Recent Weeks | Semester | Full Year)
│   └── QuickActionGroup (Search Student, Collapse/Expand All Groups)
├── MatrixTable
│   ├── MatrixTableHeader (Sticky Top - Cố định dòng tuần)
│   ├── MatrixTableBody (Virtualization/Scrollable)
│   │   ├── GroupRow (Parent Node - Collapsible, Sticky Leader avg badge)
│   │   └── StudentRow (Child Node - Avatar, Role Badge, Sticky Name Column)
│   │       └── WeekPointCell (2-tier Cell: Net Score + Mini Badges [+ | -])
│   └── MatrixTableFooter (Sticky Bottom - Toàn lớp Summary)
└── StudentInspectorDrawer (Sheet / Slide-over Panel)
    ├── DrawerHeader (Student Name, Group Info, Week Badge, Close Button)
    ├── WeekSummaryCards (3 Thẻ số liệu: NET, POS, NEG)
    ├── DailyLogsList
    │   └── LogItemCard (Badge type, Rule name, Timestamp, Action menu [Edit/Delete])
    └── QuickAddBehaviorForm (Drawer Inline Form - Thêm nhanh điểm)

```

---

# 3. QUY CHUẨN HIỂN THỊ Ô ĐIỂM (CELL TYPOGRAPHY & VISUAL ENCODING)

Để triệt tiêu tình trạng quá tải thị giác (*Cognitive Overload*) nhưng vẫn giữ trọn vẹn thông tin chi tiết:

```
┌──────────────────────────┐
│          +5              │  ◄── Dòng 1: Net Score (Font 14px Semi-bold)
│        +5 | 0            │  ◄── Dòng 2: Sub-score (+Pos | -Neg) (Font 11px Muted)
└──────────────────────────┘

```

* **Dòng 1 - Net Score:**
* $\text{Net} > 0$: Font `font-semibold text-emerald-600 dark:text-emerald-400`, prefix `+`.
* $\text{Net} < 0$: Font `font-semibold text-rose-600 dark:text-rose-400`, prefix `-`.
* $\text{Net} = 0$: Font `font-medium text-slate-500 dark:text-slate-400`, hiển thị `0`.


* **Dòng 2 - Sub-score (Cộng | Trừ):**
* Hiển thị dạng `+{pos} | -{neg}` bằng font chữ nhỏ `text-[11px] text-muted-foreground`.
* Nếu cả $pos = 0$ và $neg = 0$, hiển thị dấu gạch ngang xám nhạt `-`.


* **Active / Selected State:**
* Cell đang được chọn để xem Drawer sẽ có viền highlight xanh đậm `ring-2 ring-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30`.



---

# 4. QUẢN LÝ DỮ LIỆU & ĐỒNG BỘ HAI CHIỀU (SSOT STATE STRATEGY)

Để người dùng tin cậy 100% vào tính chuẩn xác của dữ liệu:

* **Single Query Key Hierarchy (TanStack Query):**
* `['matrix-board', classId, { academicYear, semester, fromWeek, toWeek }]`
* `['student-weekly-detail', studentId, weekNumber]`


* **Optimistic Updates khi Thao tác trên Drawer:**
* Khi bấm Thêm/Sửa/Xóa một hành vi trong Drawer:
1. Cập nhật tức thì UI của Drawer.
2. Cập nhật trực tiếp Cache của `matrix-board` tương ứng với cell `(studentId, weekNumber)` mà không cần đợi reload toàn bộ bảng.
3. Gửi mutation lên API Backend (`/api/v1/behaviors`).
4. Tự động `invalidateQueries` khi mutation thành công/thất bại để đồng bộ tuyệt đối với Database.





---

# 5. TYPESCRIPT CONTRACTS & DATA SCHEMAS

```typescript
// 1. Dữ liệu từng Cell tuần
export interface WeekCellData {
  weekNumber: number;
  net: number;
  pos: number;
  neg: number;
  logCount: number;
}

// 2. Dòng học sinh trong Ma trận
export interface StudentMatrixRow {
  studentId: string;
  studentName: string;
  avatarUrl?: string;
  role: "LEADER" | "MEMBER";
  weeks: Record<number, WeekCellData>; // Key: weekNumber
}

// 3. Nhóm Tổ trong Ma trận (Cây thư mục)
export interface GroupMatrixRow {
  groupId: string;
  groupName: string;
  studentCount: number;
  avgNetScore: number;
  students: StudentMatrixRow[];
}

// 4. Response API Ma trận
export interface MatrixBoardResponse {
  academicYear: number;
  semester: number;
  activeWeek: number;
  displayedWeeks: number[]; // [16, 17, 18, 19, 20, 21, 22, 23]
  groups: GroupMatrixRow[];
}

// 5. Chi tiết nhật ký học sinh theo tuần (Drawer)
export interface BehaviorLogItem {
  id: string;
  ruleName: string;
  type: "BONUS" | "PENALTY";
  unitPoint: number;
  quantity: number;
  totalPoints: number;
  dayOfWeek?: string;
  note?: string;
  createdAt: string;
  createdBy: string;
}

export interface StudentWeeklyDetailResponse {
  studentId: string;
  studentName: string;
  weekNumber: number;
  netScore: number;
  totalBonus: number;
  totalPenalty: number;
  logs: BehaviorLogItem[];
}

```

---

# 6. BUSINESS & INTERACTION RULES (UX RULES)

| Mã Rule | Nội dung quy tắc |
| --- | --- |
| **BR-UI-01** | Bảng Matrix mặc định hiển thị ở chế độ `Recent Weeks` (6 đến 8 tuần gần nhất kèm tuần hiện tại) để tối ưu không gian thị giác. |
| **BR-UI-02** | Cột thông tin `STUDENT` và tiêu đề tuần (`WEEK X`) phải luôn ở trạng thái **Sticky** khi cuộn trang theo cả chiều ngang và dọc. |
| **BR-UI-03** | Khi click vào bất kỳ cell điểm của một học sinh tại một tuần cụ thể, Drawer tự động trượt ra và tải chính xác nhật ký của đúng tuần đó. |
| **BR-UI-04** | Trạng thái đóng/mở (Expanded/Collapsed) của các Tổ được lưu vào `localStorage` hoặc Local State để không bị reset khi chuyển tuần. |
| **BR-UI-05** | Mọi thao tác CRUD trong Drawer đều có thông báo Toast phản hồi tức thì và cập nhật trực tiếp con số trên ô Ma trận tương ứng. |

---

# 7. AGENT DIRECTIVES (FRONTEND IMPLEMENTATION)

* Sử dụng `@tanstack/react-table` kết hợp với các component nguyên tử của `shadcn/ui` (`Table`, `Sheet`, `Badge`, `Button`, `Tooltip`, `Card`).
* Thiết lập tính năng **Expanding Sub-rows** trong TanStack Table để xử lý cấu trúc cây thư mục Tổ $\rightarrow$ Học sinh.
* Cột `STUDENT` có chiều rộng cố định (`w-[240px]`), các cột tuần có chiều rộng đồng đều (`w-[90px] - min-w-[90px]`) để layout bảng không bị giật khi chuyển đổi bộ lọc.
* Đảm bảo Drawer hỗ trợ đầy đủ các trạng thái: `Loading Skeleton`, `Empty State` (khi tuần đó chưa có vi phạm/khen thưởng) và `Error Fallback`.