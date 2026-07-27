# Báo Cáo Tính Năng: Hệ Thống Backend Core & Tái Cấu Trúc Modular (TDD-Based)

Báo cáo này tổng hợp kết quả xây dựng hệ thống Backend Core phục vụ cho **Hệ Thống Mượn Sách Online**, áp dụng quy trình phát triển kiểm thử trước (TDD), cấu trúc Modular Design, và các cơ chế bảo mật (HTTP-Only Cookie, Multi-Origin CORS).

---

## 1. Trạng Thái Hoàn Thành

| STT | Nhiệm vụ | Trạng thái | Chi tiết kỹ thuật |
| :--- | :--- | :--- | :--- |
| 1 | Cài đặt & Cấu hình Core | `[HOÀN THÀNH]` | Cài đặt `jsonwebtoken`. Thiết lập cấu hình CORS, Cookie trong `.env` và `src/config/index.js` |
| 2 | Core Utilities & Middlewares | `[HOÀN THÀNH]` | Xây dựng `jwtHelper`, `cookieHelper`, `resultResponse`, `authMiddleware` (xác thực cookie & phân quyền), `errorMiddleware` (bắt lỗi global), `validateMiddleware` (kiểm tra trường bắt buộc) |
| 3 | Tái cấu trúc thư mục sang Modular | `[HOÀN THÀNH]` | Di chuyển models sang các module `books`, `users`, `borrowing`, `memberships`, `discounts`. Cập nhật `models/index.js` và `services/index.js` làm proxy tương thích ngược |
| 4 | Cập nhật Staff Model (Không Mật Khẩu) | `[HOÀN THÀNH]` | Xóa trường `matKhau` khỏi `Staff`. Cập nhật luồng xác thực nhân viên chỉ sử dụng mã số nhân viên (`maSoNV`) |
| 5 | Module Auth & Users (TDD) | `[HOÀN THÀNH]` | Đăng ký độc giả, đăng nhập độc giả (mật khẩu), đăng nhập nhân viên (chỉ `maSoNV`), lấy thông tin cá nhân (`/auth/me`), cập nhật hồ sơ & mật khẩu độc giả |
| 6 | Module Books & Catalog (TDD) | `[HOÀN THÀNH]` | Tra cứu tìm kiếm đầu sách, CRUD Thể loại, Đầu sách, tự động sinh bản sao vật lý BookCopy |
| 7 | Module Borrowing & Penalties (TDD) | `[HOÀN THÀNH]` | Đăng ký mượn sách giấy, trả sách (toàn bộ/từng cuốn), hủy phiếu, tự động sinh phiếu phạt trễ hạn |
| 8 | Module Memberships (TDD) | `[HOÀN THÀNH]` | Tra cứu gói hội viên, mua đăng ký gói hội viên |
| 9 | Module Discounts (TDD) | `[HOÀN THÀNH]` | Tạo mã giảm giá, kiểm tra mã khả dụng |
| 10 | Seed & Concurrency Testing | `[HOÀN THÀNH]` | Pass 19/19 test case nghiệp vụ đồng thời (`concurrency.test.js`) và seed thành công 100 sách |
| 11 | Admin CRUD Quản lý Độc giả | `[HOÀN THÀNH]` | Danh sách (phân trang + tìm kiếm), chi tiết, khóa/mở khóa, xóa mềm |
| 12 | Admin CRUD Quản lý Nhân viên | `[HOÀN THÀNH]` | Tạo mới, danh sách, cập nhật (chức vụ, mật khẩu), xóa mềm |
| 13 | Admin CRUD Đầu sách mở rộng | `[HOÀN THÀNH]` | Cập nhật thông tin, xóa mềm/Drain Strategy (ngừng phục vụ có thu hồi cascade) |
| 14 | Admin CRUD Bản sao sách (BookCopy) | `[HOÀN THÀNH]` | Danh sách bản sao theo đầu sách, cập nhật tình trạng/vị trí kệ, xóa mềm |
| 15 | Admin CRUD Tác giả & NXB | `[HOÀN THÀNH]` | CRUD riêng biệt cho Author và Publisher |
| 16 | Admin CRUD Gói hội viên & Subscription | `[HOÀN THÀNH]` | Tạo/sửa/xóa gói cho Admin, xem subscription cá nhân cho Độc giả |
| 17 | Admin CRUD Mã giảm giá mở rộng | `[HOÀN THÀNH]` | Cập nhật và xóa mã giảm giá |
| 18 | Chi tiết phiếu mượn & Cải thiện phân trang | `[HOÀN THÀNH]` | `GET /borrowing/receipts/:id`, trả `totalCount` cho API books & readers |

---

## 2. Chi Tiết Kiến Trúc Modular

