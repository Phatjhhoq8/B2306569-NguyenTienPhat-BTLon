<!--
Chức năng: Quy tắc thiết kế và phát triển Hệ thống Mượn Sách Online (Book Borrowing System)
Lý do tạo: Thiết lập chuẩn kiến trúc, quy trình phát triển, chuẩn UI/UX và logic nghiệp vụ mượn/trả sách theo mô hình Fahasa kết hợp với UI/UX Skills.
Link trích dẫn tham khảo: https://www.fahasa.com/?utm_source=chatgpt.com
-->

# Quy Tắc Phát Triển Hệ Thống Mượn Sách Online (Book Borrowing System Rule)

## 1. Tổng Quan Dự Án & Định Hướng
- **Mục tiêu**: Xây dựng hệ thống mượn/thuê sách giấy online với trải nghiệm người dùng hiện đại, trực quan, hỗ trợ tra cứu, đăng ký mượn sách, quản lý phiếu mượn và theo dõi lịch sử trả sách.
- **Tham khảo mô hình**: [Fahasa](https://www.fahasa.com/?utm_source=chatgpt.com) - Giao diện hiện đại, thông tin rõ ràng, đặt mượn tiện lợi, quản lý trạng thái mượn/trả tường minh.
- **Bộ Skill UI/UX áp dụng**: `ux-ui-agent-skills-main` (Typography sắc nét, hệ màu hài hòa, micro-interactions, responsive & accessibility).

---

## 2. Nguyên Tắc Tái Sử Dụng & Tổ Chức Code (Modular Architecture)

### 🚨 Audit Trước Khi Tạo Hàm/Component Mới (Kiểm Tra Trước Khi Viết)
- **BẮT BUỘC**: Trước khi viết một function, helper, composable hoặc UI component mới, PHẢI kiểm tra codebase để xem tính năng/hàm đó đã tồn tại hay chưa.
- **Tái sử dụng tối đa**: Nếu hàm/component đã có, ưu tiên import và sử dụng lại. Nếu cần mở rộng, hãy truyền thêm tham số (options/props) thay vì tạo mới một hàm trùng lặp.
- **Đơn giản hóa (KISS - Keep It Simple, Stupid)**: Ưu tiên cách viết trực quan, ngắn gọn, dễ hiểu thay vì over-engineering.

### 📁 Phân Chia Thư Mục Chuẩn Modular (Tuyệt Đối Không Gom 1 File)
Hệ thống phải được chia thành các module/file nhỏ gọn (< 150-200 dòng/file). Mỗi file giữ một trách nhiệm duy nhất (Single Responsibility Principle).

#### Cấu Trúc Frontend (Vue 3 + Vite)
```text
src/
├── assets/             # Images, global styles, main.css
├── components/
│   ├── ui/             # Component UI dùng chung: BaseButton, BaseModal, BaseBadge, BaseInput...
│   └── features/       # Component nghiệp vụ: BookCard, BorrowCartDrawer, UserBorrowHistory...
├── composables/        # Logic tái sử dụng: useBookSearch.js, useBorrowCart.js, useAuth.js...
├── stores/             # Pinia stores: bookStore.js, borrowStore.js, authStore.js...
├── views/              # Các trang chính: HomeView, BookDetailView, CartView, AdminDashboard...
├── utils/              # Pure functions: formatDate.js, formatCurrency.js, validateForm.js...
└── router/             # Vue Router index.js và routes definitions
```

#### Cấu Trúc Backend (Node.js Modular Design)
```text
src/
├── config/             # DB connection, env configs
├── middlewares/        # Auth guard, error handler, validation middleware
├── utils/              # Helper functions: jwtHelper.js, resultResponse.js, dateCalc.js
└── modules/            # Chia theo từng domain/feature:
    ├── books/          # book.model.js, book.service.js, book.controller.js, book.routes.js
    ├── borrowing/      # borrowing.model.js, borrowing.service.js, borrowing.controller.js, borrowing.routes.js
    └── users/          # user.model.js, user.service.js, user.controller.js, user.routes.js
```

---

## 3. Tech Stack & Kiến Trúc Kỹ Thuật

### Frontend (Vue.js + Tailwind CSS)
- **Framework**: Vue 3 (`<script setup>`, Composition API).
- **Styling**: Tailwind CSS (kết hợp CSS Variables cho design tokens: colors, spacing, shadows).
- **State Management**: Pinia (Store dạng functional composition API `defineStore`).
- **Routing**: Vue Router 4.
- **Icons & Asset**: Lucide Icons / Heroicons, ảnh bìa sách chất lượng cao.

### Backend (Node.js + MongoDB)
- **Runtime & Server**: Node.js (Express.js / Fastify).
- **Database**: MongoDB với Mongoose ODM (Schema chặt chẽ, type safety & indexes tối ưu tìm kiếm).
- **Authentication**: JWT (JSON Web Tokens) / HTTP-only Cookies, Phân quyền Role-based Access Control (RBAC: `ADMIN`, `LIBRARIAN`, `MEMBER`).

---

## 4. Quy Chuẩn Lập Trình (Strict Functional Programming)
- **Immutability**: Sử dụng `const` làm mặc định, hạn chế `let`/`var`. Sử dụng `map()`, `filter()`, `reduce()` thay cho vòng lặp imperative (`for`, `while`).
- **Pure Functions**: Tách biệt logic nghiệp vụ (tính phí mượn, tính ngày trễ hạn, kiểm tra số lượng sách khả dụng) thành các pure functions dễ test và không gây side-effect.
- **Error Handling**: Xử lý lỗi tường minh theo Result Pattern (`{ success: true, data }` hoặc `{ success: false, error }`), try-catch bao bọc đầy đủ tại các điểm IO (API call, Database query).
- **Code Cleanliness**: Hàm ngắn gọn (< 30 dòng), thực hiện duy nhất 1 nhiệm vụ. Không lặp lại logic (DRY), tái sử dụng composables và utils có sẵn.
- **Test-Driven Development (TDD)**: BẮT BUỘC luôn tạo/viết các kịch bản kiểm thử (test cases) TRƯỚC KHI viết mã nguồn logic xử lý thực tế để định hình nghiệp vụ và đảm bảo tính đúng đắn.

---

## 5. Nguyên Tắc Thiết Kế UI/UX

### Palette Màu Sắc (Ocean Blue Inspired & Modern Library Aesthetic)
- **Primary Color**: Deep Ocean Blue (`#0f4c81` / `#1e40af`) - Tạo cảm giác tin cậy, bình yên và chuyên nghiệp của một thư viện số hiện đại.
- **Secondary / Accent**: Soft Sky Blue / Warm Cream (`#e0f2fe` / `#fef3c7`) - Giúp cân bằng thị giác và làm nổi bật các thành phần giao diện.
- **Neutral Dark**: `#1f2937` (Charcoal Text).
- **Neutral Light**: `#f9fafb` / `#ffffff` (Card background, clean contrast).
- **Status Colors**:
  - `Available` (Khả dụng): Soft Green (`#10b981`)
  - `Borrowed` / `Out of stock` (Hết sách/Đang mượn): Soft Amber (`#f59e0b`)
  - `Overdue` (Trễ hạn): Crimson Red (`#ef4444`)

### Typography
- **Headings**: Serif font sang trọng (như `Playfair Display` hoặc `Merriweather`) cho banner và tiêu đề sách chính.
- **Body & UI Controls**: Modern Sans-Serif (như `Inter` hoặc `Plus Jakarta Sans`) sắc nét, dễ đọc trên mọi thiết bị.

### Micro-Interactions & UX Requirements
- **Book Cards**: Animation hover nổi nhẹ (`hover:-translate-y-1 hover:shadow-lg transition-all duration-300`), hiển thị tag trạng thái "Còn sách" / "Hết sách".
- **Instant Search & Filter**: Tìm kiếm sách theo từ khóa (tên sách, tác giả, ISBN), bộ lọc theo Thể loại và Trạng thái còn sách.
- **Borrow Cart (Giỏ mượn sách)**: Drawer/Modal mượt mà, hiển thị danh sách sách chọn mượn, tính tổng ngày mượn và ước tính ngày trả.
- **Dashboard / User Profile**: Quản lý sách đang mượn, lịch sử mượn, nút yêu cầu gia hạn (`Renew`) chỉ 1-click.

---

## 6. Model Dữ Liệu Cốt Lõi (MongoDB Schemas)

### `User`
```ts
{
  name: String,
  email: String,
  phone: String,
  role: 'MEMBER' | 'LIBRARIAN' | 'ADMIN',
  membershipPackage: { type: String, expireAt: Date },
  status: 'ACTIVE' | 'SUSPENDED'
}
```

### `Book`
```ts
{
  title: String,
  slug: String,
  author: String,
  category: ObjectId (ref: 'Category'),
  isbn: String,
  description: String,
  coverImage: String,
  totalCopies: Number,
  availableCopies: Number,
  location: String, // Vị trí kệ sách
  rating: Number
}
```

### `BorrowRecord`
```ts
{
  borrowCode: String,
  user: ObjectId (ref: 'User'),
  books: [{ book: ObjectId (ref: 'Book'), quantity: Number }],
  borrowDate: Date,
  dueDate: Date,
  returnDate: Date | null,
  status: 'PENDING' | 'BORROWED' | 'RETURNED' | 'OVERDUE' | 'CANCELLED',
  fineAmount: Number,
  notes: String
}
```

---

## 7. Quy Định Báo Cáo (Reporting Rule)

### 📝 BẮT BUỘC Ghi Báo Cáo Sau Khi Hoàn Thành Tính Năng
- Sau khi code và verify xong bất kỳ tính năng nào, agent **BẮT BUỘC** phải tạo/cập nhật một tệp báo cáo chi tiết nằm trong thư mục `report/`.
- **Cấu trúc tệp báo cáo**: `report/feature_<tên_tính_năng>.md` hoặc ghi nhận vào `report/progress_log.md`.
- **Nội dung tệp báo cáo bao gồm**:
  1. **Tên tính năng & Mô tả**: Mục đích và chức năng đã phát triển.
  2. **Các tệp đã thay đổi/tạo mới**: Danh sách đường dẫn tệp (kèm link `file://`).
  3. **Chi tiết triển khai**: Giải thích ngắn gọn cách xử lý logic/UI.
  4. **Hướng dẫn Kiểm tra / Command verify**: Các lệnh test/build hoặc thao tác UI để kiểm định thành công.

---

## 8. Quy Trình Kiểm Tra & Xác Nhận (Verification)
Sau khi hoàn thành từng tính năng hoặc component:
- **Linting & Code Quality**: Run `npm run lint` / `npm run check`.
- **Frontend Verification**: Đảm bảo component responsive mượt mà trên Mobile (375px), Tablet (768px) và Desktop (1280px).
- **Backend Verification**: Kiểm tra API endpoints với cURL / Postman / Integration test, đảm bảo xử lý lỗi trôi chảy khi hết sách hoặc trễ hạn.
- **Reporting**: Tạo bài báo cáo chi tiết vào thư mục `report/`.

---

## 9. Scripts Thu Thập Dữ Liệu & Quy Trình Seeding (Crawler & Seeding)

Hệ thống cung cấp sẵn các công cụ thu thập dữ liệu (crawl) sách thực tế và nạp dữ liệu mẫu (seed) vào cơ sở dữ liệu để phục vụ kiểm thử và phát triển.

### 🕷️ Bộ Công Cụ Crawler (Cào dữ liệu)
Nằm trong thư mục [backend/src/scripts](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/scripts):
- **Script chính**: [scrapeBooks.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/scripts/scrapeBooks.js) điều phối việc cào từ Fahasa (`fahasaScraper.js`) và Phương Nam (`phuongnamScraper.js`).
- **Cách chạy**:
  - `node src/scripts/scrapeBooks.js` (Mặc định cào cả 2 nguồn, giới hạn 100 cuốn).
  - `node src/scripts/scrapeBooks.js --source=fahasa` (Chỉ cào Fahasa).
  - `node src/scripts/scrapeBooks.js --source=phuongnam` (Chỉ cào Phương Nam).
  - `node src/scripts/scrapeBooks.js --max=50` (Giới hạn số lượng sách cào).
- **Dữ liệu xuất ra**: Lưu trong thư mục `output/` với định dạng JSON:
  - [scraped_books.json](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/scripts/output/scraped_books.json): Tập hợp sách cào được.
  - Cấu trúc bản ghi thô (Scraped Book Schema):
    ```json
    {
      "tenSach": "Tên sách",
      "tacGia": ["Tên tác giả"],
      "nhaXuatBan": "Nhà xuất bản",
      "theLoai": "Thể loại",
      "giaBia": 135000,
      "giaGoc": 150000,
      "hinhAnhUrl": "https://...",
      "hinhAnhLocal": "images/fahasa/ten-file.jpg",
      "moTa": "Mô tả nội dung sách...",
      "isbn": "Mã ISBN",
      "namSanXuat": 2026,
      "url": "Link gốc",
      "nguon": "fahasa" | "phuongnam"
    }
    ```

### 🌱 Quy Trình Seeding (Nạp dữ liệu mẫu)
- **Script Seeding**: [seedFromScrapedBooks.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/scripts/seedFromScrapedBooks.js) nạp dữ liệu từ [scraped_books.json](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/scripts/output/scraped_books.json) vào MongoDB.
- **Dữ liệu được nạp bao gồm**:
  - **Nhân viên mẫu (Staff)**:
    - Mã: `NV001` (Tên: Quản lý hệ thống)
    - Email: `admin@library.local` / Mật khẩu: `admin123` (Chức vụ: `QUAN_LY`)
  - **Độc giả mẫu (Reader)**:
    - Mã: `DG...` (Tên: Nguyễn Văn Độc Giả)
    - Email: `reader@library.local` / Mật khẩu: `reader123`
  - **Gói Membership (MembershipPlan)**: Tiêu chuẩn (0đ), Đọc VIP (99.000đ), Gia đình (199.000đ).
  - **Đầu sách (BookTitle)**: Seed toàn bộ sách đã cào, tự động ánh xạ đường dẫn ảnh bìa cục bộ vào `/uploads/books` và gán từ khóa tìm kiếm (`tuKhoa`).
- **Cách chạy**:
  - `node src/scripts/seedFromScrapedBooks.js` (Bảo đảm MongoDB đang chạy và tệp cấu hình `.env` được cài đặt đúng).

### 🛠️ Quy Định Phát Triển
- BẮT BUỘC sử dụng tập dữ liệu đã cào này hoặc chạy script seed khi thiết lập môi trường phát triển mới.
- Hạn chế tạo dữ liệu giả lập thủ công thiếu thực tế, làm giảm chất lượng trải nghiệm UI.
- Mọi chỉnh sửa đối với schema `Book` hoặc `BookTitle` trong mã nguồn backend đều phải kiểm tra và cập nhật lại logic chuyển đổi trong file [seedFromScrapedBooks.js](file:///c:/Users/Admin/Desktop/CT449-ptudw/B2306569-NguyenTienPhat-BTLon/backend/src/scripts/seedFromScrapedBooks.js) để tránh lỗi runtime khi seeding.

