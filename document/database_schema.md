<!--
Chức năng: Tài liệu thiết kế CSDL MongoDB chi tiết, Mongoose Schemas đầy đủ ràng buộc, cơ chế Soft Delete, Xử lý Cạnh tranh và Quy trình Drain Strategy khi xóa Đầu sách đang mượn gối đầu.
Lý do tạo: Chuyển đổi và chuẩn hóa sơ đồ CDM (document/erd.cdm) sang NoSQL MongoDB, giải quyết triệt để bài toán vòng lặp mượn liên tục khi xóa Đầu Sách.
Link trích dẫn tham khảo: https://www.fahasa.com/?utm_source=chatgpt.com
-->

# Tài Liệu Thiết Kế CSDL MongoDB & Mongoose Schemas (Có Ràng Buộc Dữ Liệu & Quy Trình Quản Lý Sách)

Tài liệu này định nghĩa chi tiết **12 Collections** của hệ thống CSDL NoSQL MongoDB cho dự án **Hệ Thống Mượn Sách Online**, được chuẩn hóa từ sơ đồ Conceptual Data Model (`document/erd.cdm`) và giải quyết bài toán: **Xóa Đầu Sách khi có người mượn gối đầu (Drain Strategy / Khóa mượn mới tức thì)**.

---

## 📌 1. Danh Sách Collections & Bản Đồ Ràng Buộc (Constraints Summary)

| Collection | Tên Model Mongoose | Thuộc tính Khóa Duy Nhất | Cấu Trúc Mã Tự Động (Auto Code Format) | Ràng buộc chính (Primary Constraints) |
| :--- | :--- | :--- | :--- | :--- |
| **`publishers`** | `Publisher` | `maNXB` | `NXB` + 3 chữ số (`NXB001`) | Số điện thoại đúng định dạng, Tên NXB không rỗng |
| **`authors`** | `Author` | `maTacGia` | `TG` + 4 chữ số (`TG0001`) | Tên tác giả không rỗng |
| **`categories`** | `Category` | `maTheLoai` | `TL` + 3 chữ số (`TL001`) | Tên thể loại không rỗng |
| **`book_titles`** | `BookTitle` | `maDauSach` | `DS` + 5 chữ số (`DS00001`) | Tối thiểu 1 Tác giả (`ref`), Tích hợp `isDeleted` & `trangThai` |
| **`book_copies`** | `BookCopy` | `maSach` | `BS` + 6 chữ số (`BS000001`) | Enum trạng thái (`CHO_MUON`, `DA_MUON`, `BAO_TRI`, `MAT`), Tích hợp `isDeleted` |
| **`readers`** | `Reader` | `maDocGia` | `DG` + 5 chữ số (`DG00001`) | Validation Email regex, SĐT regex, Mật khẩu >= 6 ký tự |
| **`staffs`** | `Staff` | `maSoNV` | `NV` + 3 chữ số (`NV001`) | Enum chức vụ (`THU_THU`, `QUAN_LY`), Mật khẩu >= 6 ký tự |
| **`membership_plans`** | `MembershipPlan` | `maGoi` | `GOI` + 3 chữ số (`GOI001`) | Giá tiền >= 0, Số sách tối đa >= 1, Số ngày mượn >= 1 |
| **`subscriptions`** | `Subscription` | `maDangKy` | `DK` + 6 chữ số (`DK000001`) | Validator: `ngayKetThuc > ngayBatDau`, Enum trạng thái |
| **`borrow_receipts`** | `BorrowReceipt` | `maPhieu` | `PM` + 6 chữ số (`PM000001`) | Chi tiết mượn nhúng Array (Subdocument), Validator `ngayHenTra >= ngayMuon` |
| **`penalty_tickets`** | `PenaltyTicket` | `maPhieuPhat` | `PP` + 6 chữ số (`PP000001`) | Số tiền phạt >= 0, Tham chiếu phiếu mượn & nhân viên lập |
| **`discount_codes`** | `DiscountCode` | `maCode` | `KM` + YYYYMM + 3 chữ số (`KM202607001`) | Giá trị giảm >= 0, Validator `ngayKetThuc > ngayBatDau` |

