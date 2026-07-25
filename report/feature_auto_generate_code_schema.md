<!--
Chức năng: Báo cáo chi tiết việc bổ sung quy định cấu trúc mã tự động cho 12 collections trong database schema.
Lý do tạo: Tuân thủ quy định ghi báo cáo tính năng vào thư mục report/ theo quy tắc workspace AGENTS.md.
Link trích dẫn tham khảo: https://www.fahasa.com/?utm_source=chatgpt.com
-->

# Báo Cáo: Chuẩn Hóa Cấu Trúc Sinh Mã Tự Động (Auto-Generated ID Format) Cho 12 Collections

## 1. Tên Tính Năng & Mô Tả
- **Mục đích**: Bổ sung quy chuẩn định dạng mã tự động (Auto-generated Code Structure) cho tất cả các mã khóa chính/unique key trong 12 Collections của CSDL MongoDB.
- **Chi tiết**: Đảm bảo toàn bộ các mã định danh (`maNXB`, `maTacGia`, `maTheLoai`, `maDauSach`, `maSach`, `maDocGia`, `maSoNV`, `maGoi`, `maDangKy`, `maPhieu`, `maPhieuPhat`, `maCode`) có cấu trúc quy chuẩn nhất quán (Tiền tố Prefix + Chuỗi số độ dài cố định Pad Zero).

---

## 2. Các Tệp Đã Thay Đổi / Tạo Mới
- [database_schema.md](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/document/database_schema.md) *(Đã bổ sung cột Cấu trúc mã tự động vào Bảng tổng quan và Mục 1.1 Quy định chi tiết)*
- [feature_auto_generate_code_schema.md](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/report/feature_auto_generate_code_schema.md) *(Tệp báo cáo này)*

---

## 3. Bảng Quy Chuẩn Định Dạng Mã Tự Động

| STT | Collection | Thuộc tính Mã | Tiền tố (Prefix) | Phần số (Number Pad) | Định dạng Mẫu | Ví Dụ |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `publishers` | `maNXB` | `NXB` | 3 chữ số | `NXB001` | `NXB001`, `NXB002` |
| 2 | `authors` | `maTacGia` | `TG` | 4 chữ số | `TG0001` | `TG0001`, `TG0002` |
| 3 | `categories` | `maTheLoai` | `TL` | 3 chữ số | `TL001` | `TL001`, `TL002` |
| 4 | `book_titles` | `maDauSach` | `DS` | 5 chữ số | `DS00001` | `DS00001`, `DS00002` |
| 5 | `book_copies` | `maSach` | `BS` | 6 chữ số | `BS000001` | `BS000001`, `BS000002` |
| 6 | `readers` | `maDocGia` | `DG` | 5 chữ số | `DG00001` | `DG00001`, `DG00002` |
| 7 | `staffs` | `maSoNV` | `NV` | 3 chữ số | `NV001` | `NV001`, `NV002` |
| 8 | `membership_plans` | `maGoi` | `GOI` | 3 chữ số | `GOI001` | `GOI001`, `GOI002` |
| 9 | `subscriptions` | `maDangKy` | `DK` | 6 chữ số | `DK000001` | `DK000001`, `DK000002` |
| 10 | `borrow_receipts` | `maPhieu` | `PM` | 6 chữ số | `PM000001` | `PM000001`, `PM000002` |
| 11 | `penalty_tickets` | `maPhieuPhat` | `PP` | 6 chữ số | `PP000001` | `PP000001`, `PP000002` |
| 12 | `discount_codes` | `maCode` | `KM` + YYYYMM | 3 chữ số | `KM202607001` | `KM202607001` |

---

## 4. Hướng Dẫn Verification & Lệnh Kiểm Tra
- Đọc lại file [database_schema.md](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/document/database_schema.md) để kiểm tra tính nhất quán giữa bảng tổng quan và phần mô tả chi tiết.
