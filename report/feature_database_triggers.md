<!--
Chức năng: Báo cáo tính năng triển khai Database Triggers (Mongoose Middleware) cho tự động sinh mã, đặt/trả sách và quản lý tồn kho.
Lý do tạo: Tuân thủ quy định ghi báo cáo tính năng vào thư mục report/ theo quy tắc workspace AGENTS.md.
-->

# Báo Cáo: Triển Khai Database Triggers Tự Động Hóa & Quản Lý Mượn Trả Sách

## 1. Tên Tính Năng & Mô Tả
- **Mục đích**: Tự động hóa hoàn toàn quy trình nghiệp vụ lưu trữ dữ liệu và đảm bảo tính nhất quán (Consistency) của cơ sở dữ liệu khi phát sinh các sự kiện mượn sách, trả sách và tạo bản ghi mới.
- **Giải pháp**: 
  - Triển khai **Mongoose Pre-validate Hooks** để tự động điền các mã định dạng duy nhất trước khi lưu bản ghi.
  - Triển khai **Mongoose Pre-save Hooks** trên phiếu mượn `BorrowReceipt` để tự động kích hoạt logic cập nhật trạng thái cuốn sách (`BookCopy`) và cập nhật số lượng tồn kho khả dụng (`BookTitle.soLuongKhaDung`).

---

## 2. Các Tệp Đã Thay Đổi / Tạo Mới

### Thay đổi trong thư mục models:
- [borrowReceipt.model.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/models/borrowReceipt.model.js): Tích hợp trigger mượn sách, trả sách (Drain Strategy) và tự động tính tồn kho.
- **11 models còn lại** (Publisher, Author, Category, BookTitle, BookCopy, Reader, Staff, MembershipPlan, Subscription, PenaltyTicket, DiscountCode): Tích hợp trigger tự động sinh mã khóa chính trước khi validate.

### Thay đổi trong kiểm thử:
- [tests/concurrency.test.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/tests/concurrency.test.js): Bổ sung thêm test case verify trigger tự sinh mã và test case kiểm chứng tự động cập nhật trạng thái/tồn kho khi mượn trả sách.

---

## 3. Chi Tiết Triển Khai Nghiệp Vụ Tự Động

### 3.1. Trigger Sinh Mã Tự Động (Auto-ID Trigger)
Bằng cách sử dụng `pre('validate')` hook, trước khi Mongoose tiến hành kiểm tra tính hợp lệ của dữ liệu, nếu mã khóa chính trống (ví dụ `maDocGia` của Reader), trigger sẽ tự động điền mã định dạng tự tăng từ Counter Service. Điều này giúp ngăn chặn lỗi validate thiếu trường bắt buộc mà không cần gọi hàm sinh mã thủ công bên ngoài:
```javascript
schema.pre('validate', async function(next) {
  if (this.isNew && !this.maDocGia) {
    const { nextCode } = require('../services/codeService');
    this.maDocGia = await nextCode('reader');
  }
  next();
});
```

### 3.2. Trigger Mượn Sách & Trả Sách
Đăng ký trên `BorrowReceipt` (`pre('save')`):
- **Khi tạo phiếu mượn mới (`trangThai: 'DANG_MUON'`)**:
  1. Tự động chuyển đổi `tinhTrang` của các cuốn sách vật lý (`BookCopy`) tương ứng sang `'DA_MUON'`.
  2. Trực tiếp giảm `soLuongKhaDung` của các đầu sách (`BookTitle`) liên quan đi 1.
- **Khi trả sách (`trangThai` chuyển sang `'DA_TRA'`)**:
  1. Kiểm tra trạng thái của Đầu sách (`BookTitle`). Nếu đầu sách đã bị ngừng phục vụ (`trangThai: 'DISCONTINUED'`), chuyển cuốn sách vật lý đó sang trạng thái `'BAO_TRI'` và đặt `isDeleted = true` (áp dụng **Drain Strategy**). Ngược lại, trả cuốn sách về trạng thái `'CHO_MUON'`.
  2. Nếu đầu sách hoạt động bình thường, tự động cộng lại `soLuongKhaDung` của `BookTitle` thêm 1.

---

## 4. Kết Quả Kiểm Thử (Verification Results)
- **Lệnh chạy test**:
  ```bash
  cd backend
  npm test
  ```
- **Kết quả thực tế**: **PASSED 100%** (5/5 test cases).
  - **Test Case 4 (Trigger Sinh Mã)**: Thành công. Tạo một Reader mới mà không điền `maDocGia`, sau khi lưu, reader tự có mã `DGxxxxx`.
  - **Test Case 5 (Trigger Mượn/Trả)**: Thành công. Sau khi lưu phiếu mượn mới, cuốn sách tự chuyển thành `DA_MUON`, tồn kho đầu sách giảm từ 5 xuống 4. Sau khi cập nhật phiếu mượn thành `DA_TRA`, cuốn sách tự trả về `CHO_MUON`, tồn kho đầu sách tự động tăng lại lên 5.
