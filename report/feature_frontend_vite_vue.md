<!--
Chức năng: Báo cáo tính năng phát triển giao diện Frontend bằng Vite + Vue 3 + Tailwind CSS
Lý do tạo: Ghi nhận kiến trúc, cấu trúc thư mục, các trang Độc giả & Admin, cơ chế phân quyền, giỏ mượn sách và VietQR payment simulator
Link trích dẫn: guideline.md, database_schema.md, book_borrowing_system.md
-->

# Báo Cáo Tính Năng: Phát Triển Giao Diện Frontend (Vite + Vue 3 + Tailwind CSS)

Báo cáo này ghi nhận kết quả phát triển phần giao diện (Frontend) cho **Hệ Thống Mượn Sách Online** sử dụng Vite, Vue 3 (Composition API), Pinia (State Management), Vue Router và Tailwind CSS với màu chủ đạo là Ocean Blue.

---

## 1. Trạng Thái Hoàn Thành

| STT | Thành phần giao diện | Trạng thái | Chi tiết thiết kế / Công nghệ |
| :--- | :--- | :--- | :--- |
| 1 | Khởi tạo dự án Vite Vue | `[HOÀN THÀNH]` | Cấu hình thành công dự án trong thư mục `frontend/`, sử dụng Vue 3, Pinia và Vue Router 4. |
| 2 | Cấu hình Tailwind CSS v3 | `[HOÀN THÀNH]` | Thiết lập bảng màu Ocean Blue chủ đạo kết hợp màu kem ấm (Warm Cream) và font chữ Inter/Playfair Display sang trọng. |
| 3 | Core Stores (Xác thực & Giỏ hàng) | `[HOÀN THÀNH]` | Pinia `auth` store quản lý đăng nhập 2 cổng (Độc giả / Nhân viên). Pinia `cart` store quản lý giỏ mượn sách đồng bộ LocalStorage. |
| 4 | Trang chủ Độc giả (`HomeView.vue`) | `[HOÀN THÀNH]` | Thiết kế banner xanh dương gradient lớn, thanh tìm kiếm thông minh và thanh trượt sách mới nhất. |
| 5 | Catalog & Chi tiết Sách | `[HOÀN THÀNH]` | Trang danh mục hỗ trợ tìm kiếm phân trang có lọc Thể loại. Trang chi tiết sách hiển thị rõ ràng vị trí kệ sách (`viTriKe`) và tình trạng tồn kho. |
| 6 | Đăng ký & Đăng nhập 2 cổng | `[HOÀN THÀNH]` | Đăng ký độc giả mới, Đăng nhập Tab Độc giả (bằng email) và Tab Nhân viên (bằng mã nhân viên `maSoNV`). |
| 7 | Giỏ mượn & Hồ sơ Độc giả | `[HOÀN THÀNH]` | Trang giỏ mượn cho phép chọn ngày hẹn trả, áp dụng mã giảm giá. Trang hồ sơ hiển thị gói thẻ VIP, lịch sử phiếu mượn (được trả từng cuốn) và phiếu phạt. |
| 8 | Giả lập Thanh toán VietQR | `[HOÀN THÀNH]` | Tạo mã QR động chuẩn VietQR bằng API chuyển khoản thật. Thiết kế **Widget Giả Lập Điện Thoại (Phone Mockup)** cho phép bấm nút quét/chuyển khoản trực tiếp trên màn hình web. |
| 9 | Sidebar Admin Layout | `[HOÀN THÀNH]` | Layout Admin chuyên nghiệp với sidebar màu tối, phân quyền hiển thị (chỉ Quản lý mới thấy được tab Quản lý nhân viên). |
| 10 | Dashboard quản trị | `[HOÀN THÀNH]` | Thống kê số lượng sách, độc giả, phiếu đang mượn, phiếu quá hạn và danh sách các hoạt động mượn sách mới nhất. |
| 11 | Admin CRUD Đầu sách & Bản sao | `[HOÀN THÀNH]` | Quản lý đầu sách (thêm/sửa, ngừng phục vụ Drain strategy). Quản lý chi tiết bản sao vật lý (đổi kệ, đổi tình trạng bảo trì/mất). |
| 12 | Admin Duyệt mượn/trả sách | `[HOÀN THÀNH]` | Ghi nhận trả sách (hỗ trợ check trả sách từng cuốn/từng phần), tự động tính tiền phạt quá hạn và xác nhận. |
| 13 | Admin CRUD Độc giả & Nhân viên | `[HOÀN THÀNH]` | Xem danh sách độc giả (khóa/mở khóa, xóa mềm). CRUD nhân viên thủ thư cấp tài khoản mới. |
| 14 | Admin CRUD Gói cước & Mã giảm | `[HOÀN THÀNH]` | CRUD gói hội viên (`MembershipPlan`) và mã khuyến mãi giảm giá (`DiscountCode`). |

