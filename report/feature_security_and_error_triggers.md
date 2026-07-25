<!--
Chức năng: Báo cáo tính năng triển khai băm mật khẩu bảo mật (SHA256), giải phóng sách khi hủy phiếu, và chặn sửa chi tiết mượn.
Lý do tạo: Tuân thủ quy định ghi báo cáo tính năng vào thư mục report/ theo quy tắc workspace AGENTS.md.
-->

# Báo Cáo: Tích Hợp Bảo Mật Mật Khẩu (SHA256) & Triggers Nghiệp Vụ Hủy Phiếu Mượn

## 1. Tên Tính Năng & Mô Tả
- **Mục đích**: 
  - Đảm bảo an toàn thông tin mật khẩu của người dùng (Độc giả & Nhân viên) không bị lộ dưới dạng plain text.
  - Sửa đổi các lỗ hổng logic nghiệp vụ khi có yêu cầu hủy phiếu mượn (đảm bảo hoàn trả sách vật lý và khôi phục tồn kho đầu sách).
  - Chặn sửa đổi danh sách chi tiết mượn sách (`chiTietMuon`) bất hợp pháp sau khi phiếu mượn đã được tạo thành công.
- **Giải pháp**:
  - **Bảo mật**: Sử dụng thư viện `crypto` có sẵn trong Node.js để tự động băm mật khẩu (`matKhau`) bằng thuật toán **SHA256** thông qua trigger `pre('save')` trên `Reader` và `Staff` schema.
  - **Hoàn trả khi Hủy**: Cập nhật trigger `pre('save')` trên `BorrowReceipt` để khi trạng thái (`trangThai`) chuyển sang `'HUY'` hoặc `'DA_TRA'`, hệ thống sẽ tự động hoàn trả các cuốn sách vật lý về trạng thái `'CHO_MUON'` (hoặc `'BAO_TRI'` tùy theo Drain strategy) và cộng lại tồn kho cho đầu sách.
  - **Chặn Sửa**: Trigger trên `BorrowReceipt` kiểm tra nếu phiếu mượn đã tồn tại (`!this.isNew`) và trường `chiTietMuon` bị thay đổi, hệ thống lập tức ném lỗi từ chối giao dịch.

---

## 2. Các Tệp Đã Thay Đổi / Tạo Mới
- [models/reader.model.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/models/reader.model.js): Tích hợp trigger băm mật khẩu.
- [models/staff.model.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/models/staff.model.js): Tích hợp trigger băm mật khẩu.
- [models/borrowReceipt.model.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/models/borrowReceipt.model.js): Cập nhật trigger `pre('save')` để xử lý hủy phiếu mượn và chặn sửa đổi danh sách sách mượn.
- [tests/concurrency.test.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/tests/concurrency.test.js): Bổ sung 3 test cases `10`, `11`, `12` kiểm chứng băm mật khẩu, hủy phiếu hoàn sách/tồn kho, và chặn sửa `chiTietMuon`.

---

## 3. Chi Tiết Triển Khai Nghiệp Vụ

### 3.1. Băm Mật Khẩu Tự Động (SHA256)
```javascript
readerSchema.pre('save', function(next) {
  if (this.isModified('matKhau')) {
    const crypto = require('crypto');
    this.matKhau = crypto.createHash('sha256').update(this.matKhau).digest('hex');
  }
  next();
});
```

### 3.2. Nghiệp Vụ Hủy Phiếu Mượn & Chặn Sửa
Trong trigger `pre('save')` của `BorrowReceipt`:
```javascript
// Chặn sửa danh sách sách mượn sau khi tạo
if (!this.isNew && this.isModified('chiTietMuon')) {
  throw new Error('Không được phép chỉnh sửa danh sách sách mượn (chiTietMuon) sau khi phiếu mượn đã được tạo');
}

// Hoàn sách & tồn kho khi TRẢ SÁCH (DA_TRA) hoặc HỦY PHIẾU (HUY)
if (!this.isNew && this.isModified('trangThai') && (this.trangThai === 'DA_TRA' || this.trangThai === 'HUY')) {
  for (const item of this.chiTietMuon) {
    const copy = await BookCopy.findById(item.sach);
    if (copy) {
      const title = await BookTitle.findById(copy.dauSach);
      let newStatus = 'CHO_MUON';
      if (title && (title.trangThai === 'DISCONTINUED' || title.isDeleted)) {
        newStatus = 'BAO_TRI';
      }
      copy.tinhTrang = newStatus;
      await copy.save();

      if (title && title.trangThai !== 'DISCONTINUED' && !title.isDeleted) {
        await BookTitle.findByIdAndUpdate(copy.dauSach, { $inc: { soLuongKhaDung: 1 } });
      }
    }
  }
}
```

---

## 4. Kết Quả Kiểm Thử (Verification Results)
- **Lệnh chạy test**:
  ```bash
  cd backend
  npm test
  ```
- **Kết quả thực tế**: **PASSED 100%** (12/12 test cases).
  - **Test Case 10 (Hủy phiếu mượn)**: Thành công. Khi phiếu mượn chuyển sang trạng thái `HUY`, cuốn sách tự động đổi về `CHO_MUON`, tồn kho của đầu sách được khôi phục nguyên vẹn.
  - **Test Case 11 (Chặn sửa chi tiết mượn)**: Thành công. Thao tác push thêm sách vào `chiTietMuon` của phiếu mượn đã có bị ném lỗi và từ chối lưu.
  - **Test Case 12 (Băm mật khẩu)**: Thành công. Mật khẩu lưu trong DB được băm SHA256 chính xác, không còn lưu text trần.