---

### 1.1. Quy Định Cấu Trúc Mã Tự Động Chi Tiết

Mọi mã định danh (Primary Key / Unique Code) trong hệ thống đều được **sinh tự động (Auto-generated)** thông qua Service/Middleware hoặc Counter Collection trước khi lưu vào CSDL. Người dùng/Nhân viên không phải nhập mã thủ công.

#### Chi tiết quy chuẩn mã tự động của từng bảng:
1. **Nhà Xuất Bản (`Publisher.maNXB`)**:
   - **Định dạng**: `NXB` + 3 chữ số tự tăng (Pad 0).
   - **Ví dụ**: `NXB001`, `NXB002`, ..., `NXB999`.
2. **Tác Giả (`Author.maTacGia`)**:
   - **Định dạng**: `TG` + 4 chữ số tự tăng.
   - **Ví dụ**: `TG0001`, `TG0002`, ..., `TG9999`.
3. **Thể Loại Sách (`Category.maTheLoai`)**:
   - **Định dạng**: `TL` + 3 chữ số tự tăng.
   - **Ví dụ**: `TL001`, `TL002`, ..., `TL999`.
4. **Đầu Sách (`BookTitle.maDauSach`)**:
   - **Định dạng**: `DS` + 5 chữ số tự tăng.
   - **Ví dụ**: `DS00001`, `DS00002`, ..., `DS99999`.
5. **Cuốn Sách Vật Lý (`BookCopy.maSach`)**:
   - **Định dạng**: `BS` + 6 chữ số tự tăng (`BS` = Book Specimen / Book Copy).
   - **Ví dụ**: `BS000001`, `BS000002`, ..., `BS999999`.
6. **Độc Giả (`Reader.maDocGia`)**:
   - **Định dạng**: `DG` + 5 chữ số tự tăng.
   - **Ví dụ**: `DG00001`, `DG00002`, ..., `DG99999`.
7. **Nhân Viên (`Staff.maSoNV`)**:
   - **Định dạng**: `NV` + 3 chữ số tự tăng.
   - **Ví dụ**: `NV001`, `NV002`, ..., `NV999`.
8. **Gói Thẻ Độc Giả (`MembershipPlan.maGoi`)**:
   - **Định dạng**: `GOI` + 3 chữ số tự tăng.
   - **Ví dụ**: `GOI001`, `GOI002`, ..., `GOI999`.
9. **Đăng Ký Gói Thẻ (`Subscription.maDangKy`)**:
   - **Định dạng**: `DK` + 6 chữ số tự tăng.
   - **Ví dụ**: `DK000001`, `DK000002`, ..., `DK999999`.
10. **Phiếu Mượn Sách (`BorrowReceipt.maPhieu`)**:
    - **Định dạng**: `PM` + 6 chữ số tự tăng.
    - **Ví dụ**: `PM000001`, `PM000002`, ..., `PM999999`.
11. **Phiếu Phạt (`PenaltyTicket.maPhieuPhat`)**:
    - **Định dạng**: `PP` + 6 chữ số tự tăng.
    - **Ví dụ**: `PP000001`, `PP000002`, ..., `PP999999`.
12. **Mã Giảm Giá (`DiscountCode.maCode`)**:
    - **Định dạng**: `KM` + [Năm 4 số][Tháng 2 số] + 3 chữ số tự tăng (hoặc mã khuyến mãi tùy chỉnh do Admin nhập nếu có chương trình đặc biệt).
    - **Ví dụ**: `KM202607001`, `KM202607002`.

---

#### 🛠️ Cơ Chế Tự Động Sinh Mã (Auto Code Generator Function)
Để đảm bảo tính nhất quán và không trùng lặp (Concurreny Safety), hệ thống sử dụng một Helper Function / Counter Collection dạng:

