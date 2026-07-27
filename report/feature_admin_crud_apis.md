<!--
Chức năng: Báo cáo tính năng bổ sung API CRUD quản trị (Admin) cho toàn bộ module backend
Lý do tạo: Ghi nhận các endpoint mới, logic Drain Strategy, và cải thiện response format phân trang
Link trích dẫn: guideline.md §3-5, database_schema.md, book_borrowing_system.md
-->

# Báo Cáo Tính Năng: API CRUD Quản Trị (Admin) Backend

Báo cáo này ghi nhận việc bổ sung **25+ API endpoints** quản trị cho Admin Portal, giải quyết toàn bộ thiếu sót được phát hiện trong bước kiểm tra thiết kế backend.

---

## 1. Tóm Tắt

| Hạng mục | Trạng thái |
| :--- | :--- |
| CRUD Quản lý Độc giả (Admin) | `[HOÀN THÀNH]` |
| CRUD Quản lý Nhân viên (Admin) | `[HOÀN THÀNH]` |
| CRUD Đầu sách mở rộng (update, soft-delete/drain) | `[HOÀN THÀNH]` |
| CRUD Bản sao sách (BookCopy) | `[HOÀN THÀNH]` |
| CRUD Tác giả (Author) | `[HOÀN THÀNH]` |
| CRUD Nhà xuất bản (Publisher) | `[HOÀN THÀNH]` |
| CRUD Gói hội viên Admin + Subscription cá nhân | `[HOÀN THÀNH]` |
| CRUD Mã giảm giá mở rộng (update, delete) | `[HOÀN THÀNH]` |
| Chi tiết phiếu mượn theo ID | `[HOÀN THÀNH]` |
| Cải thiện phân trang (totalCount) cho API Books | `[HOÀN THÀNH]` |
| Cập nhật Test cho response format mới | `[HOÀN THÀNH]` |

---

## 2. Danh Sách File Đã Thay Đổi / Tạo Mới

### Module Users
- [user.controller.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/modules/users/user.controller.js) — Thêm 8 hàm: `getReaders`, `getReaderById`, `toggleReaderStatus`, `softDeleteReader`, `getStaffs`, `createStaff`, `updateStaff`, `softDeleteStaff`
- [user.routes.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/modules/users/user.routes.js) — Thêm 8 routes Admin `/api/admin/readers/*` và `/api/admin/staffs/*`

### Module Books
- [book.controller.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/modules/books/book.controller.js) — Thêm 12 hàm: `updateBookTitle`, `softDeleteBookTitle`, `getBookCopies`, `updateBookCopy`, `softDeleteBookCopy`, `getAuthors`, `createAuthor`, `updateAuthor`, `getPublishers`, `createPublisher`, `updatePublisher`. Cải thiện `getBooks` và `getBookById` format mới
- [book.routes.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/modules/books/book.routes.js) — Tái cấu trúc hoàn toàn 16 routes (Public + Admin cho BookTitle, BookCopy, Author, Publisher, Category)
- [book.service.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/modules/books/book.service.js) — Thêm hàm `softDeleteBookTitle` triển khai Drain Strategy theo guideline.md §3.1 điểm 5-6

### Module Borrowing
- [borrow.controller.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/modules/borrowing/borrow.controller.js) — Thêm hàm `getReceiptById`
- [borrow.routes.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/modules/borrowing/borrow.routes.js) — Thêm route `GET /borrowing/receipts/:id`

### Module Memberships
- [membership.controller.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/modules/memberships/membership.controller.js) — Thêm 4 hàm: `createPlan`, `updatePlan`, `deletePlan`, `getMySubscription`
- [membership.routes.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/modules/memberships/membership.routes.js) — Tái cấu trúc hoàn toàn: Public + Reader + Admin routes

### Module Discounts
- [discount.controller.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/modules/discounts/discount.controller.js) — Thêm 2 hàm: `updateDiscount`, `deleteDiscount`
- [discount.routes.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/modules/discounts/discount.routes.js) — Tái cấu trúc hoàn toàn routes

### Tests
- [books.test.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/tests/books.test.js) — Cập nhật 2 assertions cho response format mới (`{ books, totalCount }` và `{ book, copies }`)

---

## 3. Chi Tiết API Endpoints Mới

### 3.1. Admin: Quản lý Độc giả

| Method | Endpoint | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/readers` | STAFF | Danh sách độc giả (phân trang `?q=&status=&page=&limit=`), trả `{ readers, totalCount }` |
| `GET` | `/api/admin/readers/:id` | STAFF | Chi tiết 1 độc giả (ẩn mật khẩu) |
| `POST` | `/api/admin/readers/:id/toggle-status` | STAFF | Chuyển đổi trạng thái ACTIVE ⇔ SUSPENDED |
| `DELETE` | `/api/admin/readers/:id` | STAFF | Xóa mềm (set `isDeleted = true`) |

### 3.2. Admin: Quản lý Nhân viên

| Method | Endpoint | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/staffs` | STAFF | Danh sách nhân viên (ẩn mật khẩu) |
| `POST` | `/api/admin/staffs` | STAFF | Tạo nhân viên mới (tự sinh mã `NV00x`, tự hash mật khẩu) |
| `PUT` | `/api/admin/staffs/:id` | STAFF | Cập nhật thông tin (có thể đổi mật khẩu, chức vụ) |
| `DELETE` | `/api/admin/staffs/:id` | STAFF | Xóa mềm nhân viên |

