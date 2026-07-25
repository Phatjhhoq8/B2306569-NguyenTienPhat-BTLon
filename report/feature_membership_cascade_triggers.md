<!--
Chức năng: Báo cáo tính năng triển khai 2 nhóm triggers nâng cao: Ràng buộc Subscription hội viên và Cascade Soft-delete.
Lý do tạo: Tuân thủ quy định ghi báo cáo tính năng vào thư mục report/ theo quy tắc workspace AGENTS.md.
-->

# Báo Cáo: Triển Khai Ràng Buộc Hội Viên (Membership) & Trigger Cascade Soft-Delete

## 1. Tên Tính Năng & Mô Tả
- **Mục đích**: 
  - Đảm bảo an toàn nghiệp vụ mượn sách bằng cách tự động đối chiếu với gói dịch vụ VIP/thành viên của độc giả.
  - Tự động hóa việc xóa mềm và thu hồi toàn bộ các bản sao vật lý của đầu sách khi đầu sách đó bị ngưng phục vụ (Cascade Soft-delete & Discontinue).
- **Giải pháp**:
  - **Triggers hội viên trên phiếu mượn**: Kiểm tra hạn thẻ thành viên, giới hạn số sách được phép mượn tối đa và tự động tính toán số tiền cọc (mienTienCoc) ngay tại Backend để tránh client/frontend gửi số tiền cọc giả lên.
  - **Trigger Cascade Soft-delete trên đầu sách**: Đăng ký pre-save hook trên `BookTitle`. Khi đầu sách chuyển trạng thái thành `DISCONTINUED` hoặc bị đánh dấu `isDeleted = true`, trigger sẽ tự động cập nhật toàn bộ các `BookCopy` liên quan thành `BAO_TRI` và `isDeleted = true`.

---

## 2. Các Tệp Đã Thay Đổi / Tạo Mới
- [models/borrowReceipt.model.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/models/borrowReceipt.model.js): Cập nhật trigger `pre('save')` để tích hợp ràng buộc gói Subscription, giới hạn số sách tối đa và tự động tính tiền cọc.
- [models/bookTitle.model.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/models/bookTitle.model.js): Đăng ký trigger `pre('save')` để tự động Cascade Soft-delete các bản sao sách vật lý.
- [tests/concurrency.test.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/tests/concurrency.test.js): Bổ sung 3 test cases `7`, `8`, `9` kiểm chứng hạn thẻ mượn sách, hạn mức sách tối đa, tiền cọc tự động và Cascade Soft-delete.

---

## 3. Chi Tiết Triển Khai Nghiệp Vụ

### 3.1. Ràng Buộc Hội Viên & Tự Động Tính Tiền Cọc
Khi tạo mới phiếu mượn ở trạng thái `DANG_MUON`:
1.  **Hạn thẻ thành viên**:
    ```javascript
    const activeSub = await Subscription.findOne({
      docGia: this.docGia,
      trangThai: 'DANG_HIEU_LUC',
      ngayBatDau: { $lte: new Date() },
      ngayKetThuc: { $gte: new Date() }
    }).populate('goiDocGia');
    if (!activeSub || !activeSub.goiDocGia) {
      throw new Error('Độc giả không có gói hội viên còn hiệu lực để mượn sách');
    }
    ```
2.  **Giới hạn số sách tối đa**:
    ```javascript
    let currentBorrowedCount = 0;
    for (const r of activeReceipts) {
      currentBorrowedCount += r.chiTietMuon.length;
    }
    if (currentBorrowedCount + this.chiTietMuon.length > activeSub.goiDocGia.soSachToiDa) {
      throw new Error(`Mượn sách vượt quá giới hạn tối đa cho phép của gói thẻ...`);
    }
    ```
3.  **Tự động tính tiền cọc**:
    Nếu gói thẻ quy định `mienTienCoc === true`, `this.tienCoc = 0`. Ngược lại, hệ thống tự động duyệt qua các cuốn sách vật lý để lấy giá bìa từ đầu sách và cộng dồn lại gán vào `this.tienCoc`.

### 3.2. Cascade Soft-Delete Đầu Sách
```javascript
bookTitleSchema.pre('save', async function(next) {
  if ((this.isModified('trangThai') && this.trangThai === 'DISCONTINUED') || (this.isModified('isDeleted') && this.isDeleted === true)) {
    const BookCopy = mongoose.model('BookCopy');
    await BookCopy.updateMany(
      { dauSach: this._id },
      { 
        $set: { 
          tinhTrang: 'BAO_TRI',
          isDeleted: true,
          deletedAt: new Date(),
          ghiChu: 'Tự động ngưng hoạt động do đầu sách bị ngừng phục vụ/xóa'
        } 
      }
    );
    this.soLuongKhaDung = 0;
  }
  next();
});
```

---

## 4. Kết Quả Kiểm Thử (Verification Results)
- **Lệnh chạy test**:
  ```bash
  cd backend
  npm test
  ```
- **Kết quả thực tế**: **PASSED 100%** (9/9 test cases).
  - **Test Case 7 (Kiểm tra hạn thẻ)**: Thành công. Một độc giả không mua gói hội viên khi mượn sách sẽ bị hệ thống từ chối và báo lỗi.
  - **Test Case 8 (Kiểm tra hạn mức & cọc)**: Thành công. 
    * Độc giả VIP (giới hạn 2 cuốn, miễn cọc) khi cố tình mượn 3 cuốn sẽ bị từ chối; khi mượn 2 cuốn thành công, số tiền cọc tự động gán là `0` dù trước đó gửi cọc sai lệch.
    * Độc giả Normal (không miễn cọc) mượn thành công, tiền cọc tự động cập nhật bằng tổng giá bìa sách.
  - **Test Case 9 (Cascade Soft-delete)**: Thành công. Chuyển trạng thái đầu sách sang `DISCONTINUED` lập tức vô hiệu hóa 3 cuốn sách vật lý liên quan thành `BAO_TRI` và `isDeleted = true`, đồng thời gán tồn kho của đầu sách về `0`.