```javascript
/**
 * Utility sinh mã tự động có tiền tố và tự động thêm số 0 đằng trước (Pad start)
 * @param {string} prefix - Tiền tố (ví dụ: 'NXB', 'DG', 'PM')
 * @param {number} currentSequence - Số thứ tự tiếp theo
 * @param {number} length - Độ dài của phần số (ví dụ: 3, 5, 6)
 * @returns {string} Mã chuẩn định dạng (ví dụ: NXB001, DG00001)
 */
const generateCode = (prefix, currentSequence, length) => {
  const paddedNumber = String(currentSequence).padStart(length, '0');
  return `${prefix}${paddedNumber}`;
};
```

---

## 💻 2. Chi Tiết Code Mongoose Schemas (Production Standard)

### 2.1. `Publisher.js` (Nhà Xuất Bản)
```javascript
const mongoose = require('mongoose');

const publisherSchema = new mongoose.Schema({
  maNXB: {
    type: String,
    required: [true, 'Mã nhà xuất bản là bắt buộc'],
    unique: true,
    trim: true,
    uppercase: true
  },
  tenNXB: {
    type: String,
    required: [true, 'Tên nhà xuất bản là bắt buộc'],
    trim: true
  },
  diachi: {
    type: String,
    trim: true,
    default: ''
  },
  soDienThoai: {
    type: String,
    trim: true,
    match: [/^(0[3|5|7|8|9])+([0-9]{8})$/, 'Số điện thoại không hợp lệ (định dạng Việt Nam: 10 chữ số)']
  }
}, { timestamps: true });

module.exports = mongoose.model('Publisher', publisherSchema);
```

---

### 2.2. `Author.js` (Tác Giả)
```javascript
const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
  maTacGia: {
    type: String,
    required: [true, 'Mã tác giả là bắt buộc'],
    unique: true,
    trim: true,
    uppercase: true
  },
  tenTacGia: {
    type: String,
    required: [true, 'Tên tác giả là bắt buộc'],
    trim: true
  },
  ngaySinh: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Author', authorSchema);
```

---

### 2.3. `Category.js` (Thể Loại Sách)
```javascript
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  maTheLoai: {
    type: String,
    required: [true, 'Mã thể loại là bắt buộc'],
    unique: true,
    trim: true,
    uppercase: true
  },
  tenTheLoai: {
    type: String,
    required: [true, 'Tên thể loại là bắt buộc'],
    trim: true
  },
  moTa: {
    type: String,
    trim: true,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
```

---

### 2.4. `BookTitle.js` (Đầu Sách / Tác Phẩm - Tích Hợp Cờ Ngừng Phục Vụ)
```javascript
const mongoose = require('mongoose');

const bookTitleSchema = new mongoose.Schema({
  maDauSach: {
    type: String,
    required: [true, 'Mã đầu sách là bắt buộc'],
    unique: true,
    trim: true,
    uppercase: true
  },
  tenSach: {
    type: String,
    required: [true, 'Tên sách là bắt buộc'],
    trim: true,
    index: true
  },
  tacGia: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
    required: true
  }],
  nhaXuatBan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Publisher',
    required: [true, 'Nhà xuất bản là bắt buộc']
  },
  theLoai: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Thể loại sách là bắt buộc'],
    index: true
  },
  namSanXuat: {
    type: Number,
    min: [1000, 'Năm xuất bản phải lớn hơn 1000'],
    max: [new Date().getFullYear(), 'Năm xuất bản không được lớn hơn năm hiện tại']
  },
  tongSoLuong: {
    type: Number,
    required: true,
    min: [0, 'Tổng số lượng không được âm'],
    default: 0
  },
  soLuongKhaDung: {
    type: Number,
    required: true,
    min: [0, 'Số lượng khả dụng không được âm'],
    default: 0
  },
  giaBia: {
    type: Number,
    min: [0, 'Giá bìa không được âm'],
    default: 0
  },
  hinhAnh: {
    type: String,
    default: ''
  },
  trangThai: {
    type: String,
    enum: ['ACTIVE', 'DISCONTINUED'],
    default: 'ACTIVE',
    index: true
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

bookTitleSchema.path('tacGia').validate(function(value) {
  return value && value.length > 0;
}, 'Đầu sách phải có ít nhất 1 tác giả');

module.exports = mongoose.model('BookTitle', bookTitleSchema);
```

---

