<!--
Chức năng: Báo cáo tính năng xây dựng cấu trúc 12 Mongoose Models nghiệp vụ cho hệ thống mượn sách.
Lý do tạo: Tuân thủ quy định ghi báo cáo tính năng vào thư mục report/ theo quy tắc workspace AGENTS.md.
Link trích dẫn tham khảo: https://mongoosejs.com/
-->

# Báo Cáo: Xây Dựng 12 Mongoose Models Nghiệp Vụ & Cấu Hình Kết Nối MongoDB

## 1. Tên Tính Năng & Mô Tả
- **Mục đích**: Triển khai toàn bộ mô hình dữ liệu (Database Schema) gồm 12 collections nghiệp vụ bằng Mongoose, làm nền tảng lưu trữ và xử lý logic cho Hệ thống Mượn Sách Online.
- **Chi tiết**: Các schema được xây dựng tuân thủ 100% đặc tả thiết kế trong `document/database_schema.md`, bao gồm các ràng buộc kiểu dữ liệu, các validator (validate Email, số điện thoại Việt Nam, ngày hẹn trả...), và các trường phục vụ soft delete.

---

## 2. Các Tệp Đã Tạo Mới / Thay Đổi
Tất cả các tệp nguồn được triển khai trong thư mục [backend/src](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src):
- [config/database.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/config/database.js): Cấu hình kết nối cơ sở dữ liệu MongoDB thông qua Mongoose.
- **Thư mục models** [models/](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/models):
  - [index.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/models/index.js): File xuất khẩu tập trung (Entry Point).
  - [publisher.model.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/models/publisher.model.js)
  - [author.model.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/models/author.model.js)
  - [category.model.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/models/category.model.js)
  - [bookTitle.model.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/models/bookTitle.model.js)
  - [bookCopy.model.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/models/bookCopy.model.js)
  - [reader.model.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/models/reader.model.js)
  - [staff.model.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/models/staff.model.js)
  - [membershipPlan.model.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/models/membershipPlan.model.js)
  - [subscription.model.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/models/subscription.model.js)
  - [borrowReceipt.model.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/models/borrowReceipt.model.js)
  - [penaltyTicket.model.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/models/penaltyTicket.model.js)
  - [discountCode.model.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/models/discountCode.model.js)
- [app.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/app.js): Khởi tạo Express app mockup phục vụ kiểm tra cấu trúc.

---

## 3. Chi Tiết Triển Khai
- **Ràng buộc Mongoose**:
  - `Reader.email`: Tích hợp Regex kiểm tra tính hợp lệ của email (hỗ trợ cả phần mở rộng dài như `.local`, `.online`).
  - `Reader.dienThoai` & `Publisher.soDienThoai`: Tích hợp Regex chuẩn số điện thoại Việt Nam (10 số, bắt đầu bằng các đầu số 03, 05, 07, 08, 09).
  - `BookTitle.tacGia`: Validator đảm bảo một đầu sách phải liên kết với ít nhất một tác giả.
  - `BorrowReceipt.chiTietMuon`: Đảm bảo một phiếu mượn phải mượn tối thiểu 1 cuốn sách vật lý.
  - `BorrowReceipt.ngayHenTra`: Đảm bảo hạn trả không được trước ngày mượn.
  - `Subscription.ngayKetThuc`: Đảm bảo ngày hết hạn gói thẻ phải sau ngày đăng ký.
- **Tập trung hóa (Modularization)**: file `models/index.js` đóng vai trò cổng ra duy nhất để quản lý import/export gọn gàng hơn.

---

## 4. Hướng Dẫn Kiểm Tra & Lệnh Xác Minh
1. Chạy xác minh cấu trúc backend bằng command:
   ```bash
   cd backend
   npm run verify
   ```
2. Kết quả mong đợi trong terminal:
   ```text
   Backend structure verification passed.
   ```
