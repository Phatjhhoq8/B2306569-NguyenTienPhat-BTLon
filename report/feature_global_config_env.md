<!--
Chức năng: Báo cáo tính năng tích hợp biến môi trường .env và cấu hình tập trung cho backend.
Lý do tạo: Tuân thủ quy định ghi báo cáo tính năng vào thư mục report/ theo quy tắc workspace AGENTS.md.
-->

# Báo Cáo: Tích Hợp Biến Môi Trường (.env) & Cấu Hình Tập Trung (Global Config)

## 1. Tên Tính Năng & Mô Tả
- **Mục đích**: Chuyển các thông số cấu hình lặp lại nhiều nơi (như chuỗi kết nối MongoDB, cổng ứng dụng, JWT secret, số lượng sách mẫu mặc định, vị trí kệ mặc định) vào tệp cấu hình tập trung và quản lý thông qua biến môi trường.
- **Chi tiết**: Nạp biến môi trường từ tệp `.env` thông qua thư viện `dotenv`, tập hợp cấu hình tại một điểm duy nhất giúp dễ dàng kiểm soát và chuyển đổi cấu hình giữa các môi trường chạy ứng dụng (development, production, test).

---

## 2. Các Tệp Đã Tạo Mới / Thay Đổi

### Tạo mới:
- [backend/.env](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/.env): Lưu trữ giá trị thực tế của các biến cấu hình cục bộ.
- [backend/.env.example](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/.env.example): Tệp mẫu hướng dẫn cấu hình môi trường.
- [backend/src/config/index.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/config/index.js): Điểm nạp `dotenv` và export cấu hình tập trung.

### Thay đổi:
- [backend/src/config/database.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/config/database.js): Sử dụng chuỗi kết nối từ `config.db.uri`.
- [backend/src/services/bookService.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/services/bookService.js): Sử dụng vị trí kệ mặc định từ `config.app.defaultShelfLocation`.
- [backend/src/scripts/seedFromScrapedBooks.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/scripts/seedFromScrapedBooks.js): Sử dụng số lượng bản sao mặc định từ `config.app.defaultBookCopiesCount` thay vì hardcode.

---

## 3. Hướng Dẫn Kiểm Tra & Lệnh Xác Minh
1. Chạy unit tests:
   ```bash
   cd backend
   npm test
   ```
2. Chạy Seeding nạp dữ liệu:
   ```bash
   cd backend
   npm run seed
   ```
   *Kết quả thực tế cho thấy các scripts kiểm thử và seed đều đọc thành công cấu hình tập trung và kết nối MongoDB cục bộ suôn sẻ.*