### 2.5. `BookCopy.js` (Cuốn Sách Vật Lý)
```javascript
const mongoose = require('mongoose');

const bookCopySchema = new mongoose.Schema({
  maSach: {
    type: String,
    required: [true, 'Mã cuốn sách là bắt buộc'],
    unique: true,
    trim: true,
    uppercase: true
  },
  dauSach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BookTitle',
    required: [true, 'Đầu sách tham chiếu là bắt buộc'],
    index: true
  },
  viTriKe: {
    type: String,
    required: [true, 'Vị trí kệ sách là bắt buộc'],
    trim: true
  },
  tinhTrang: {
    type: String,
    enum: {
      values: ['CHO_MUON', 'DA_MUON', 'BAO_TRI', 'MAT'],
      message: 'Trạng thái sách phải là: CHO_MUON, DA_MUON, BAO_TRI, MAT'
    },
    default: 'CHO_MUON',
    index: true
  },
  ngayNhap: {
    type: Date,
    default: Date.now
  },
  ghiChu: {
    type: String,
    default: ''
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('BookCopy', bookCopySchema);
```

---

### 2.6. `Reader.js` (Độc Giả / Người Dùng)
```javascript
const mongoose = require('mongoose');

const readerSchema = new mongoose.Schema({
  maDocGia: {
    type: String,
    required: [true, 'Mã độc giả là bắt buộc'],
    unique: true,
    trim: true,
    uppercase: true
  },
  hoLot: {
    type: String,
    required: [true, 'Họ lót là bắt buộc'],
    trim: true
  },
  ten: {
    type: String,
    required: [true, 'Tên độc giả là bắt buộc'],
    trim: true,
    index: true
  },
  email: {
    type: String,
    required: [true, 'Email là bắt buộc'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
  },
  matKhau: {
    type: String,
    required: [true, 'Mật khẩu là bắt buộc'],
    minlength: [6, 'Mật khẩu phải có tối thiểu 6 ký tự']
  },
  ngaySinh: {
    type: Date,
    required: [true, 'Ngày sinh là bắt buộc']
  },
  gioiTinh: {
    type: String,
    enum: {
      values: ['NAM', 'NU', 'KHAC'],
      message: 'Giới tính không hợp lệ'
    },
    default: 'NAM'
  },
  diachi: {
    type: String,
    required: [true, 'Địa chỉ là bắt buộc'],
    trim: true
  },
  dienThoai: {
    type: String,
    required: [true, 'Số điện thoại là bắt buộc'],
    unique: true,
    trim: true,
    match: [/^(0[3|5|7|8|9])+([0-9]{8})$/, 'Số điện thoại không hợp lệ']
  },
  trangThai: {
    type: String,
    enum: ['ACTIVE', 'LOCKED'],
    default: 'ACTIVE'
  }
}, { timestamps: true });

module.exports = mongoose.model('Reader', readerSchema);
```

---

### 2.7. `Staff.js` (Nhân Viên Thư Viện)
```javascript
const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  maSoNV: {
    type: String,
    required: [true, 'Mã số nhân viên là bắt buộc'],
    unique: true,
    trim: true,
    uppercase: true
  },
  hoTenNV: {
    type: String,
    required: [true, 'Họ tên nhân viên là bắt buộc'],
    trim: true
  },
  matKhau: {
    type: String,
    required: [true, 'Mật khẩu là bắt buộc'],
    minlength: [6, 'Mật khẩu phải có tối thiểu 6 ký tự']
  },
  chucVu: {
    type: String,
    enum: {
      values: ['THU_THU', 'QUAN_LY'],
      message: 'Chức vụ không hợp lệ'
    },
    default: 'THU_THU'
  },
  diachi: {
    type: String,
    required: [true, 'Địa chỉ là bắt buộc'],
    trim: true
  },
  soDienThoai: {
    type: String,
    required: [true, 'Số điện thoại là bắt buộc'],
    trim: true,
    match: [/^(0[3|5|7|8|9])+([0-9]{8})$/, 'Số điện thoại không hợp lệ']
  }
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);
```

---

