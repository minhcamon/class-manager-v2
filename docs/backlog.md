# ClassManager — Project Backlog & Bug Tracking

Tài liệu này dùng để ghi nhận, phân loại và theo dõi các lỗi (bugs), thiếu sót logic, hoặc các cải tiến (enhancements) phát sinh trong quá trình kiểm thử các feature để xử lý sau.

---

## 📌 Bảng Tổng Quan Trạng Thái

| ID | Feature | Mô tả vấn đề / Yêu cầu | Loại | Mức độ | Trạng thái | Ngày ghi nhận |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `BUG-001` | Feature 7 | Lỗi tính năng Quan sát tài khoản (View-As Mode) | Logic / Auth | High | `OPEN` | 2026-08-18 |
| `ENH-001` | Feature 6 | Trợ lý AI (AI Assistant) cho nhận xét & phân tích hành vi học sinh | Enhancement / AI | Medium | `OPEN` | 2026-08-26 |
| `ENH-002` | Feature 6 | Các Chart View (Biểu đồ phân tích xu hướng điểm tuần & so sánh tổ) | Enhancement / UI | Medium | `OPEN` | 2026-08-26 |
| `ENH-003` | Feature 6 | Tích hợp Bảng điểm ma trận cho Giao diện Học sinh (Student Point Board) | Enhancement / UI | Medium | `OPEN` | 2026-08-26 |
| `ENH-004` | Feature 6 | Nhập nhanh hành vi/lỗi bằng văn bản thô (Raw Text Parser & Double-Check Modal) | Enhancement / AI | High | `OPEN` | 2026-08-27 |
| `ENH-005` | Feature 6 | Tối ưu UI Bảng ma trận điểm (Thu gọn cột tên HS & Hiển thị Tổ trưởng - Ver 1) | Enhancement / UI | Medium | `DONE` | 2026-08-27 |
| `ENH-006` | Feature 6 | Tab Tuần chi tiết (Weekly Focus View - Chip Clamp/Expand & In-context Editing) | Enhancement / UI | High | `DONE` | 2026-08-27 |
| `ENH-007` | Feature 2 | Cấu hình Điểm cơ sở lớp học (Custom Class Base Point & Settings Modal) | Enhancement / UI | Medium | `OPEN` | 2026-08-27 |

---

## 🔍 Chi Tiết Backlog Theo Từng Feature

### 1. Feature 1: Authentication & Onboarding
* **Trạng thái chung:** Đã hoàn thành cơ bản.
* **Ghi chú lỗi / Cải tiến cần làm:**
  - [ ] *[Ghi chú nội dung cần sửa hoặc tối ưu tại đây]*

---

### 2. Feature 2: Class Management & Group Setup
* **Trạng thái chung:** Đã hoàn thành cơ bản.
* **Ghi chú lỗi / Cải tiến cần làm:**
  - [ ] **[ENH-007] [Cấu hình Điểm cơ sở lớp học (Custom Class Base Point & Settings Modal)]**:
    - *Mô tả yêu cầu:*
      - Chuyển `basePoint` mặc định khi tạo lớp mới về `0`.
      - Bổ sung Popup / Modal Cài đặt lớp (Class Settings) cho phép giáo viên chủ nhiệm tùy chỉnh lại điểm cơ sở `basePoint` (0, 50, 100...) linh hoạt theo quy chế thi đua từng trường/lớp.
    - *Ghi chú kỹ thuật:* `ClassEntity.basePoint`, API `PUT /api/v1/classes/{classId}`, UI Component `ClassSettingsModal.tsx`.

---

### 3. Feature 3: Dynamic Profile Template & Student Dossier
* **Trạng thái chung:** Đã hoàn thành cơ bản.
* **Ghi chú lỗi / Cải tiến cần làm:**
  - [ ] *[Ghi chú nội dung cần sửa hoặc tối ưu tại đây]*

---

### 4. Feature 4: Daily Points Canvas & Scoring Engine
* **Trạng thái chung:** Đã hoàn thành cơ bản.
* **Ghi chú lỗi / Cải tiến cần làm:**
  - [ ] *[Ghi chú nội dung cần sửa hoặc tối ưu tại đây]*

---

### 5. Feature 5: Weekly Lock Cron & Leaderboard
* **Trạng thái chung:** Đã hoàn thành cơ bản.
* **Ghi chú lỗi / Cải tiến cần làm:**
  - [ ] *[Ghi chú nội dung cần sửa hoặc tối ưu tại đây]*

---

