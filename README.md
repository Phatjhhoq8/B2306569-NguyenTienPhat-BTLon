<!--
Chức năng: Tài liệu README hướng dẫn cài đặt và vận hành toàn bộ hệ thống
Lý do tạo: Cung cấp hướng dẫn đầy đủ từ cài đặt database, seed dữ liệu sách mẫu, chạy backend, chạy frontend và các tài khoản thử nghiệm.
Link tham chiếu: guideline.md, database_schema.md
-->

# CTU eLibrary — Hệ Thống Mượn Sách Online

CTU eLibrary là hệ thống mượn sách online hoàn chỉnh, bao gồm ứng dụng Web Độc giả (Public Website) và Cổng Quản trị (Admin/Librarian Portal). Dự án được thiết kế theo kiến trúc Modular, tích hợp cơ chế tự sinh mã an toàn, xử lý tranh chấp mượn trùng (Race Condition), Drain Strategy khi ngừng phục vụ sách và giả lập thanh toán quét mã QR động.

---

## 🛠️ Công Nghệ Sử Dụng

### Backend Core
*   **Runtime**: Node.js & Express.js
*   **Database**: MongoDB & Mongoose (ODM)
*   **Security & Authentication**: JWT (được đính kèm qua HTTP-Only Cookie với thuộc tính `SameSite=Lax`), PBKDF2 băm mật khẩu kèm muối (Salt).
*   **Kiểm thử**: Tự viết kiểm thử tích hợp (TAP-based Unit Tests) và mô phỏng tranh chấp đồng thời (`concurrency.test.js`).

### Giao Diện Frontend
*   **Framework**: Vue 3 (Composition API - `<script setup>`)
*   **State Management**: Pinia (Store `auth` và Store `cart` đồng bộ LocalStorage)
*   **Routing**: Vue Router 4 (Tích hợp Navigation Guards bảo vệ phân quyền theo vai trò)
*   **Styling**: Tailwind CSS v3 (Tông màu Ocean Blue chủ đạo)
*   **Icons**: Lucide Icons (qua gói `@lucide/vue`)

---

## ⚙️ Yêu Cầu Hệ Thống

Để vận hành hệ thống cục bộ (Local), máy tính của bạn cần được cài đặt sẵn:
1.  **Node.js** (Khuyên dùng phiên bản LTS từ v18 trở lên)
2.  **MongoDB** (Chạy dịch vụ MongoDB cục bộ ở cổng mặc định `mongodb://localhost:27017`)

---

## 🚀 Hướng Dẫn Cài Đặt & Vận Hành

### Bước 1: Clone dự án và truy cập thư mục gốc
Mở Terminal tại thư mục của dự án:
```bash
cd B2306569-NguyenTienPhat-BTLon
```

### Bước 2: Cấu hình và Chạy Backend

1.  **Di chuyển vào thư mục backend**:
    ```bash
    cd backend
    ```
2.  **Cài đặt dependencies**:
    ```bash
    npm install
    ```
3.  **Tạo tệp cấu hình `.env`**:
    Tạo tệp `.env` trong thư mục `backend/` với nội dung cấu hình mẫu sau:
    ```env
    PORT=3000
    MONGODB_URI=mongodb://localhost:27017/quan_ly_muon_sach
    JWT_SECRET=super_secret_key_for_library_system_2026
    NODE_ENV=development
    
    # CORS Origins (Hỗ trợ gọi đa nguồn từ Frontend)
    CORS_PUBLIC_ORIGIN=http://localhost:5173
    CORS_ADMIN_ORIGIN=http://localhost:5173
    ```
4.  **Nạp Dữ Liệu Mẫu (Seed Data)**:
    Hệ thống hỗ trợ script tự động nạp 100 đầu sách thật đã cào, khởi tạo mặc định 3 gói cước hội viên và các tài khoản thử nghiệm. Chạy lệnh:
    ```bash
    npm run seed
    ```
5.  **Khởi động Backend Server**:
    ```bash
    npm run dev
    ```
    Backend sẽ chạy tại: `http://localhost:3000`

---

### Bước 3: Cài đặt và Chạy Frontend

1.  **Mở một cửa sổ Terminal mới và di chuyển vào thư mục frontend**:
    ```bash
    cd B2306569-NguyenTienPhat-BTLon/frontend
    ```
2.  **Cài đặt dependencies**:
    ```bash
    npm install
    ```
