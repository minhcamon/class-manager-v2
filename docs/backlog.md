# ClassManager — Project Backlog & Bug Tracking

Tài liệu này dùng để ghi nhận, phân loại và theo dõi các lỗi (bugs), thiếu sót logic, hoặc các cải tiến (enhancements) phát sinh trong quá trình kiểm thử các feature để xử lý sau.

---

## 📌 Bảng Tổng Quan Trạng Thái

| ID | Feature | Mô tả vấn đề / Yêu cầu | Loại | Mức độ | Trạng thái | Ngày ghi nhận |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `BUG-001` | Feature 7 | Lỗi tính năng Quan sát tài khoản (View-As Mode) | Logic / Auth | High | `OPEN` | 2026-08-18 |

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
* **Trạng thái chung:** Đã hoàn thành cơ bản.
* **Ghi chú lỗi / Cải tiến cần làm:**
  - [ ] *[Ghi chú nội dung cần sửa hoặc tối ưu tại đây]*

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
- [ ] **[Mã lỗi]** [Tên chức năng / Màn hình]: Mô tả hiện tượng lỗi
  - *Hiện tượng:* Chi tiết lỗi xảy ra khi thực hiện hành động gì
  - *Kỳ vọng:* Kết quả mong muốn đúng theo nghiệp vụ
  - *Ghi chú kỹ thuật (nếu có):* Endpoint, file component liên quan
```
