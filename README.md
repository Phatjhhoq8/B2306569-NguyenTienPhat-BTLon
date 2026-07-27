<!--
Chức năng: Tài liệu README hướng dẫn cài đặt và vận hành toàn bộ hệ thống
Lý do tạo: Cung cấp hướng dẫn đầy đủ từ cài đặt database, seed dữ liệu sách mẫu, chạy backend, chạy frontend và các tài khoản thử nghiệm.
Link tham chiếu: guideline.md, database_schema.md
-->

# BOOKLAB — Hệ Thống Mượn Sách Online

BOOKLAB là hệ thống mượn sách online hoàn chỉnh, bao gồm ứng dụng Web Độc giả (Public Website) và Cổng Quản trị (Admin/Librarian Portal). Dự án được thiết kế theo kiến trúc Modular, tích hợp cơ chế tự sinh mã an toàn, xử lý tranh chấp mượn trùng (Race Condition), Drain Strategy khi ngừng phục vụ sách và giả lập thanh toán quét mã QR động.

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

Sau khi chạy lệnh `npm run seed` ở Bước 2, bạn có thể đăng nhập bằng các tài khoản mẫu sau:

### Cổng Nhân Viên / Quản trị (Admin Portal)
*   **Mã số nhân viên (maSoNV)**: `NV001`
*   **Mật khẩu**: `admin123`
*   *Lưu ý*: Nhân viên xác thực trực tiếp bằng mã số nhân viên (không dùng email). Chức vụ của tài khoản mẫu này là `QUAN_LY` (Quản lý - được cấp đầy đủ tất cả quyền cấu hình gói hội viên, mã giảm giá và quản lý nhân sự).

### Cổng Độc Giả (Public Site)
*   **Địa chỉ Email**: `reader@library.local`
*   **Mật khẩu**: `reader123`
*   *Lưu ý*: Độc giả đăng nhập bằng địa chỉ email và mật khẩu. Bạn cũng có thể đăng ký một tài khoản độc giả hoàn toàn mới trên giao diện.

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