---

## 2. Cấu Trúc Thư Mục Frontend

```text
frontend/
├── index.html                  # Khai báo font chữ Google Fonts & Mount root
├── package.json                # Danh sách dependencies (Vue, Router, Pinia, Axios, Lucide)
├── tailwind.config.js          # Khai báo hệ màu xanh chủ đạo
├── postcss.config.js           # Cấu hình postcss
├── src/
│   ├── main.js                 # Khởi tạo App, gắn Router & Pinia
│   ├── App.vue                 # Phân tách layout Độc giả / Layout Admin
│   ├── style.css               # Import Tailwind layers
│   ├── services/
│   │   └── api.js              # Axios client (cấu hình withCredentials: true để nhận cookie)
│   ├── stores/
│   │   ├── auth.js             # State quản lý đăng nhập & thông tin User
│   │   └── cart.js             # State quản lý giỏ sách mượn (đọc/ghi LocalStorage)
│   ├── router/
│   │   └── index.js            # Định tuyến toàn bộ hệ thống & Navigation Guards phân quyền
│   └── views/
│       ├── HomeView.vue        # Trang chủ độc giả
│       ├── BookCatalogView.vue # Catalog tìm kiếm & phân trang
│       ├── BookDetailView.vue  # Chi tiết sách (vị trí kệ, tồn kho)
│       ├── CartView.vue        # Giỏ sách mượn, chọn ngày hẹn trả, áp coupon
│       ├── ProfileView.vue     # Hồ sơ độc giả (VIP badge, phiếu mượn, phiếu phạt)
│       ├── MembershipsView.vue # Danh sách gói hội viên & Widget QR Pay Phone Mockup
│       ├── LoginView.vue       # Đăng nhập 2 cổng
│       ├── RegisterView.vue    # Đăng ký độc giả
│       └── admin/
│           ├── AdminLayout.vue # Sidebar layout admin
│           ├── AdminDashboardView.vue # Dashboard thống kê số liệu
│           ├── AdminBooksView.vue # CRUD đầu sách & Drain Strategy
│           ├── AdminCopiesView.vue # Quản lý cuốn sách vật lý (kệ, bảo trì, mất)
│           ├── AdminBorrowingView.vue # Duyệt mượn/trả sách từng phần
│           ├── AdminReadersView.vue # Quản lý độc giả (khóa, xóa mềm)
│           ├── AdminStaffsView.vue # CRUD nhân sự (chỉ dành cho Quản lý)
│           └── AdminSettingsView.vue # CRUD Gói hội viên & Mã giảm giá
```

---

## 3. Các Điểm Nổi Bật Về UX/UI & Trải Nghiệm Tương Tác

### 3.1. VietQR Payment & Phone Mockup Simulator
*   Khi độc giả click "Đăng ký gói" hội viên VIP, một modal thanh toán hiện đại được mở lên.
*   **Bên trái**: Chứa mã QR được tạo tự động từ VietQR API (`img.vietqr.io`). Khi quét bằng điện thoại thật, ứng dụng ngân hàng sẽ tự điền: Ngân hàng MB, Số tài khoản, Số tiền gói cước, và nội dung chuyển khoản chuẩn format: `DK <Mã_Gói> <Mã_Độc_Giả>`.
*   **Bên phải**: Một mô hình điện thoại giả lập sống động hiển thị giao diện Camera Quét Mã. Người dùng có thể click trực tiếp nút quét trên điện thoại giả lập để mô phỏng hoàn tất giao dịch tức thì mà không cần chuyển khoản thật.

### 3.2. Responsive & Dynamic Layouts
*   Ứng dụng được tối ưu hóa hiển thị trên mọi thiết bị di động, máy tính bảng và màn hình lớn.
*   Header công cộng tự động hiển thị dropdown tài khoản, biểu tượng giỏ mượn kèm badge thông báo số lượng có hiệu ứng chuyển động rung (pulse) thu hút chú ý.
*   Sidebar Admin được bo góc mềm mại, hiển thị các icon tối giản (Lucide Icons) giúp giao diện sạch sẽ và cao cấp.

---

## 4. Kiểm Định Build Production

Chạy lệnh build production thành công 100%:
```bash
npm run build
```
Kết quả cho ra thư mục `dist/` đóng gói sẵn sàng triển khai hosting tĩnh (Vercel, Netlify, Github Pages...) với dung lượng file chunk tối ưu.

---

## 5. Hướng Dẫn Chạy Cục Bộ (Local)

1.  **Chạy Backend**:
    ```bash
    cd backend
    npm run dev
    ```
    (Server lắng nghe tại `http://localhost:3000`)

2.  **Chạy Frontend**:
    ```bash
    cd frontend
    npm run dev
    ```
    (Mở trình duyệt tại `http://localhost:5173`)
