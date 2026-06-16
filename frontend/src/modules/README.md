# Modules Folder

Thư mục này chứa các module tính năng độc lập của hệ thống ClassManager (Ví dụ: `auth`, `dashboard`, `points`, `students`, v.v.).

Mỗi module sẽ tuân thủ cấu trúc thư mục sau:
- `components/`: Các Component chỉ dùng riêng trong module này.
- `pages/`: Các trang hoàn chỉnh thuộc module.
- `index.ts`: Điểm xuất khẩu (export) duy nhất các page/component chính của module.
