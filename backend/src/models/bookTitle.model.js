/**
 * Chức năng: Định nghĩa cấu trúc Schema và Model Mongoose cho Đầu Sách / Tác Phẩm (BookTitle)
 * Lý do tạo: Đại diện cho thông tin chung của tác phẩm sách, quản lý số lượng và trạng thái hoạt động (Drain Strategy)
 */

const mongoose = require('mongoose');

const bookTitleSchema = new mongoose.Schema({
  _id: {
    type: String,
    trim: true
  },
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
    type: String,
    ref: 'Author',
    required: true
  }],
  nhaXuatBan: {
    type: String,
    ref: 'Publisher',
    required: [true, 'Nhà xuất bản là bắt buộc']
  },
  theLoai: {
    type: String,
    ref: 'Category',
    required: [true, 'Thể loại sách là bắt buộc'],
    index: true
  },
  namSanXuat: {
    type: Number,
    min: [1000, 'Năm xuất bản phải lớn hơn 1000'],
    validate: {
      validator: value => !value || value <= new Date().getFullYear(),
      message: 'Năm xuất bản không được lớn hơn năm hiện tại'
    }
  },
  tongSoLuong: {
    type: Number,
    required: true,
    min: [0, 'Tổng số lượng không được âm'],
    default: 0
  },
  soLuongDangQuanLy: {
    type: Number,
    required: true,
    min: [0, 'Số lượng đang quản lý không được âm'],
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
  soLuotMuon: {
    type: Number,
    default: 0,
    index: true
  },
  rating: {
    type: Number,
    default: 5.0,
    min: [0, 'Đánh giá không được dưới 0'],
    max: [5, 'Đánh giá tối đa là 5'],
    index: true
  },
  soLuotDanhGia: {
    type: Number,
    default: 0
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

bookTitleSchema.path('tacGia').validate(async function(value) {
  if (!value || value.length === 0) return true;
  const Author = mongoose.model('Author');
  const session = this.$session ? this.$session() : null;
  const count = await Author.countDocuments({ _id: { $in: value } }).session(session);
  return count === new Set(value.map(id => String(id))).size;
}, 'Danh sách tác giả tham chiếu không tồn tại hoặc bị trùng');

bookTitleSchema.path('nhaXuatBan').validate(async function(value) {
  if (!value) return true;
  const Publisher = mongoose.model('Publisher');
  const session = this.$session ? this.$session() : null;
  return !!await Publisher.exists({ _id: value }).session(session);
}, 'Nhà xuất bản tham chiếu không tồn tại');

bookTitleSchema.path('theLoai').validate(async function(value) {
  if (!value) return true;
  const Category = mongoose.model('Category');
  const session = this.$session ? this.$session() : null;
  return !!await Category.exists({ _id: value }).session(session);
}, 'Thể loại tham chiếu không tồn tại');

bookTitleSchema.pre('validate', async function(next) {
  if (this.isNew && !this._id) {
    const { nextCode } = require('../services/codeService');
    const code = await nextCode('bookTitle');
    this._id = code;
    this.maDauSach = code;
  }
  next();
});

// Trigger Cascade Soft-delete và Discontinue cho các bản sao vật lý
bookTitleSchema.pre('save', async function(next) {
  const BookCopy = mongoose.model('BookCopy');
  const session = this.$session();

  // 1. CHỈ chặn xóa mềm đầu sách khi có bản sao vật lý đang được mượn
  if (this.isModified('isDeleted') && this.isDeleted === true) {
    const borrowedCopies = await BookCopy.find({
      dauSach: this._id,
      tinhTrang: 'DA_MUON',
      isDeleted: false
    }).session(session);
    if (borrowedCopies.length > 0) {
      throw new Error('Không thể xóa đầu sách khi có bản sao vật lý đang được mượn (DA_MUON)');
    }
  }

  // 2. Cascade cập nhật thu hồi đối với các bản sao vật lý đang rảnh (CHO_MUON)
  if ((this.isModified('trangThai') && this.trangThai === 'DISCONTINUED') || (this.isModified('isDeleted') && this.isDeleted === true)) {
    const copyFilter = this.isModified('isDeleted') && this.isDeleted === true
      ? { dauSach: this._id, tinhTrang: { $ne: 'DA_MUON' }, isDeleted: false }
      : { dauSach: this._id, tinhTrang: 'CHO_MUON', isDeleted: false };

    await BookCopy.updateMany(
      copyFilter,
      { 
        $set: { 
          tinhTrang: 'BAO_TRI',
          isDeleted: true,
          deletedAt: new Date(),
          ghiChu: 'Tự động ngưng hoạt động do đầu sách bị ngừng phục vụ/xóa'
        } 
      }
    ).session(session);
    
    // Đặt tồn kho khả dụng về 0 vì không cho phép mượn mới nữa
    this.soLuongKhaDung = 0;
    this.soLuongDangQuanLy = await BookCopy.countDocuments({ dauSach: this._id, isDeleted: false }).session(session);
  }
  next();
});

module.exports = mongoose.model('BookTitle', bookTitleSchema);
