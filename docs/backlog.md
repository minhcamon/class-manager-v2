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
