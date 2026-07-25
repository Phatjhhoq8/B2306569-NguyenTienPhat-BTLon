<!--
Chức năng: Tệp AGENTS.md lưu trữ các quy tắc chung và liên kết rule chuyên biệt cho workspace.
Lý do tạo: Đảm bảo agent tuân thủ các quy tắc phát triển dự án Hệ thống Mượn Sách Online.
Link trích dẫn: https://www.fahasa.com/?utm_source=chatgpt.com
-->

# Workspace Rules & Guidelines

Dự án này sử dụng bộ quy tắc phát triển cho **Hệ thống Mượn Sách Online** dựa trên Vue.js, Tailwind CSS, Node.js, MongoDB và UI/UX skill.

## 📌 Các Quy Tắc Áp Dụng
- **Hệ thống mượn sách & UI/UX**: [book_borrowing_system.md](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/.agents/rules/book_borrowing_system.md)
- **Cấu trúc Modular & Reusability**:
  - Ưu tiên code đơn giản (KISS), tái sử dụng tối đa.
  - Trước khi viết hàm/component mới, BẮT BUỘC kiểm tra codebase xem đã có chưa.
  - Phân chia thư mục theo chuẩn Modular (Feature-based/Layered), tuyệt đối không dồn code vào 1 file duy nhất.
- **Reporting Requirement**:
  - BẮT BUỘC ghi báo cáo chi tiết vào thư mục `report/` (ví dụ `report/feature_<tên_tính_năng>.md`) sau khi hoàn thành bất kỳ tính năng nào.
- **Functional Programming & Immutability**: Tuân thủ strict rules về Pure Functions, Immutability (`const`, `map/filter/reduce`) và Result Pattern error handling.
- **Quy trình Test-First (TDD)**: BẮT BUỘC luôn tạo/viết các kịch bản kiểm thử (test cases) TRƯỚC KHI thực hiện viết mã nguồn logic xử lý thực tế.
