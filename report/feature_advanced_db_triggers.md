<!--
Chức năng: Báo cáo tính năng triển khai 4 nhóm database triggers nâng cao: tự phạt trễ hạn, đồng bộ tồn kho hỏng/mất, chặn gói trùng lặp, chặn xóa độc giả nợ nần.
Lý do tạo: Tuân thủ quy định ghi báo cáo tính năng vào thư mục report/ theo quy tắc workspace AGENTS.md.
-->

# Báo Cáo: Tích Hợp 4 Nhóm Database Triggers Nghiệp Vụ Nâng Cao (TDD)

## 1. Tên Tính Năng & Mô Tả
- **Mục đích**: Bảo toàn tính đúng đắn, an toàn dữ liệu, chống thất thoát sách vật lý và phí phạt của thư viện, đồng thời tự động hóa tối đa các nghiệp vụ tại Backend.
- **Chi tiết các trigger triển khai**:
  1. **Tính phạt trễ hạn tự động**: Khi cập nhật trạng thái phiếu mượn sang `DA_TRA`, hệ thống tự động kiểm tra `ngayTraThucTe > ngayHenTra`. Nếu trễ hạn, trigger tự động tính số ngày trễ và tạo một bản ghi `PenaltyTicket` trị giá `số ngày trễ * 5.000đ/ngày` trong CSDL.
  2. **Đồng bộ tồn kho sách hỏng/mất/xoá**: Khi trạng thái một cuốn sách vật lý `BookCopy` đổi sang `MAT`, `BAO_TRI` hoặc bị xóa mềm (`isDeleted = true`), tồn kho khả dụng `soLuongKhaDung` của đầu sách `BookTitle` tự động trừ đi 1. Khi sửa xong quay lại `CHO_MUON`, tồn kho khả dụng tự động cộng lại 1.
  3. **Chặn gói thẻ trùng lặp**: Khi độc giả đăng ký một gói Subscription mới ở trạng thái `DANG_HIEU_LUC`, hệ thống sẽ tự động cập nhật toàn bộ các gói Subscription còn hạn cũ của độc giả đó sang trạng thái `HUY` để đảm bảo độc giả chỉ có tối đa 1 gói hoạt động tại một thời điểm.
  4. **Bảo vệ tài khoản độc giả**: Khi có yêu cầu xóa độc giả, hệ thống kiểm tra nếu độc giả còn sách chưa trả (`DANG_MUON`, `QUA_HAN`) hoặc nợ tiền phạt chưa đóng (`PenaltyTicket` có `daThanhToan: false`) thì sẽ chặn lại và ném lỗi từ chối xóa tài khoản. Nếu đủ điều kiện xóa, tự động chuyển gói thẻ Subscription hiện tại của họ sang `HUY`.

---

## 2. Các Tệp Đã Thay Đổi
- [models/borrowReceipt.model.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/models/borrowReceipt.model.js): Thêm logic tự phạt trễ hạn khi trả sách, phân định rõ ràng trách nhiệm quản lý tồn kho nguyên tử.
- [models/bookCopy.model.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/models/bookCopy.model.js): Bổ sung trigger pre-save tự động tăng/giảm tồn kho khả dụng của đầu sách khi thay đổi tình trạng sách vật lý hoặc khi bị xóa mềm (trừ trường hợp mượn/trả sách).
- [models/subscription.model.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/models/subscription.model.js): Tích hợp trigger pre-save tự động hủy gói cũ trùng lặp.
- [models/reader.model.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/models/reader.model.js): Khai báo bổ sung các trường xóa mềm `isDeleted`, `deletedAt` và tích hợp trigger chặn xóa độc giả nợ nần.
- [models/staff.model.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/models/staff.model.js): Khai báo bổ sung các trường xóa mềm `isDeleted`, `deletedAt`.
- [tests/concurrency.test.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/tests/concurrency.test.js): Bổ sung các kịch bản kiểm thử TDD cho 4 trigger nghiệp vụ mới nâng cao (Test 13, 14, 15, 16).

---

## 3. Kết Quả Kiểm Thử (Verification Results)
- **Lệnh chạy test**:
  ```bash
  cd backend
  npm test
  ```
- **Kết quả**: **PASSED 100%** (16/16 test cases).
  - **Test Case 13 (Tự phạt trễ hạn)**: Thành công. Tự động sinh `PenaltyTicket` trị giá 20.000đ khi trễ 4 ngày.
  - **Test Case 14 (Đồng bộ tồn kho hỏng/mất/xoá)**: Thành công. Tồn kho khả dụng giảm từ 5 xuống 4 khi sách bị báo trì/mất/xóa, và tăng lại lên 5 khi sửa xong.
  - **Test Case 15 (Chặn gói trùng lặp)**: Thành công. Mua gói mới tự động chuyển trạng thái gói VIP cũ sang `HUY`.
  - **Test Case 16 (Chặn xóa độc giả nợ nần)**: Thành công. Ném lỗi từ chối xóa độc giả khi còn sách chưa trả hoặc chưa đóng phạt. Chỉ khi thanh toán xong mới cho xóa và tự động hủy gói thẻ đang hoạt động.
