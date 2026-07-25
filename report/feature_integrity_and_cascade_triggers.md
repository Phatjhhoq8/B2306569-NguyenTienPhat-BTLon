<!--
Chức năng: Báo cáo tính năng triển khai cơ chế toàn vẹn dữ liệu: chặn xóa cuốn sách vật lý đang được mượn và chặn xóa mềm đầu sách nếu có bản sao đang được mượn (nhưng cho phép ngừng hoạt động DISCONTINUED để áp dụng Drain Strategy).
Lý do tạo: Tuân thủ quy định ghi báo cáo tính năng vào thư mục report/ theo quy tắc workspace AGENTS.md.
-->

# Báo Cáo: Tích Hợp Cơ Chế Bảo Toàn Toàn Vẹn Dữ Liệu Sách Đang Lưu Hành (TDD)

## 1. Tên Tính Năng & Mô Tả
- **Mục đích**: Ngăn ngừa tình trạng mồ côi dữ liệu mượn trả và mất dấu vết sách vật lý khi thủ thư vô ý hoặc cố ý xóa/sửa đổi tình trạng sách đang lưu hành ngoài tay độc giả.
- **Chi tiết các trigger toàn vẹn triển khai**:
  1. **Chặn xóa/cập nhật sách vật lý đang được mượn**:
     - *Nghiệp vụ*: Cài đặt trigger `pre('save')` trên `BookCopy`. Khi cuốn sách vật lý đang có trạng thái cũ trong CSDL là `DA_MUON` (đang lưu hành ngoài thư viện), hệ thống sẽ chặn mọi cập nhật thay đổi trạng thái khác `DA_MUON` (như `BAO_TRI`, `MAT` trực tiếp) hoặc cấm xóa mềm (`isDeleted = true`).
  2. **Chặn xóa mềm đầu sách (nhưng cho phép ngừng phục vụ để áp dụng Drain Strategy)**:
     - *Nghiệp vụ*: Cài đặt trigger `pre('save')` trên `BookTitle`.
       - **Ngừng phục vụ (`DISCONTINUED`)**: Được phép thực hiện ngay cả khi còn sách đang mượn ngoài để **ngăn chặn đặt mượn mới** đầu sách này. Khi chuyển sang `DISCONTINUED`, hệ thống lập tức thu hồi toàn bộ các cuốn sách vật lý đang rảnh rỗi (`CHO_MUON`) chuyển sang `BAO_TRI` và xóa mềm. Những cuốn đang mượn (`DA_MUON`) giữ nguyên để độc giả đọc nốt, và khi trả về sẽ được tự động chuyển sang `BAO_TRI` và xóa mềm (áp dụng **Drain Strategy**).
       - **Xóa mềm đầu sách (`isDeleted = true`)**: Cấm tuyệt đối nếu còn bất kỳ bản sao vật lý nào đang ở trạng thái `DA_MUON` để bảo toàn dữ liệu lịch sử mượn trả đang diễn ra.

---

## 2. Các Tệp Đã Thay Đổi
- [models/bookCopy.model.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/models/bookCopy.model.js): Tích hợp trigger chặn cập nhật/xóa sách vật lý đang được mượn lên đầu pre-save hook.
- [models/bookTitle.model.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/models/bookTitle.model.js): Tích hợp trigger quét kiểm tra các bản sao vật lý đang mượn trước khi thực hiện cascade soft-delete (nhưng cho phép Discontinued).
- [tests/concurrency.test.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/tests/concurrency.test.js): Bổ sung các kịch bản kiểm thử TDD cho 2 trigger toàn vẹn mới (Test 17 và 18).

---

## 3. Kết Quả Kiểm Thử (Verification Results)
- **Lệnh chạy test**:
  ```bash
  cd backend
  npm test
  ```
- **Kết quả**: **PASSED 100%** (18/18 test cases).
  - **Test Case 17 (Chặn sửa/xóa sách vật lý đang mượn)**: Thành công. Thao tác set `isDeleted = true` hoặc `tinhTrang = 'BAO_TRI'` trực tiếp trên cuốn sách đang được mượn bị từ chối và ném lỗi chính xác.
  - **Test Case 18 (Drain Strategy & Chặn xóa đầu sách đang mượn)**: Thành công.
    - Đặt trạng thái `DISCONTINUED` thành công khi còn sách mượn. Cuốn đang mượn giữ nguyên, cuốn đang rảnh tự động thu hồi về `BAO_TRI`.
    - Thao tác xóa mềm đầu sách (`isDeleted = true`) bị chặn lại và báo lỗi chính xác do còn sách đang được mượn ngoài.