### 6. Feature 6: Real-time Analytics Dashboard & AI Insights
* **Trạng thái chung:** Đã hoàn thành giai đoạn 1 (Bảng ma trận điểm thi đua đa chiều Matrix Point Board & Inspector Drawer cho Giáo viên).
* **Ghi chú lỗi / Cải tiến cần làm:**
  - [ ] **[ENH-001] [Trợ lý AI (AI Assistant)]**: Nâng cấp và hoàn thiện tính năng Trợ lý AI nhận xét và gợi ý khen thưởng/nhắc nhở.
    - *Mô tả yêu cầu:*
      - Tích hợp AI sinh nhận xét định kỳ theo tuần / tháng dựa trên lịch sử điểm cộng/trừ và tiêu chí rèn luyện của từng học sinh.
      - Hỗ trợ các tone giọng nhận xét khác nhau (Khích lệ, Nghiêm khắc, Trung lập, Góp ý xây dựng).
      - Tối ưu UI/UX dạng Collapsible Side Tab / Drawer trên giao diện giáo viên và hỗ trợ apply trực tiếp nhận xét vào sổ theo dõi.
    - *Ghi chú kỹ thuật:* Module AI (`modules/ai`), Gemini API / OpenAI API integration, Spring Boot backend AI service.
  
  - [ ] **[ENH-002] [Các Chart View (Biểu đồ phân tích trực quan)]**: Bổ sung các chế độ xem biểu đồ (Chart Views) bên cạnh bảng ma trận số liệu.
    - *Mô tả yêu cầu:*
      - **Biểu đồ Đường (Trend Line Chart):** Theo dõi xu hướng biến động điểm số của từng học sinh hoặc từng tổ qua các tuần trong học kỳ/năm học.
      - **Biểu đồ Cột / Thanh (Bar / Column Comparison Chart):** So sánh tổng điểm thi đua giữa các tổ trong lớp để tạo không khí thi đua trực quan.
      - **Biểu đồ Phân bổ Hành vi (Donut / Pie Chart):** Thống kê tỷ lệ các nhóm hành vi vi phạm (ví dụ: Chuyên cần, Học tập, Kỷ luật, Đồng phục).
      - **Chế độ Chuyển đổi View:** Cho phép giáo viên chuyển đổi linh hoạt giữa dạng **Bảng ma trận số liệu (Table View)** và **Biểu đồ trực quan (Chart View)**.
    - *Ghi chú kỹ thuật:* Thư viện Recharts / Chart.js, React component trong `modules/class/components/charts/`.

  - [ ] **[ENH-003] [Bảng điểm thi đua cho Học sinh (Student Point Board Page)]**: Xây dựng trang Bảng điểm trung tâm trên Sidebar dành cho Học sinh / Ban cán sự tổ.
    - *Mô tả yêu cầu:*
      - Học sinh chỉ xem điểm thi đua cá nhân và điểm tổng quan của tổ mình (chế độ Read-only `canEdit = false`).
      - Ban cán sự tổ (Group Leader) có thể xem chi tiết tổ mình và tra cứu bảng xếp hạng toàn lớp.
      - Tích hợp vào Navigation Sidebar của `StudentLayout.tsx`.
    - *Ghi chú kỹ thuật:* `StudentLayout.tsx`, `StudentMatrixPointBoardPage.tsx`, RBAC matrix.

  - [ ] **[ENH-004] [Nhập nhanh hành vi/lỗi bằng văn bản thô (Raw Text Parser & Double-Check Confirmation Modal)]**: Tính năng ghi nhận điểm / lỗi siêu tốc qua văn bản tự nhiên kết hợp popup đối soát an toàn.
    - *Mô tả yêu cầu:*
      - **Luồng hoạt động (User Flow):**
        1. **Bước 1 (Nhập thô):** Người dùng dán/nhập đoạn text tự do (VD: *"Toàn ngủ gật T3, Kiên phát biểu 2 lần T4 T6 +2, Thảo quên vở T2 -2"*) và bấm *Phân tích & Kiểm tra*.
        2. **Bước 2 (Parse & Fuzzy Match):** Backend/AI tách dòng, thực hiện Fuzzy matching tên học sinh với danh sách trong Lớp/Tổ, tự điền điểm mặc định theo quy chế nếu không nhập điểm.
        3. **Bước 3 (Double-Check Modal):** Hiển thị Popup dạng bảng Editable: Tên (Dropdown khớp/cảnh báo trùng) | Hành vi | Thứ | Điểm (+/-) | Nút Xóa dòng. Người dùng có thể sửa trực tiếp hoặc xóa dòng nhận diện nhầm trước khi xác nhận.
        4. **Bước 4 (Batch Insert):** Bấm xác nhận để gọi API Batch Insert, Bảng Ma trận điểm tự động cập nhật ngay lập tức.
      - **Quy tắc xử lý (Parser & Fallback Rules):**
        - *Name Matching:* Hỗ trợ Fuzzy Search (gõ "Toàn" hoặc "danh toàn" tự khớp `Lê Danh Toàn`). Cảnh báo vàng `⚠️` và dropdown nếu ambiguous/trùng tên.
        - *Rule & Optional Points:* Có điểm gõ kèm $\rightarrow$ lấy điểm đó. Không gõ điểm $\rightarrow$ tra cứu Rule Template (vd: "Ngủ gật" = `-2đ`), nếu không có trong template thì để `0` hoặc `-1` và bôi đỏ yêu cầu người dùng nhập.
        - *Day of Week:* Nhận diện từ khóa `T2..CN`, `thứ 2..chủ nhật` $\rightarrow$ gán `dayOfWeek`. Mặc định là ngày hôm nay nếu không có.
      - **Giao diện Double-Check Modal (Wireframe):**
        ```text
        ┌────────────────────────────────────────────────────────────────────────┐
        │ ✦ XÁC NHẬN DỮ LIỆU NHẬP NHANH (4 mục phát hiện)              [ ✕ ]    │
        ├────────────────────────────────────────────────────────────────────────┤
        │ Đoạn text gốc: "Toàn ngủ gật T3, Kiên phát biểu 2 lần T4 T6 +2..."     │
        │                                                                        │
        │ ┌────────────────────────────────────────────────────────────────────┐ │
        │ │ HỌC SINH           │ HÀNH VI / LỖI      │ THỨ │ ĐIỂM (+/-) │ XÓA   │ │
        │ ├────────────────────┼────────────────────┼─────┼────────────┼───────┤ │
        │ │ [Lê Danh Toàn    ▾]│ Ngủ trong giờ      │ T3  │ [ -2 ] ✏️  │ [🗑]  │ │
        │ │ [Nguyễn Trung Kiên▾│ Phát biểu (x2)     │ T4  │ [ +2 ] ✏️  │ [🗑]  │ │
        │ │ [Đào Thị P. Thảo ▾]│ Quên vở bài tập    │ T2  │ [ -2 ] ✏️  │ [🗑]  │ │
        │ │ [⚠️ Chọn học sinh ▾]│ Làm việc riêng     │ T5  │ [ -2 ] ✏️  │ [🗑]  │ │
        │ └────────────────────────────────────────────────────────────────────┘ │
        │                                                                        │
        │ [+ Thêm dòng mới]                              Tổng điểm biến động: -4đ│
        ├────────────────────────────────────────────────────────────────────────┤
        │ [ Hủy bỏ ]                                  [ 💾 Xác nhận & Ghi điểm ] │
        └────────────────────────────────────────────────────────────────────────┘
        ```
      - **DTO thiết kế:**
        - `ParseTextInputRequest`: `{ classId, groupId?, weekNumber, rawText }`
        - `ParsedItemDTO`: `{ tempId, rawFragment, matchedStudentId?, matchedStudentName?, confidence, ruleName, type, unitPoint, quantity, dayOfWeek?, note? }`
    - *Ghi chú kỹ thuật:* Endpoint `POST /api/v1/behaviors/parse-text`, `POST /api/v1/behaviors/batch`, UI Modal component `QuickTextScoringModal.tsx`, Fuzzy match regex/NLP service.

  - [x] **[ENH-005] [Tối ưu giao diện Bảng ma trận điểm (Matrix Point Board UI - Ver 1)]**: Tính năng kéo thả tùy chỉnh độ rộng cột tên học sinh (rút gọn lũy tiến & xử lý trùng tên) và hiển thị tinh gọn chức vụ Tổ trưởng / Ban cán sự.
    - *Mô tả yêu cầu:*
      - **1. Kéo thả tùy chỉnh độ rộng & Rút gọn tên học sinh lũy tiến (Resizable Column & Progressive Name Shortening):**
        - Bổ sung thanh kéo điều chỉnh độ rộng cột (*Column Resizer handle*).
        - Khi kéo thu hẹp độ rộng cột, thuật toán hiển thị tên sẽ tự động rút gọn tên theo từng cấp độ linh hoạt:
          - *Cấp 1 (Đầy đủ):* `Nguyễn Văn Đức Anh`
          - *Cấp 2 (Bỏ họ / Viết tắt họ):* `Văn Đức Anh` hoặc `N. V. Đức Anh`
          - *Cấp 3 (Bỏ chữ đệm):* `Đức Anh` hoặc `V. Đ. Anh`
          - *Cấp 4 (Chỉ lấy tên chính):* `Anh`
        - **Giải pháp xử lý trùng tên (Name Collision Disambiguation - Context Tổ):**
          - Hệ thống tự động quét và nhận diện các học sinh trùng tên **trong phạm vi từng Tổ (Group context)** (Ví dụ: trong Tổ 1 có `Nguyễn Tuấn Anh` và `Trần Đức Anh`).
          - Khi cột bị thu hẹp tối đa, hệ thống **bắt buộc giữ lại chữ cái phân biệt** của họ/đệm (Ví dụ: `T. Anh` & `Đ. Anh` hoặc `Tuấn Anh` & `Đức Anh`), tuyệt đối không rút gọn về cùng một chữ `Anh` đơn lẻ gây nhầm lẫn khi chấm điểm. Nếu 2 học sinh ở 2 tổ khác nhau trùng tên nhưng trong tổ không trùng thì vẫn rút gọn tối đa bình thường.
          - Tooltip thông minh: Hover chuột vào tên luôn hiển thị đầy đủ `[Họ và tên đầy đủ] • Mã HS • [Chức vụ nếu có]`.
      - **2. Hiển thị Tổ trưởng & Ban cán sự tinh giản (Ultra-Compact Role & Leader Indicator):**
        - *Thiết kế tinh gọn:* Đổi màu nhẹ (Subtle tint/border) ở ô học sinh hoặc thêm icon nhỏ gọn (`👑` hoặc mini badge tinh tế `Trưởng`) ngay cạnh avatar/tên học sinh mà không làm tốn diện tích hay vỡ layout.
        - *Tính sẵn sàng mở rộng (Future Extensibility):* Kiến trúc thiết kế sẵn sàng mở rộng thêm các vai trò Ban cán sự lớp trong tương lai (Lớp trưởng, Lớp phó học tập, Lớp phó lao động, Bí thư chi đoàn, Tổ phó...).
        - *Tại hàng Tổ (`MatrixGroupRow`):* Hiển thị vắn tắt `Tổ 1 • 👑 [Tên rút gọn của Tổ trưởng]`.
    - *Ghi chú kỹ thuật:*
      - Backend DTO: Bổ sung `leaderStudentId`, `leaderName` vào `GroupMatrixDTO` và trường chức vụ `roles?: string[]` (hoặc `isLeader: boolean`) vào `StudentMatrixDTO`.
      - Frontend State & Utils: Hook quản lý kéo thả `useColumnResize`, helper hàm format tên thông minh `formatProgressiveStudentName(fullName, availableWidth, duplicateNameSet)`, cập nhật [MatrixTableHeader.tsx](file:///d:/Data/Personal/JOBS/ME/class-manager-v2/frontend/src/modules/class/components/matrix/MatrixTableHeader.tsx), [MatrixGroupRow.tsx](file:///d:/Data/Personal/JOBS/ME/class-manager-v2/frontend/src/modules/class/components/matrix/MatrixGroupRow.tsx), [MatrixStudentRow.tsx](file:///d:/Data/Personal/JOBS/ME/class-manager-v2/frontend/src/modules/class/components/matrix/MatrixStudentRow.tsx).

  - [x] **[ENH-006] [Tab Tuần chi tiết (Weekly Focus View - Bảng theo dõi & Kiểm toán tác nghiệp theo tuần)]**: Chế độ xem chi tiết từng tuần phục vụ đọc text hành vi, đối soát lỗi và chỉnh sửa/chốt điểm nhanh.
    - *Mô tả yêu cầu:*
      - **1. Bảng Grid cố định 1 tuần (Weekly Focus Table Grid):**
        - Cột 1: `STT & Học sinh` (200px Sticky, kế thừa Resizer & Avatar chức vụ).
        - Cột 2: `Chi tiết ghi nhận (Hành vi/Lỗi)` (Flex-1 rộng nhất, hiển thị Chip vi phạm/khen thưởng).
        - Cột 3: `Điểm cộng (+)` (80px, tổng điểm thưởng tuần, text-emerald-600).
        - Cột 4: `Điểm trừ (-)` (80px, tổng điểm phạt tuần, text-rose-600).
        - Cột 5: `Tổng kết (Net)` (90px, Net Score tuần với badge màu nổi bật).
        - Cột 6: `Thao tác` (70px, nút mở Inspector Drawer `[ ✏️ ]` và Inline Quick Add `[+]`).
      - **2. Cơ chế Clamp & Expand thông minh:**
        - Mặc định: Hiển thị tối đa 2 mục đầu tiên kèm badge `[+X mục khác...]`.
        - Cấp độ dòng (Accordion): Bấm vào badge hoặc đúp chuột để bung mở danh sách chi tiết của riêng học sinh đó.
        - Cấp độ toàn bảng (Global Toggle): Nút gạt `[Thu gọn]` $\leftrightarrow$ `[Mở toàn bộ]` trên thanh công cụ để xem toàn bộ danh sách như file Excel.
      - **3. In-context Editing 2 cấp độ:**
        - Thao tác nhanh (1 chạm): Inline Popover thêm nhanh lỗi/điểm ngay tại dòng (`[Chọn mẫu lỗi ▾] [Thứ ▾] [Lưu]`).
        - Thao tác sâu: Inspector Drawer trượt ra từ bên phải để xem timeline, sửa điểm, xóa log (có Audit log).
    - *Ghi chú kỹ thuật:* Endpoint `GET /api/v1/matrix/weekly-focus?classId={id}&weekNumber={w}`, Component `WeeklyFocusTable.tsx`, `WeeklyBehaviorChips.tsx`, `InlineQuickScoringPopover.tsx`.

---

## 🔍 Chi Tiết Backlog Theo Từng Feature

### 1. Feature 1: Authentication & Onboarding
* **Trạng thái chung:** Đã hoàn thành cơ bản.
* **Ghi chú lỗi / Cải tiến cần làm:**
  - [ ] *[Ghi chú nội dung cần sửa hoặc tối ưu tại đây]*

---

### 2. Feature 2: Class Management & Group Setup
* **Trạng thái chung:** Đã hoàn thành cơ bản.
* **Ghi chú lỗi / Cải tiến cần làm:**
  - [ ] *[Ghi chú nội dung cần sửa hoặc tối ưu tại đây]*

---

### 3. Feature 3: Dynamic Profile Template & Student Dossier
* **Trạng thái chung:** Đã hoàn thành cơ bản.
* **Ghi chú lỗi / Cải tiến cần làm:**
  - [ ] *[Ghi chú nội dung cần sửa hoặc tối ưu tại đây]*

---

### 4. Feature 4: Daily Points Canvas & Scoring Engine
* **Trạng thái chung:** Đã hoàn thành cơ bản.
* **Ghi chú lỗi / Cải tiến cần làm:**
  - [ ] *[Ghi chú nội dung cần sửa hoặc tối ưu tại đây]*

---

### 5. Feature 5: Weekly Lock Cron & Leaderboard
* **Trạng thái chung:** Đã hoàn thành cơ bản.
* **Ghi chú lỗi / Cải tiến cần làm:**
  - [ ] *[Ghi chú nội dung cần sửa hoặc tối ưu tại đây]*

---

### 6. Feature 6: Real-time Analytics Dashboard & AI Insights
* **Trạng thái chung:** Đã hoàn thành giai đoạn 1 (Bảng ma trận điểm thi đua đa chiều Matrix Point Board & Inspector Drawer cho Giáo viên).
* **Ghi chú lỗi / Cải tiến cần làm:**
  - [ ] **[ENH-001] [Trợ lý AI (AI Assistant)]**: Nâng cấp và hoàn thiện tính năng Trợ lý AI nhận xét và gợi ý khen thưởng/nhắc nhở.
    - *Mô tả yêu cầu:*
      - Tích hợp AI sinh nhận xét định kỳ theo tuần / tháng dựa trên lịch sử điểm cộng/trừ và tiêu chí rèn luyện của từng học sinh.
      - Hỗ trợ các tone giọng nhận xét khác nhau (Khích lệ, Nghiêm khắc, Trung lập, Góp ý xây dựng).
      - Tối ưu UI/UX dạng Collapsible Side Tab / Drawer trên giao diện giáo viên và hỗ trợ apply trực tiếp nhận xét vào sổ theo dõi.
    - *Ghi chú kỹ thuật:* Module AI (`modules/ai`), Gemini API / OpenAI API integration, Spring Boot backend AI service.
  
  - [ ] **[ENH-002] [Các Chart View (Biểu đồ phân tích trực quan)]**: Bổ sung các chế độ xem biểu đồ (Chart Views) bên cạnh bảng ma trận số liệu.
    - *Mô tả yêu cầu:*
      - **Biểu đồ Đường (Trend Line Chart):** Theo dõi xu hướng biến động điểm số của từng học sinh hoặc từng tổ qua các tuần trong học kỳ/năm học.
      - **Biểu đồ Cột / Thanh (Bar / Column Comparison Chart):** So sánh tổng điểm thi đua giữa các tổ trong lớp để tạo không khí thi đua trực quan.
      - **Biểu đồ Phân bổ Hành vi (Donut / Pie Chart):** Thống kê tỷ lệ các nhóm hành vi vi phạm (ví dụ: Chuyên cần, Học tập, Kỷ luật, Đồng phục).
      - **Chế độ Chuyển đổi View:** Cho phép giáo viên chuyển đổi linh hoạt giữa dạng **Bảng ma trận số liệu (Table View)** và **Biểu đồ trực quan (Chart View)**.
    - *Ghi chú kỹ thuật:* Thư viện Recharts / Chart.js, React component trong `modules/class/components/charts/`.

  - [ ] **[ENH-003] [Bảng điểm thi đua cho Học sinh (Student Point Board Page)]**: Xây dựng trang Bảng điểm trung tâm trên Sidebar dành cho Học sinh / Ban cán sự tổ.
    - *Mô tả yêu cầu:*
      - Học sinh chỉ xem điểm thi đua cá nhân và điểm tổng quan của tổ mình (chế độ Read-only `canEdit = false`).
      - Ban cán sự tổ (Group Leader) có thể xem chi tiết tổ mình và tra cứu bảng xếp hạng toàn lớp.
      - Tích hợp vào Navigation Sidebar của `StudentLayout.tsx`.
    - *Ghi chú kỹ thuật:* `StudentLayout.tsx`, `StudentMatrixPointBoardPage.tsx`, RBAC matrix.

  - [ ] **[ENH-004] [Nhập nhanh hành vi/lỗi bằng văn bản thô (Raw Text Parser & Double-Check Confirmation Modal)]**: Tính năng ghi nhận điểm / lỗi siêu tốc qua văn bản tự nhiên kết hợp popup đối soát an toàn.
    - *Mô tả yêu cầu:*
      - **Luồng hoạt động (User Flow):**
        1. **Bước 1 (Nhập thô):** Người dùng dán/nhập đoạn text tự do (VD: *"Toàn ngủ gật T3, Kiên phát biểu 2 lần T4 T6 +2, Thảo quên vở T2 -2"*) và bấm *Phân tích & Kiểm tra*.
        2. **Bước 2 (Parse & Fuzzy Match):** Backend/AI tách dòng, thực hiện Fuzzy matching tên học sinh với danh sách trong Lớp/Tổ, tự điền điểm mặc định theo quy chế nếu không nhập điểm.
        3. **Bước 3 (Double-Check Modal):** Hiển thị Popup dạng bảng Editable: Tên (Dropdown khớp/cảnh báo trùng) | Hành vi | Thứ | Điểm (+/-) | Nút Xóa dòng. Người dùng có thể sửa trực tiếp hoặc xóa dòng nhận diện nhầm trước khi xác nhận.
        4. **Bước 4 (Batch Insert):** Bấm xác nhận để gọi API Batch Insert, Bảng Ma trận điểm tự động cập nhật ngay lập tức.
      - **Quy tắc xử lý (Parser & Fallback Rules):**
        - *Name Matching:* Hỗ trợ Fuzzy Search (gõ "Toàn" hoặc "danh toàn" tự khớp `Lê Danh Toàn`). Cảnh báo vàng `⚠️` và dropdown nếu ambiguous/trùng tên.
        - *Rule & Optional Points:* Có điểm gõ kèm $\rightarrow$ lấy điểm đó. Không gõ điểm $\rightarrow$ tra cứu Rule Template (vd: "Ngủ gật" = `-2đ`), nếu không có trong template thì để `0` hoặc `-1` và bôi đỏ yêu cầu người dùng nhập.
        - *Day of Week:* Nhận diện từ khóa `T2..CN`, `thứ 2..chủ nhật` $\rightarrow$ gán `dayOfWeek`. Mặc định là ngày hôm nay nếu không có.
      - **Giao diện Double-Check Modal (Wireframe):**
        ```text
        ┌────────────────────────────────────────────────────────────────────────┐
        │ ✦ XÁC NHẬN DỮ LIỆU NHẬP NHANH (4 mục phát hiện)              [ ✕ ]    │
        ├────────────────────────────────────────────────────────────────────────┤
        │ Đoạn text gốc: "Toàn ngủ gật T3, Kiên phát biểu 2 lần T4 T6 +2..."     │
        │                                                                        │
        │ ┌────────────────────────────────────────────────────────────────────┐ │
        │ │ HỌC SINH           │ HÀNH VI / LỖI      │ THỨ │ ĐIỂM (+/-) │ XÓA   │ │
        │ ├────────────────────┼────────────────────┼─────┼────────────┼───────┤ │
        │ │ [Lê Danh Toàn    ▾]│ Ngủ trong giờ      │ T3  │ [ -2 ] ✏️  │ [🗑]  │ │
        │ │ [Nguyễn Trung Kiên▾│ Phát biểu (x2)     │ T4  │ [ +2 ] ✏️  │ [🗑]  │ │
        │ │ [Đào Thị P. Thảo ▾]│ Quên vở bài tập    │ T2  │ [ -2 ] ✏️  │ [🗑]  │ │
        │ │ [⚠️ Chọn học sinh ▾]│ Làm việc riêng     │ T5  │ [ -2 ] ✏️  │ [🗑]  │ │
        │ └────────────────────────────────────────────────────────────────────┘ │
        │                                                                        │
        │ [+ Thêm dòng mới]                              Tổng điểm biến động: -4đ│
        ├────────────────────────────────────────────────────────────────────────┤
        │ [ Hủy bỏ ]                                  [ 💾 Xác nhận & Ghi điểm ] │
        └────────────────────────────────────────────────────────────────────────┘
        ```
      - **DTO thiết kế:**
        - `ParseTextInputRequest`: `{ classId, groupId?, weekNumber, rawText }`
        - `ParsedItemDTO`: `{ tempId, rawFragment, matchedStudentId?, matchedStudentName?, confidence, ruleName, type, unitPoint, quantity, dayOfWeek?, note? }`
    - *Ghi chú kỹ thuật:* Endpoint `POST /api/v1/behaviors/parse-text`, `POST /api/v1/behaviors/batch`, UI Modal component `QuickTextScoringModal.tsx`, Fuzzy match regex/NLP service.

  - [x] **[ENH-005] [Tối ưu giao diện Bảng ma trận điểm (Matrix Point Board UI - Ver 1)]**: Tính năng kéo thả tùy chỉnh độ rộng cột tên học sinh (rút gọn lũy tiến & xử lý trùng tên) và hiển thị tinh gọn chức vụ Tổ trưởng / Ban cán sự.
    - *Mô tả yêu cầu:*
      - **1. Kéo thả tùy chỉnh độ rộng & Rút gọn tên học sinh lũy tiến (Resizable Column & Progressive Name Shortening):**
        - Bổ sung thanh kéo điều chỉnh độ rộng cột (*Column Resizer handle*).
        - Khi kéo thu hẹp độ rộng cột, thuật toán hiển thị tên sẽ tự động rút gọn tên theo từng cấp độ linh hoạt:
          - *Cấp 1 (Đầy đủ):* `Nguyễn Văn Đức Anh`
          - *Cấp 2 (Bỏ họ / Viết tắt họ):* `Văn Đức Anh` hoặc `N. V. Đức Anh`
          - *Cấp 3 (Bỏ chữ đệm):* `Đức Anh` hoặc `V. Đ. Anh`
          - *Cấp 4 (Chỉ lấy tên chính):* `Anh`
        - **Giải pháp xử lý trùng tên (Name Collision Disambiguation - Context Tổ):**
          - Hệ thống tự động quét và nhận diện các học sinh trùng tên **trong phạm vi từng Tổ (Group context)** (Ví dụ: trong Tổ 1 có `Nguyễn Tuấn Anh` và `Trần Đức Anh`).
          - Khi cột bị thu hẹp tối đa, hệ thống **bắt buộc giữ lại chữ cái phân biệt** của họ/đệm (Ví dụ: `T. Anh` & `Đ. Anh` hoặc `Tuấn Anh` & `Đức Anh`), tuyệt đối không rút gọn về cùng một chữ `Anh` đơn lẻ gây nhầm lẫn khi chấm điểm. Nếu 2 học sinh ở 2 tổ khác nhau trùng tên nhưng trong tổ không trùng thì vẫn rút gọn tối đa bình thường.
          - Tooltip thông minh: Hover chuột vào tên luôn hiển thị đầy đủ `[Họ và tên đầy đủ] • Mã HS • [Chức vụ nếu có]`.
      - **2. Hiển thị Tổ trưởng & Ban cán sự tinh giản (Ultra-Compact Role & Leader Indicator):**
        - *Thiết kế tinh gọn:* Đổi màu nhẹ (Subtle tint/border) ở ô học sinh hoặc thêm icon nhỏ gọn (`👑` hoặc mini badge tinh tế `Trưởng`) ngay cạnh avatar/tên học sinh mà không làm tốn diện tích hay vỡ layout.
        - *Tính sẵn sàng mở rộng (Future Extensibility):* Kiến trúc thiết kế sẵn sàng mở rộng thêm các vai trò Ban cán sự lớp trong tương lai (Lớp trưởng, Lớp phó học tập, Lớp phó lao động, Bí thư chi đoàn, Tổ phó...).
        - *Tại hàng Tổ (`MatrixGroupRow`):* Hiển thị vắn tắt `Tổ 1 • 👑 [Tên rút gọn của Tổ trưởng]`.
    - *Ghi chú kỹ thuật:*
      - Backend DTO: Bổ sung `leaderStudentId`, `leaderName` vào `GroupMatrixDTO` và trường chức vụ `roles?: string[]` (hoặc `isLeader: boolean`) vào `StudentMatrixDTO`.
      - Frontend State & Utils: Hook quản lý kéo thả `useColumnResize`, helper hàm format tên thông minh `formatProgressiveStudentName(fullName, availableWidth, duplicateNameSet)`, cập nhật [MatrixTableHeader.tsx](file:///d:/Data/Personal/JOBS/ME/class-manager-v2/frontend/src/modules/class/components/matrix/MatrixTableHeader.tsx), [MatrixGroupRow.tsx](file:///d:/Data/Personal/JOBS/ME/class-manager-v2/frontend/src/modules/class/components/matrix/MatrixGroupRow.tsx), [MatrixStudentRow.tsx](file:///d:/Data/Personal/JOBS/ME/class-manager-v2/frontend/src/modules/class/components/matrix/MatrixStudentRow.tsx).

---

### 7. Feature 7: System Admin & Support Monitoring Center
* **Trạng thái chung:** Đã triển khai xong Backend & Frontend (đã đồng bộ Light Theme UI).
* **Ghi chú lỗi / Cải tiến cần làm:**
  - [ ] **[BUG-001] [View-As Mode]**: Tính năng quan sát tài khoản người dùng dưới chế độ chỉ đọc (Read-only) đang gặp lỗi khi kích hoạt hoặc chuyển đổi phiên.
    - *Hiện tượng:* Admin kích hoạt phiên View-As cho tài khoản mục tiêu nhưng gặp lỗi hoạt động/điều hướng hoặc cơ chế token Read-Only.
    - *Kỳ vọng:* Admin sinh được token tạm với `readOnly: true`, chuyển sang giao diện của Teacher/Student để kiểm tra và có thể thoát chế độ xem quay về Admin Dashboard an toàn.
    - *Ghi chú kỹ thuật:* Endpoint `POST /api/v1/admin/view-as/{userId}`, [JwtUtil.java](file:///d:/Data/Personal/JOBS/ME/class-manager-v2/backend/src/main/java/com/classmanager/security/JwtUtil.java), [UserInspectorPage.tsx](file:///d:/Data/Personal/JOBS/ME/class-manager-v2/frontend/src/modules/admin/pages/UserInspectorPage.tsx), [AdminLayout.tsx](file:///d:/Data/Personal/JOBS/ME/class-manager-v2/frontend/src/modules/admin/components/AdminLayout.tsx).

---

### 8. Feature 8: Dedicated Audit Logging & Compliance System
* **Trạng thái chung:** Đã có tài liệu đặc tả ([docs/feature8.md](file:///d:/Data/Personal/JOBS/ME/class-manager-v2/docs/feature8.md)), chuẩn bị thực hiện.
* **Ghi chú lỗi / Cải tiến cần làm:**
  - [ ] *[Ghi chú nội dung cần sửa hoặc tối ưu tại đây]*

---

## 💡 Hướng dẫn định dạng ghi chú lỗi:

Khi thêm lỗi mới, bạn có thể ghi ngắn gọn theo mẫu sau:

```markdown
- [ ] **[Mã ID]** [Tên chức năng / Màn hình]: Mô tả hiện tượng lỗi
  - *Hiện tượng:* Chi tiết lỗi xảy ra khi thực hiện hành động gì
  - *Kỳ vọng:* Kết quả mong muốn đúng theo nghiệp vụ
  - *Ghi chú kỹ thuật (nếu có):* Endpoint, file component liên quan
```
