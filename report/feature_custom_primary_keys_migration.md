<!--
Chức năng: Báo cáo tính năng chuyển đổi khóa chính sang mã tự định nghĩa dạng chuỗi (String) cho toàn bộ các model.
Lý do tạo: Tuân thủ quy định ghi báo cáo tính năng vào thư mục report/ theo quy tắc workspace AGENTS.md.
Link trích dẫn tham khảo: https://mongoosejs.com/docs/guide.html#_id
-->

# Báo Cáo: Chuyển Đổi Khóa Chính Sang Mã Tự Định Nghĩa (Custom String Primary Keys)

## 1. Tên Tính Năng & Mô Tả
- **Mục đích**: Thay đổi thiết kế cơ sở dữ liệu để sử dụng trực tiếp các trường mã tùy chỉnh tự sinh (ví dụ: `maDangKy`, `maSach`, `maDauSach`, `maDocGia`...) làm khóa chính (`_id`) kiểu `String` thay vì dùng `ObjectId` mặc định trong MongoDB/Mongoose.
- **Chi tiết**: 
  - Khóa chính `_id` của 12 models chính được cấu hình thành kiểu `String`.
  - Trong các hook `pre('validate')`, hệ thống tự sinh mã từ `codeService` và đồng thời gán vào `_id` và các trường mã cũ để duy trì khả năng tương thích ngược tối đa.
  - Các trường liên kết (ref) ở các model tham chiếu cũng được chuyển đổi kiểu dữ liệu sang `String` để hỗ trợ populate hoạt động bình thường.
  - Cập nhật helper `isValidObjectId` để tương thích tốt với mã ID chuỗi mới có tiền tố quy chuẩn (ví dụ `DS`, `BS`, `DG`...).

---

## 2. Các Tệp Đã Thay Đổi
Tập tin nguồn được triển khai trong thư mục [backend/src](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src):
- **Cập nhật các Schema trong thư mục models** [models/](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/models):
  - [author.model.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/models/author.model.js)
  - [publisher.model.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/models/publisher.model.js)
  - [category.model.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/models/category.model.js)
  - [membershipPlan.model.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/models/membershipPlan.model.js)
  - [discountCode.model.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/models/discountCode.model.js)
  - [reader.model.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/models/reader.model.js)
  - [staff.model.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/models/staff.model.js)
  - [bookTitle.model.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/models/bookTitle.model.js)
  - [bookCopy.model.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/models/bookCopy.model.js)
  - [subscription.model.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/models/subscription.model.js)
  - [borrowReceipt.model.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/models/borrowReceipt.model.js)
  - [penaltyTicket.model.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/models/penaltyTicket.model.js)
- **Cập nhật Service**:
  - [services/bookService.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/services/bookService.js)

---

## 3. Chi Tiết Triển Khai
- **Trùng khớp trường mã & `_id`**: Hook `pre('validate')` tự động gán `_id = code` và `trường_mã = code` khi tạo mới bản ghi, đảm bảo cả 2 cách lấy thông tin qua `_id` hoặc tên trường cũ đều cho ra cùng một chuỗi mã.
- **Ràng buộc ngoại khóa kiểu String**: Do các model được tham chiếu sử dụng String làm khóa chính nên tất cả các liên kết Schema `ref` cũng được khai báo kiểu dữ liệu `String` thay vì `ObjectId` để duy trì tính toàn vẹn dữ liệu.
- **Helper isValidObjectId**: Hàm này giờ đây chấp nhận cả chuỗi ID mặc định 24 ký tự và chuỗi mã tự sinh dựa trên định dạng regex tiền tố: `/^(NXB|TG|TL|DS|BS|DG|NV|GOI|DK|PM|PP|KM\d{6})\d+$/`.

---

## 4. Hướng Dẫn Kiểm Tra & Lệnh Xác Minh
1. Truy cập vào thư mục `backend`:
   ```bash
   cd backend
   ```
2. Chạy bộ kiểm thử tự động (test suite) tích hợp để kiểm định:
   ```bash
   npm run test
   ```
3. Kết quả mong đợi trong terminal:
   - Tất cả 19 ca kiểm thử từ Concurrency, Triggers, Validation đến Cascades đều vượt qua thành công:
   ```text
   # tests 19
   # suites 1
   # pass 19
   # fail 0
   ```
