<!--
Chức năng: Báo cáo tính năng sinh mã tự tăng nguyên tử và an toàn đồng thời (concurrency-safe) cùng kết quả kiểm thử.
Lý do tạo: Tuân thủ quy định ghi báo cáo tính năng vào thư mục report/ theo quy tắc workspace AGENTS.md.
-->

# Báo Cáo: Sinh Mã Định Dạng Tự Động & An Toàn Đồng Thời (Concurrency-Safe)

## 1. Tên Tính Năng & Mô Tả
- **Mục đích**: Giải quyết triệt để vấn đề trùng lặp mã khóa chính (unique key) khi nhiều request đồng thời thực hiện thao tác thêm dữ liệu mới (độc giả đăng ký, lập phiếu mượn, nhập sách...) vào hệ thống.
- **Giải pháp**: Xây dựng Counter Service nguyên tử (atomic updates) dựa trên collection `counters` của MongoDB và Mongoose `findOneAndUpdate` kết hợp toán tử `$inc`, kết hợp với quy trình phát triển kiểm thử trước (Test-First/TDD).

---

## 2. Các Tệp Đã Tạo Mới / Thay Đổi
- [models/counter.model.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/models/counter.model.js): Model lưu trữ sequence tự tăng của các thực thể.
- [services/codeService.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/services/codeService.js): Cung cấp hàm sinh mã định dạng quy chuẩn tự động (`nextCode`).
- [services/bookService.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/services/bookService.js): Triển khai tạo đầu sách và tự sinh bản sao vật lý an toàn.
- [tests/concurrency.test.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/tests/concurrency.test.js): Kịch bản kiểm thử đồng thời (100 request cùng lúc) áp dụng TDD.
- [scripts/seedFromScrapedBooks.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/scripts/seedFromScrapedBooks.js): Đồng bộ hoá đường dẫn import để seed thành công 100 sách mẫu.

---

## 3. Cơ Chế Xử Lý Đồng Thời Tránh Xung Đột
Hàm `nextCode` trong [codeService.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/services/codeService.js) thực hiện cập nhật nguyên tử trên MongoDB:
```javascript
const counter = await Counter.findOneAndUpdate(
  { _id: entityName },
  { $inc: { seq: 1 } },
  { new: true, upsert: true }
);
```
MongoDB sẽ tự động lock ở mức document `_id` của counter đó, đảm bảo các luồng request đồng thời sẽ nhận được giá trị `seq` xếp hàng tuần tự tăng dần. Mã định danh trả về sau đó được format đúng độ dài quy định (ví dụ: `DG` + 5 chữ số thành `DG00001`).

---

## 4. Kết Quả Kiểm Thử (Verification Results)

### 4.1. Unit Test Concurrency (100 request đồng thời)
- **Lệnh chạy**:
  ```bash
  cd backend
  npm test
  ```
- **Kết quả thực tế**:
  *   **Test 1 (Sinh mã đơn lẻ)**: PASSED (Mã sinh ra đúng format `NXB001`, `TG0001`, `DG00001`).
  *   **Test 2 (Concurrency - 100 Request)**: PASSED. Tạo ra 100 mã độc giả duy nhất đồng thời không có bất kỳ phần tử nào bị trùng, sequence trong DB đạt chính xác `101`.
  *   **Test 3 (Tạo đầu sách & bản sao vật lý)**: PASSED. Tạo thành công đầu sách và tự động tạo 5 bản sao vật lý `BSxxxxxx` ở kệ mặc định.

### 4.2. Seeding Dữ Liệu Sách Mẫu Thực Tế
- **Lệnh chạy**:
  ```bash
  cd backend
  npm run seed
  ```
- **Kết quả thực tế**: Nạp thành công **100 đầu sách mẫu** từ dữ liệu cào Fahasa & Phương Nam vào MongoDB. Các tác giả, thể loại và nhà xuất bản được tự động phân giải (lookup hoặc tạo mới) mà không gây trùng lặp.
  ```text
  Seed hoàn tất: {
    staff: 'admin@library.local / admin123',
    reader: 'reader@library.local / reader123',
    books: { created: 100, skipped: 0 }
  }
  ```