### 2.8. `MembershipPlan.js` (Gói Độc Giả)
```javascript
const mongoose = require('mongoose');

const membershipPlanSchema = new mongoose.Schema({
  maGoi: {
    type: String,
    required: [true, 'Mã gói là bắt buộc'],
    unique: true,
    trim: true,
    uppercase: true
  },
  tenGoi: {
    type: String,
    required: [true, 'Tên gói là bắt buộc'],
    trim: true
  },
  giaTien: {
    type: Number,
    required: [true, 'Giá tiền gói là bắt buộc'],
    min: [0, 'Giá tiền không được âm']
  },
  soNgayHieuLuc: {
    type: Number,
    required: [true, 'Số ngày hiệu lực là bắt buộc'],
    min: [1, 'Số ngày hiệu lực phải lớn hơn 0']
  },
  soSachToiDa: {
    type: Number,
    required: true,
    min: [1, 'Số sách tối đa phải lớn hơn 0'],
    default: 3
  },
  soNgayMuonToiDa: {
    type: Number,
    required: true,
    min: [1, 'Số ngày mượn tối đa phải lớn hơn 0'],
    default: 14
  },
  mienTienCoc: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('MembershipPlan', membershipPlanSchema);
```

---

### 2.9. `Subscription.js` (Đăng Ký Gói Độc Giả)
```javascript
const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  maDangKy: {
    type: String,
    required: [true, 'Mã đăng ký là bắt buộc'],
    unique: true,
    trim: true,
    uppercase: true
  },
  docGia: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reader',
    required: [true, 'Độc giả là bắt buộc'],
    index: true
  },
  goiDocGia: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MembershipPlan',
    required: [true, 'Gói đăng ký là bắt buộc']
  },
  ngayBatDau: {
    type: Date,
    default: Date.now
  },
  ngayKetThuc: {
    type: Date,
    required: [true, 'Ngày kết thúc là bắt buộc']
  },
  tongTien: {
    type: Number,
    required: true,
    min: [0, 'Tổng tiền không được âm']
  },
  trangThai: {
    type: String,
    enum: ['DANG_HIEU_LUC', 'HET_HAN', 'HUY'],
    default: 'DANG_HIEU_LUC'
  }
}, { timestamps: true });

subscriptionSchema.path('ngayKetThuc').validate(function(value) {
  return value > this.ngayBatDau;
}, 'Ngày kết thúc gói phải lớn hơn ngày bắt đầu');

module.exports = mongoose.model('Subscription', subscriptionSchema);
```

---

### 2.10. `BorrowReceipt.js` (Phiếu Mượn & Chi Tiết Mượn Sách)
```javascript
const mongoose = require('mongoose');

const borrowDetailSchema = new mongoose.Schema({
  sach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BookCopy',
    required: [true, 'Cuốn sách được mượn là bắt buộc']
  },
  tinhTrangLucMuon: {
    type: String,
    required: [true, 'Tình trạng lúc mượn là bắt buộc'],
    trim: true
  },
  tinhTrangSauMuon: {
    type: String,
    trim: true,
    default: ''
  }
}, { _id: false });

const borrowReceiptSchema = new mongoose.Schema({
  maPhieu: {
    type: String,
    required: [true, 'Mã phiếu mượn là bắt buộc'],
    unique: true,
    trim: true,
    uppercase: true
  },
  docGia: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reader',
    required: [true, 'Độc giả mượn sách là bắt buộc'],
    index: true
  },
  nhanVien: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    default: null
  },
  chiTietMuon: [borrowDetailSchema],
  ngayMuon: {
    type: Date,
    default: Date.now
  },
  ngayHenTra: {
    type: Date,
    required: [true, 'Ngày hẹn trả là bắt buộc']
  },
  ngayTraThucTe: {
    type: Date,
    default: null
  },
  tienCoc: {
    type: Number,
    min: [0, 'Tiền cọc không được âm'],
    default: 0
  },
  phiMuon: {
    type: Number,
    min: [0, 'Phí mượn không được âm'],
    default: 0
  },
  soTienGiam: {
    type: Number,
    min: [0, 'Số tiền giảm không được âm'],
    default: 0
  },
  tongTienThanhToan: {
    type: Number,
    min: [0, 'Tổng tiền thanh toán không được âm'],
    default: 0
  },
  trangThai: {
    type: String,
    enum: ['DANG_MUON', 'DA_TRA', 'QUA_HAN', 'HUY'],
    default: 'DANG_MUON',
    index: true
  }
}, { timestamps: true });

borrowReceiptSchema.path('chiTietMuon').validate(function(value) {
  return value && value.length > 0;
}, 'Phiếu mượn phải chứa ít nhất 1 cuốn sách');

borrowReceiptSchema.path('ngayHenTra').validate(function(value) {
  return value >= this.ngayMuon;
}, 'Ngày hẹn trả không được trước ngày mượn');

module.exports = mongoose.model('BorrowReceipt', borrowReceiptSchema);
```

