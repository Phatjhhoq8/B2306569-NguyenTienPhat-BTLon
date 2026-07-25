<!--
Chức năng: Báo cáo tính năng giải quyết cạnh tranh (Race Condition) khi đặt mượn sách.
Lý do tạo: Tuân thủ quy định ghi báo cáo tính năng vào thư mục report/ theo quy tắc workspace AGENTS.md.
-->

# Báo Cáo: Giải Quyết Tranh Chấp Cạnh Tranh (Race Condition) Khi Đặt Mượn Sách

## 1. Tên Tính Năng & Mô Tả
- **Mục đích**: Ngăn chặn tuyệt đối tình trạng hai hoặc nhiều độc giả cùng đặt mượn thành công một cuốn sách vật lý (`BookCopy`) duy nhất tại cùng một thời điểm (Race Condition).
- **Vấn đề**: Nếu chỉ sử dụng `findByIdAndUpdate` mà không kiểm tra trạng thái của cuốn sách trước đó, nhiều request song song sẽ ghi đè trạng thái của nhau, dẫn đến nhiều phiếu mượn được tạo ra cho cùng một cuốn sách, và tồn kho của đầu sách bị trừ sai lệch.
- **Giải pháp**: Áp dụng cơ chế **Khóa lạc quan (Optimistic Concurrency Control)** ở mức truy vấn. Chỉ cho phép chuyển trạng thái cuốn sách thành `'DA_MUON'` nếu trạng thái hiện tại của nó trong Database thực sự đang là `'CHO_MUON'`.

---

## 2. Các Tệp Đã Thay Đổi / Tạo Mới
- [models/borrowReceipt.model.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/models/borrowReceipt.model.js): Chỉnh sửa trigger `pre('save')` áp dụng câu lệnh cập nhật có điều kiện.
- [tests/concurrency.test.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/tests/concurrency.test.js): Thêm test case `6` giả lập Race Condition mượn song song.

---

## 3. Chi Tiết Triển Khai Xử Lý Cạnh Tranh

### 3.1. Cập Nhật Có Điều Kiện Ở Trigger Mượn Sách
Trong trigger `pre('save')` của `BorrowReceipt`, chúng ta thay thế việc cập nhật vô điều kiện bằng `findOneAndUpdate` có kèm bộ lọc trạng thái:
```javascript
const copy = await BookCopy.findOneAndUpdate(
  { _id: item.sach, tinhTrang: 'CHO_MUON', isDeleted: false },
  { $set: { tinhTrang: 'DA_MUON' } },
  { new: true }
);

if (!copy) {
  throw new Error(`Cuốn sách với ID ${item.sach} hiện không khả dụng để mượn (đã bị mượn hoặc đang bảo trì)`);
}
```
*Giải thích*: Khi hai request đồng thời gửi tới, MongoDB sẽ xếp hàng và thực hiện nguyên tử (atomic query). Lượt request đầu tiên chạy sẽ tìm thấy cuốn sách có trạng thái `'CHO_MUON'`, thực hiện chuyển thành `'DA_MUON'` thành công và trả về bản ghi để tiếp tục trừ tồn kho đầu sách. Lượt request thứ hai chạy ngay sau đó sẽ không tìm thấy cuốn sách nào thỏa mãn điều kiện `{ tinhTrang: 'CHO_MUON' }` nữa (vì đã bị đổi thành `'DA_MUON'`), do đó hàm trả về `null`. Hệ thống lập tức ném ra lỗi và hủy bỏ giao dịch lưu phiếu mượn của độc giả thứ hai.

---

## 4. Kết Quả Kiểm Thử (Verification Results)

### 4.1. Unit Test Tranh Chấp Đồng Thời (Race Condition Test)
- **Lệnh chạy test**:
  ```bash
  cd backend
  npm test
  ```
- **Kết quả thực tế**: **PASSED**.
  - **Test Case 6 (Kiểm tra tranh chấp)**: Giả lập 2 độc giả gửi song song yêu cầu mượn cùng 1 cuốn sách.
    *   **Kết quả**: Chỉ có **đúng 1 phiếu mượn được lưu thành công**. Phiếu mượn còn lại bị từ chối và ném ra lỗi chính xác: `Cuốn sách với ID xxxx hiện không khả dụng để mượn (đã bị mượn hoặc đang bảo trì)`.
    *   **Tồn kho khả dụng của đầu sách**: Chỉ bị trừ đi đúng `1` (giảm từ 5 xuống 4), đảm bảo tính nhất quán của dữ liệu.