3.  **Khởi động Frontend Server (Development)**:
    ```bash
    npm run dev
    ```
    Ứng dụng web sẽ chạy tại: `http://localhost:5173`

---

## 🔑 Tài Khoản Thử Nghiệm

Sau khi chạy lệnh `npm run seed` ở Bước 2, bạn đăng nhập bằng các tài khoản mẫu sau:

| Cổng Đăng Nhập | Tên Đăng Nhập / Email | Mật Khẩu | Lưu Ý Phân Quyền |
| :--- | :--- | :--- | :--- |
| **Quản trị (Admin Portal)** | `NV001` (Mã số nhân viên) | `admin123` | Quyền `QUAN_LY` (Thao tác toàn bộ hệ thống) |
| **Độc giả (Public Site)** | `reader@library.local` | `reader123` | Tài khoản độc giả thông thường (có thể tự đăng ký mới) |

---

## 📡 Danh Sách API Hệ Thống

Tất cả các API được mount dưới tiền tố `/api`. Dưới đây là bảng danh sách các API hoàn chỉnh của hệ thống chia theo phân hệ:

### 1. Phân Hệ Xác Thực & Quản Lý Tài Khoản (`/api/auth` & `/api/users`)

| Method | Endpoint | Quyền Truy Cập | Chức Năng |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/reader/register` | Public | Đăng ký tài khoản độc giả mới |
| `POST` | `/auth/reader/login` | Public | Đăng nhập độc giả |
| `POST` | `/auth/staff/login` | Public | Đăng nhập nhân viên / quản lý |
| `POST` | `/auth/reader/reset-password` | Public | Khôi phục mật khẩu độc giả |
| `POST` | `/auth/reader/change-password` | Public | Thay đổi mật khẩu độc giả (ngoài trang chủ) |
| `POST` | `/auth/staff/change-password` | Public | Thay đổi mật khẩu nhân viên (ngoài trang quản trị) |
| `POST` | `/auth/logout` | Authenticated | Đăng xuất khỏi hệ thống (xóa cookie) |
| `GET` | `/auth/me` | Authenticated | Lấy thông tin tài khoản hiện tại |
| `GET` | `/users/me` | Authenticated | Lấy thông tin cá nhân độc giả đang đăng nhập |
| `PUT` | `/users/me` | Authenticated | Cập nhật thông tin cá nhân độc giả |
| `PUT` | `/users/me/password` | Authenticated | Độc giả đổi mật khẩu cá nhân |
| `PUT` | `/staff/me/password` | STAFF | Nhân viên đổi mật khẩu cá nhân |

### 2. Quản Lý Độc Giả & Nhân Viên (Dành Cho Admin - `/api/admin`)

| Method | Endpoint | Quyền Truy Cập | Chức Năng |
| :--- | :--- | :--- | :--- |
| `GET` | `/admin/readers/search-suggestions` | STAFF | Gợi ý tìm kiếm độc giả khi gõ từ khóa |
| `GET` | `/admin/readers` | STAFF | Lấy danh sách độc giả (phân trang, lọc, tìm kiếm) |
| `GET` | `/admin/readers/:id` | STAFF | Xem chi tiết thông tin độc giả |
| `POST` | `/admin/readers/:id/toggle-status` | STAFF | Khóa / Kích hoạt lại tài khoản độc giả |
| `DELETE` | `/admin/readers/:id` | STAFF | Xóa mềm tài khoản độc giả |
| `POST` | `/admin/readers/:id/restore` | STAFF | Khôi phục tài khoản độc giả đã bị xóa mềm |
| `GET` | `/admin/staffs/next-code` | Root Admin (`QUAN_LY`) | Lấy mã số nhân viên tự động tiếp theo |
| `GET` | `/admin/staffs/search-suggestions` | Root Admin (`QUAN_LY`) | Gợi ý tìm kiếm nhân viên |
| `GET` | `/admin/staffs` | Root Admin (`QUAN_LY`) | Lấy danh sách nhân viên |
| `POST` | `/admin/staffs` | Root Admin (`QUAN_LY`) | Tạo mới tài khoản nhân viên |
| `PUT` | `/admin/staffs/:id` | Root Admin (`QUAN_LY`) | Cập nhật thông tin nhân viên |
| `DELETE` | `/admin/staffs/:id` | Root Admin (`QUAN_LY`) | Xóa mềm tài khoản nhân viên |
| `POST` | `/admin/staffs/:id/restore` | Root Admin (`QUAN_LY`) | Khôi phục nhân viên đã bị xóa mềm |

### 3. Phân Hệ Sách & Danh Mục (`/api/books` & `/api/categories`...)

| Method | Endpoint | Quyền Truy Cập | Chức Năng |
| :--- | :--- | :--- | :--- |
| `GET` | `/books` | Public | Lấy danh sách đầu sách (phân trang, lọc, tìm kiếm) |
| `GET` | `/books/search-suggestions` | Public | Gợi ý từ khóa tìm kiếm sách |
| `GET` | `/books/:id` | Public | Lấy chi tiết thông tin một đầu sách |
| `GET` | `/categories` | Public | Lấy danh sách toàn bộ các thể loại sách |
| `GET` | `/authors` | Public | Lấy danh sách toàn bộ các tác giả |
| `GET` | `/publishers` | Public | Lấy danh sách toàn bộ các nhà xuất bản |
| `POST` | `/books/:id/reviews` | READER | Gửi đánh giá & bình luận về sách |
| `DELETE` | `/books/:id/reviews` | READER | Xóa đánh giá của mình đã viết |
| `POST` | `/books/:id/like-toggle` | READER | Thích / Bỏ thích đầu sách |
| `POST` | `/categories` | STAFF | Tạo mới thể loại sách |
| `PUT` | `/categories/:id` | STAFF | Cập nhật tên/thông tin thể loại sách |
| `DELETE` | `/categories/:id` | STAFF | Xóa thể loại sách |
| `POST` | `/books` | STAFF | Tạo mới đầu sách (BookTitle) |
| `PUT` | `/books/:id` | STAFF | Cập nhật thông tin đầu sách |
| `DELETE` | `/books/:id` | STAFF | Xóa mềm đầu sách |
| `GET` | `/books/:bookId/copies` | STAFF | Lấy danh sách tất cả bản sao (BookCopy) của đầu sách |
| `POST` | `/book-copies` | STAFF | Thêm bản sao sách mới |
| `PUT` | `/book-copies/:id` | STAFF | Cập nhật mã bản sao, tình trạng hoặc vị trí sách |
| `DELETE` | `/book-copies/:id` | STAFF | Xóa mềm bản sao sách |
| `POST` | `/authors` | STAFF | Tạo mới tác giả |
| `PUT` | `/authors/:id` | STAFF | Cập nhật thông tin tác giả |
| `POST` | `/publishers` | STAFF | Tạo mới nhà xuất bản |
| `PUT` | `/publishers/:id` | STAFF | Cập nhật thông tin nhà xuất bản |

### 4. Phân Hệ Mượn Trả & Phiếu Phạt (`/api/borrowing`)

| Method | Endpoint | Quyền Truy Cập | Chức Năng |
| :--- | :--- | :--- | :--- |
| `POST` | `/borrowing/receipts` | READER | Đăng ký mượn sách mới (tạo Phiếu Mượn) |
| `GET` | `/borrowing/my-receipts` | READER | Lấy danh sách phiếu mượn cá nhân độc giả |
| `GET` | `/borrowing/receipts` | STAFF | Xem toàn bộ phiếu mượn hệ thống (lọc theo trạng thái) |
| `GET` | `/borrowing/receipts/:id` | Authenticated | Xem chi tiết thông tin một phiếu mượn |
| `POST` | `/borrowing/receipts/:id/approve` | STAFF | Duyệt phiếu mượn (để nhân viên chuẩn bị sách) |
| `POST` | `/borrowing/receipts/:id/pickup` | STAFF | Xác nhận độc giả đã đến nhận sách thực tế |
| `POST` | `/borrowing/receipts/:id/return` | STAFF | Xác nhận độc giả trả sách (và kiểm tra hạn trả) |
| `POST` | `/borrowing/receipts/:id/renew` | READER | Gia hạn thêm thời gian mượn sách |
| `POST` | `/borrowing/receipts/:id/cancel` | Authenticated | Hủy yêu cầu mượn sách (khi chưa nhận sách) |
| `POST` | `/borrowing/receipts/:id/pay` | Authenticated | Thanh toán tiền đặt cọc/chi phí của phiếu mượn |
| `GET` | `/borrowing/penalties` | STAFF | Lấy danh sách toàn bộ phiếu phạt trong hệ thống |
| `POST` | `/borrowing/penalties` | STAFF | Tạo phiếu phạt thủ công (ví dụ: mất sách, hỏng sách) |
| `GET` | `/borrowing/my-penalties` | READER | Xem danh sách phiếu phạt của độc giả hiện tại |
| `POST` | `/borrowing/penalties/:id/pay` | STAFF, READER | Thanh toán số tiền phạt của phiếu phạt |
| `GET` | `/borrowing/my-financial-stats` | READER | Xem thống kê số tiền đã đóng/phạt cá nhân |
| `GET` | `/borrowing/financial-stats` | STAFF | Xem tổng hợp doanh thu đặt cọc, thu phí phạt toàn hệ thống |

### 5. Phân Hệ Hội Viên VIP (`/api/memberships`)

| Method | Endpoint | Quyền Truy Cập | Chức Năng |
| :--- | :--- | :--- | :--- |
| `GET` | `/memberships/plans` | Public | Lấy danh sách các gói cước VIP/Hội viên |
| `POST` | `/memberships/subscribe` | READER | Đăng ký gói VIP (gửi yêu cầu thanh toán) |
| `GET` | `/memberships/my-subscriptions` | READER | Xem thông tin gói hội viên đang hoạt động của mình |
| `POST` | `/memberships/join-family` | READER | Dùng mã mời để gia nhập nhóm Family gói VIP |
| `POST` | `/memberships/cancel-auto-renew` | READER | Hủy tự động gia hạn gói VIP |
| `POST` | `/memberships/enable-auto-renew` | READER | Bật lại tự động gia hạn gói VIP |
| `GET` | `/memberships/subscriptions` | STAFF | Xem danh sách tất cả các độc giả đăng ký VIP |
| `POST` | `/memberships/plans` | STAFF | Tạo mới một gói hội viên |
| `PUT` | `/memberships/plans/:id` | STAFF | Cập nhật thông tin gói hội viên |
| `DELETE` | `/memberships/plans/:id` | STAFF | Xóa gói hội viên |

### 6. Phân Hệ Khuyến Mãi & Cấu Hình Hệ Thống (`/api/discounts` & `/api/settings`)

| Method | Endpoint | Quyền Truy Cập | Chức Năng |
| :--- | :--- | :--- | :--- |
| `POST` | `/discounts` | STAFF | Tạo mã giảm giá mới |
| `GET` | `/discounts` | STAFF | Lấy danh sách tất cả mã giảm giá hệ thống |
| `PUT` | `/discounts/:id` | STAFF | Cập nhật thông tin mã giảm giá |
| `DELETE` | `/discounts/:id` | STAFF | Xóa mã giảm giá |
| `POST` | `/discounts/validate` | READER | Kiểm tra & áp dụng mã giảm giá khi đăng ký gói VIP |
| `GET` | `/settings/:key` | Public | Lấy thông tin cấu hình giao diện/hệ thống theo key |
| `PUT` | `/settings/:key` | STAFF | Cập nhật thông tin cấu hình hệ thống theo key |
| `POST` | `/settings/upload-image` | STAFF | Tải ảnh cấu hình hệ thống (Base64) |

---

## 🧪 Chạy Kiểm Thử (Verification)

Hệ thống hỗ trợ sẵn bộ test suite kiểm định logic API và race condition. Để chạy test, mở Terminal tại thư mục `backend/` và thực thi:

```bash
# Chạy toàn bộ các test suite
npm test

# Hoặc chạy kiểm tra đơn lẻ từng module:
node src/tests/auth.test.js          # Xác thực & Phân quyền
node src/tests/books.test.js         # Đầu sách, Bản sao & Catalog
node src/tests/borrowing.test.js     # Quy trình Mượn/Trả sách
node src/tests/memberships.test.js   # Đăng ký gói VIP
node src/tests/discounts.test.js     # Khuyến mãi & Áp mã giảm giá
```

---

## 📱 Tính Năng Độc Đáo: Giả Lập Quét Mã QR Thanh Toán
*   Khi Độc giả nâng cấp lên gói VIP (ví dụ: Gói VIP đọc sách), giao diện sẽ hiển thị một **Mã QR động chuẩn VietQR** (chuyển khoản thực tế đến ngân hàng MB). Bạn có thể dùng điện thoại thật để quét thử để thấy thông tin tự động điền (tên ngân hàng, số tiền và nội dung).
*   Đồng thời, kế bên mã QR có tích hợp một **Widget giả lập điện thoại**. Bạn chỉ cần click nút quét trên điện thoại ảo này để mô phỏng quá trình giao dịch thành công ngay trên màn hình mà không cần tốn chi phí chuyển khoản thực tế.