---

### 2.11. `PenaltyTicket.js` (Phiếu Phạt Vi Phạm)
```javascript
const mongoose = require('mongoose');

const penaltyTicketSchema = new mongoose.Schema({
  maPhieuPhat: {
    type: String,
    required: [true, 'Mã phiếu phạt là bắt buộc'],
    unique: true,
    trim: true,
    uppercase: true
  },
  phieuMuon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BorrowReceipt',
    required: [true, 'Phiếu mượn liên quan là bắt buộc'],
    index: true
  },
  nhanVien: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: [true, 'Nhân viên lập phiếu phạt là bắt buộc']
  },
  lyDoPhat: {
    type: String,
    required: [true, 'Lý do phạt là bắt buộc'],
    trim: true
  },
  soTienPhat: {
    type: Number,
    required: [true, 'Số tiền phạt là bắt buộc'],
    min: [0, 'Số tiền phạt không được âm']
  },
  ngayLap: {
    type: Date,
    default: Date.now
  },
  daThanhToan: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('PenaltyTicket', penaltyTicketSchema);
```

---

### 2.12. `DiscountCode.js` (Mã Giảm Giá)
```javascript
const mongoose = require('mongoose');

const discountCodeSchema = new mongoose.Schema({
  maCode: {
    type: String,
    required: [true, 'Mã code là bắt buộc'],
    unique: true,
    trim: true,
    uppercase: true
  },
  tenKhuyenMai: {
    type: String,
    required: [true, 'Tên khuyến mãi là bắt buộc'],
    trim: true
  },
  giaTriGiam: {
    type: Number,
    required: [true, 'Giá trị giảm là bắt buộc'],
    min: [0, 'Giá trị giảm không được âm']
  },
  giaTriDonToiThieu: {
    type: Number,
    min: [0, 'Giá trị đơn tối thiểu không được âm'],
    default: 0
  },
  ngayBatDau: {
    type: Date,
    required: [true, 'Ngày bắt đầu là bắt buộc']
  },
  ngayKetThuc: {
    type: Date,
    required: [true, 'Ngày kết thúc là bắt buộc']
  },
  soLuotDaDung: {
    type: Number,
    min: [0, 'Số lượt đã dùng không được âm'],
    default: 0
  },
  soLuongMaToiDa: {
    type: Number,
    min: [1, 'Số lượng mã tối đa phải lớn hơn 0'],
    default: 100
  }
}, { timestamps: true });

discountCodeSchema.path('ngayKetThuc').validate(function(value) {
  return value > this.ngayBatDau;
}, 'Ngày kết thúc mã giảm giá phải sau ngày bắt đầu');

module.exports = mongoose.model('DiscountCode', discountCodeSchema);
```

---

## 🔒 3. Giải Đáp: Xử Lý Xóa Đầu Sách Khi Có Người Mượn Gối Đầu (Chiến Lược Khóa Ngắt Mượn Mới - Drain Strategy)

### 3.1. Vấn Đề Vòng Lặp Mượn Gối Đầu (Continuous Borrow Loop)
Giả sử Đầu sách *"Dế Mèn Phiêu Lưu Ký"* có 10 cuốn vật lý (`SACH001` $\rightarrow$ `SACH010`).
- Nếu Admin bấm "Xóa Đầu Sách", nhưng hệ thống thụ động chờ cho đến khi **TẤT CẢ** các cuốn sách trả về mới cho xóa:
- Trong lúc chờ Độc giả A trả `SACH001`, Độc giả B lại vào mượn `SACH002`, rồi Độc giả C mượn `SACH003`...
- $\rightarrow$ **Hệ quả**: Đầu sách này **SẼ MÃI MÃI KHÔNG BAO GIỜ XÓA ĐƯỢC** vì các giao dịch mượn gối đầu nhau liên tục!