### 3.3. Admin: Quản lý Đầu Sách (Mở rộng)

| Method | Endpoint | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| `PUT` | `/api/books/:id` | STAFF | Cập nhật thông tin đầu sách (tenSach, namSanXuat, giaBia, hinhAnh, moTa, tuKhoa) |
| `DELETE` | `/api/books/:id` | STAFF | Xóa mềm / Ngừng phục vụ theo **Drain Strategy** |

**Drain Strategy logic** (`book.service.js → softDeleteBookTitle`):
1. Nếu **còn bản sao đang mượn**: chỉ chuyển `trangThai → DISCONTINUED`, thu hồi bản sao rảnh (`CHO_MUON → BAO_TRI + isDeleted`)
2. Nếu **không còn sách đang mượn**: `isDeleted = true`, thu hồi toàn bộ bản sao

### 3.4. Admin: Quản lý Bản Sao Sách (BookCopy)

| Method | Endpoint | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/books/:bookId/copies` | STAFF | Danh sách bản sao vật lý của 1 đầu sách |
| `PUT` | `/api/book-copies/:id` | STAFF | Cập nhật tình trạng / vị trí kệ (chặn nếu đang mượn) |
| `DELETE` | `/api/book-copies/:id` | STAFF | Xóa mềm bản sao (chặn nếu đang mượn) |

### 3.5. Admin: Quản lý Tác Giả & Nhà Xuất Bản

| Method | Endpoint | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/authors` | Public | Danh sách tác giả (sắp xếp theo tên) |
| `POST` | `/api/authors` | STAFF | Tạo tác giả mới |
| `PUT` | `/api/authors/:id` | STAFF | Cập nhật tác giả |
| `GET` | `/api/publishers` | Public | Danh sách nhà xuất bản |
| `POST` | `/api/publishers` | STAFF | Tạo nhà xuất bản mới |
| `PUT` | `/api/publishers/:id` | STAFF | Cập nhật nhà xuất bản |

### 3.6. Admin: Quản lý Gói Hội Viên

| Method | Endpoint | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/memberships/plans` | STAFF | Tạo gói hội viên mới |
| `PUT` | `/api/memberships/plans/:id` | STAFF | Cập nhật gói hội viên |
| `DELETE` | `/api/memberships/plans/:id` | STAFF | Xóa gói hội viên |
| `GET` | `/api/memberships/my-subscriptions` | READER | Xem lịch sử đăng ký gói cá nhân |

### 3.7. Admin: Quản lý Mã Giảm Giá (Mở rộng)

| Method | Endpoint | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| `PUT` | `/api/discounts/:id` | STAFF | Cập nhật mã giảm giá |
| `DELETE` | `/api/discounts/:id` | STAFF | Xóa mã giảm giá |

### 3.8. Phiếu Mượn: Chi Tiết

| Method | Endpoint | Quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/borrowing/receipts/:id` | Authenticated | Chi tiết 1 phiếu mượn (populate docGia, sach, dauSach) |

### 3.9. Cải Thiện Response Format

- **`GET /api/books`**: Trước đây trả mảng sách trực tiếp. Giờ trả `{ books: [...], totalCount, page, limit }` hỗ trợ phân trang frontend.
- **`GET /api/books/:id`**: Trước đây trả object BookTitle. Giờ trả `{ book: {...}, copies: [...] }` kèm danh sách bản sao vật lý.
- **`GET /api/admin/readers`**: Trả `{ readers: [...], totalCount, page, limit }` hỗ trợ phân trang frontend.

---

## 4. Kết Quả Kiểm Thử

Toàn bộ test suite hiện có đều **PASS 100%** sau khi bổ sung:

```text
node src/tests/auth.test.js         → 5/5 pass ✅
node src/tests/books.test.js        → 6/6 pass ✅
node src/tests/borrowing.test.js    → 3/3 pass ✅
node src/tests/memberships.test.js  → 2/2 pass ✅
node src/tests/discounts.test.js    → 2/2 pass ✅
────────────────────────────────────────────────
Tổng cộng:                          18/18 pass ✅
```

---

## 5. Hướng Dẫn Kiểm Tra

```bash
cd backend

# Chạy từng test suite
node src/tests/auth.test.js
node src/tests/books.test.js
node src/tests/borrowing.test.js
node src/tests/memberships.test.js
node src/tests/discounts.test.js

# Hoặc chạy toàn bộ
npm test

# Khởi động server dev
npm run dev
```

### Test nhanh với Postman:

**Đăng nhập Staff lấy cookie:**
```
POST http://localhost:3000/api/auth/staff/login
Body: { "maSoNV": "NV001", "matKhau": "admin123" }
```

**Danh sách độc giả (Admin):**
```
GET http://localhost:3000/api/admin/readers?page=1&limit=10
Cookie: token=<jwt_token>
```

**Tạo nhân viên mới (Admin):**
```
POST http://localhost:3000/api/admin/staffs
Body: { "hoTenNV": "Nguyễn Văn B", "matKhau": "abc123", "diachi": "HCM", "soDienThoai": "0912345678" }
```
