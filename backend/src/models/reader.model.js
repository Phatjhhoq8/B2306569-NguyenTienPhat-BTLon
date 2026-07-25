/**
 * Chức năng: Định nghĩa cấu trúc Schema và Model Mongoose cho Độc Giả (Reader)
 * Lý do tạo: Lưu trữ thông tin tài khoản người mượn sách
 */

const mongoose = require('mongoose');

const readerSchema = new mongoose.Schema({
  _id: {
    type: String,
    trim: true
  },
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
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/, 'Email không hợp lệ']
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
    match: [/^(0[35789])([0-9]{8})$/, 'Số điện thoại không hợp lệ']
  },
  trangThai: {
    type: String,
    enum: ['ACTIVE', 'LOCKED'],
    default: 'ACTIVE'
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

readerSchema.pre('validate', async function(next) {
  if (this.isNew && !this._id) {
    const { nextCode } = require('../services/codeService');
    const code = await nextCode('reader');
    this._id = code;
    this.maDocGia = code;
  }
  next();
});

// Trigger tự động băm mật khẩu bằng PBKDF2 có salt trước khi save
readerSchema.pre('save', async function(next) {
  if (this.isModified('matKhau') && !String(this.matKhau).startsWith('pbkdf2$')) {
    const { hashPassword } = require('../services/passwordService');
    this.matKhau = await hashPassword(this.matKhau);
  }

  // Trigger chặn xóa độc giả đang nợ sách hoặc nợ tiền phạt chưa thanh toán
  if (!this.isNew && this.isModified('isDeleted') && this.isDeleted === true) {
    const BorrowReceipt = mongoose.model('BorrowReceipt');
    const PenaltyTicket = mongoose.model('PenaltyTicket');
    const Subscription = mongoose.model('Subscription');
    const session = this.$session();

    // 1. Kiểm tra nợ sách
    const activeReceipts = await BorrowReceipt.find({
      docGia: this._id,
      trangThai: { $in: ['DANG_MUON', 'QUA_HAN'] }
    }).session(session);
    if (activeReceipts.length > 0) {
      throw new Error('Không được phép xóa độc giả đang nợ sách chưa trả');
    }

    // 2. Kiểm tra nợ tiền phạt (truy vấn bắc cầu qua BorrowReceipt của độc giả)
    const allReceipts = await BorrowReceipt.find({ docGia: this._id }).session(session);
    const receiptIds = allReceipts.map(r => r._id);

    const unpaidTickets = await PenaltyTicket.find({
      phieuMuon: { $in: receiptIds },
      daThanhToan: false
    }).session(session);
    if (unpaidTickets.length > 0) {
      throw new Error('Không được phép xóa độc giả đang nợ tiền phạt chưa thanh toán');
    }

    // 3. Nếu đủ điều kiện xóa -> Tự động hủy gói subscription đang hoạt động
    await Subscription.updateMany(
      { docGia: this._id, trangThai: 'DANG_HIEU_LUC' },
      { $set: { trangThai: 'HUY' } }
    ).session(session);
  }

  next();
});

module.exports = mongoose.model('Reader', readerSchema);