### Thư mục `src/modules/`
```text
src/modules/
├── books/                     # Quản lý Sách, Danh mục
│   ├── author.model.js
│   ├── publisher.model.js
│   ├── category.model.js
│   ├── bookTitle.model.js
│   ├── bookCopy.model.js
│   ├── book.service.js
│   ├── book.controller.js
│   └── book.routes.js
├── borrowing/                 # Quản lý Mượn / Trả Sách & Phạt
│   ├── borrowReceipt.model.js
│   ├── penaltyTicket.model.js
│   ├── borrow.service.js
│   ├── borrow.controller.js
│   └── borrow.routes.js
├── users/                     # Độc giả & Nhân viên + Auth
│   ├── reader.model.js
│   ├── staff.model.js
│   ├── user.service.js
│   ├── user.controller.js
│   └── user.routes.js
├── memberships/               # Gói Hội viên & Đăng ký
│   ├── membershipPlan.model.js
│   ├── subscription.model.js
│   ├── membership.service.js
│   ├── membership.controller.js
│   └── membership.routes.js
└── discounts/                 # Mã Giảm Giá
    ├── discountCode.model.js
    ├── discount.service.js
    ├── discount.controller.js
    └── discount.routes.js
```

---

## 3. Cơ Chế Bảo Mật & Kết Nối Đa Nguồn

### 3.1. HTTP-Only Cookie (`SameSite=Lax`)
Hệ thống sử dụng cookie `token` được gửi qua header `Set-Cookie` khi đăng nhập thành công.
- **HttpOnly**: Bật chặn đọc cookie từ Javascript (phòng chống XSS).
- **SameSite**: `Lax` giúp cookie được tự động đính kèm khi cùng parent domain (phù hợp với cấu trúc subdomain: `library.example.com` và `admin.example.com`).
- **Secure**: Tự động bật `Secure` (chỉ gửi qua HTTPS) khi chạy ở môi trường Production (`NODE_ENV=production`).

### 3.2. Multi-Origin CORS
Để chấp nhận cả 2 ứng dụng Web Độc Giả và Web Admin ở 2 miền khác nhau, Express app kiểm tra động tiêu đề `Origin` trong request:
```javascript
const allowedOrigins = [config.cors.publicOrigin, config.cors.adminOrigin];
// Nếu origin gửi lên nằm trong danh sách allowedOrigins, trả lại header Access-Control-Allow-Origin tương ứng
```

---

## 4. Kết Quả Kiểm Thử (Verification)

### 4.1. Unit Tests Core & Modules
Toàn bộ kịch bản kiểm thử TDD viết trước đều vượt qua thành công (cập nhật lần cuối: 2026-07-27):
- `node src/tests/core.test.js`: Pass 10/10 test cases (JWT, Cookie, Response, Middlewares).
- `node src/tests/auth.test.js`: Pass 5/5 test cases (Đăng ký/Đăng nhập Reader, Đăng nhập Staff).
- `node src/tests/books.test.js`: Pass 6/6 test cases (CRUD Category, BookTitle, BookCopy, Phân trang totalCount).
- `node src/tests/borrowing.test.js`: Pass 3/3 test cases (Mượn/Trả sách, kiểm tra tồn kho).
- `node src/tests/memberships.test.js`: Pass 2/2 test cases (Đăng ký gói VIP/Tiêu chuẩn).
- `node src/tests/discounts.test.js`: Pass 2/2 test cases (Validate và tính toán giảm giá).
- **Tổng cộng: 28/28 pass (bao gồm core) + 19/19 concurrency = 100% PASS.**

### 4.2. Concurrency & Nghiệp Vụ Tích Hợp
Chạy `npm run test` vượt qua 19/19 test cases đồng thời kiểm tra:
- Khóa mượn sách, tranh chấp mượn trùng (Race Condition).
- Ngừng phục vụ đầu sách (Drain Strategy).
- Hạn thẻ thành viên & giới hạn số lượng mượn tối đa.
- Cascade soft-delete khi độc giả nợ sách/tiền phạt.
- Tự động sinh phiếu phạt khi trả sách quá hạn.

### 4.3. Seed Dữ Liệu
Chạy `npm run seed` nạp thành công 100/100 sách cào mẫu, khởi tạo các gói hội viên và tài khoản mẫu:
```text
Seed hoàn tất: {
  staff: 'admin@library.local / (Đăng nhập chỉ bằng mã số nhân viên)',
  reader: 'reader@library.local / reader123',
  books: { created: 100, skipped: 0 }
}
```
Các file ảnh bìa sách được lưu trữ trong thư mục `uploads/` và được Express server serve tĩnh trực tiếp thông qua đường dẫn `/uploads/...`.