---

### 3.2. Giải Pháp Triệt Để: Chiến Lược Khóa Ngắt Mượn Mới (Drain Strategy)

Khi Admin bấm **"Xóa / Ngừng Phục Vụ Đầu Sách"**:

1. **Khóa Đặt Mượn Mới Tức Thì (Instant Soft Lock)**:
   - Hệ thống cập nhật ngay lập tức: `BookTitle.trangThai = 'DISCONTINUED'` và `BookTitle.isDeleted = true`.
   - Lập tức **tất cả API tra cứu / Đặt mượn** trên Web/App ẩn Đầu sách này hoặc báo trạng thái *"Ngừng kinh doanh"*.
   - **TÁC DỤNG**: Ngăn chặn 100% người B, C, D... đặt mượn thêm bất kỳ cuốn sách nào mới thuộc đầu sách này nữa.

2. **Thu Hồi Các Cuốn Đang Rảnh Trên Kệ**:
   - Tất cả các cuốn sách rảnh rỗi (`SACH002` $\rightarrow$ `SACH010` đang ở `CHO_MUON`) lập tức được chuyển sang `tinhTrang: 'BAO_TRI'` và thu hồi vào kho thanh lý.

3. **Cho Phép Cuốn Đang Mượn Duy Nhất Hoàn Thành Chu Kỳ**:
   - Chỉ duy nhất cuốn `SACH001` mà Độc giả A đang giữ được hoàn thành chu kỳ mượn.
   - Khi Độc giả A trả `SACH001`: Hệ thống nhận trả, và chuyển thẳng `SACH001` vào kho thanh lý cùng 9 cuốn kia mà không đưa lại về kệ.
   - Khi cuốn cuối cùng `SACH001` trả xong $\rightarrow$ Quy trình xóa/ngừng phục vụ hoàn thành trọn vẹn 100%!

```javascript
// Hàm Admin Bấm Xóa / Ngừng Phục Vụ Đầu Sách (Drain Strategy)
async function discontinueBookTitle(titleId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Khóa Đặt Mượn Mới Tức Thì trên Đầu Sách
    const title = await BookTitle.findByIdAndUpdate(
      titleId,
      {
        $set: {
          trangThai: 'DISCONTINUED',
          isDeleted: true,
          deletedAt: new Date(),
          soLuongKhaDung: 0 // Đặt ngay số lượng khả dụng = 0 để khóa mượn trên Web
        }
      },
      { session, new: true }
    );

    if (!title) throw new Error('Không tìm thấy đầu sách');

    // 2. Chuyển tất cả cuốn sách RẢNH (CHO_MUON) trên kệ vào kho thanh lý
    await BookCopy.updateMany(
      { dauSach: titleId, tinhTrang: 'CHO_MUON' },
      { $set: { tinhTrang: 'BAO_TRI', isDeleted: true, deletedAt: new Date(), ghiChu: 'Thu hồi do ngừng phục vụ đầu sách' } },
      { session }
    );

    // 3. Đếm số cuốn còn đang được độc giả mượn chưa trả
    const activeCopiesCount = await BookCopy.countDocuments({
      dauSach: titleId,
      tinhTrang: 'DA_MUON'
    }).session(session);

    await session.commitTransaction();
    session.endSession();

    if (activeCopiesCount > 0) {
      return {
        success: true,
        message: `Đã khóa đặt mượn mới đầu sách "${title.tenSach}". Còn ${activeCopiesCount} cuốn đang trong chu kỳ mượn cuối cùng và sẽ được thu hồi ngay khi độc giả trả.`
      };
    } else {
      return {
        success: true,
        message: `Đã thu hồi và ngừng phục vụ hoàn toàn đầu sách "${title.tenSach}".`
      };
    }

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}
```
