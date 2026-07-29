/**
 * Chức năng: Định nghĩa cấu trúc Schema và Model Mongoose cho Nhân Viên (Staff)
 * Lý do tạo: Quản lý nhân sự thủ thư và quản lý hệ thống. Nhân viên xác thực bằng maSoNV và mật khẩu (không dùng email).
 */

const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  _id: {
    type: String,
    trim: true
  },
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
  mustChangePassword: {
    type: Boolean,
    default: true
  },
  passwordChangedAt: {
    type: Date,
    default: null
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
    trim: true
  },
  soDienThoai: {
    type: String,
    required: [true, 'Số điện thoại là bắt buộc'],
    trim: true,
    match: [/^0[0-9]{9}$/, 'Số điện thoại phải có đúng 10 số và bắt đầu bằng số 0']
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

staffSchema.pre('validate', async function(next) {
  if (this.isNew && !this._id) {
    const { nextCode } = require('../../services/codeService');
    const code = await nextCode('staff');
    this._id = code;
    this.maSoNV = code;
  }
  next();
});

staffSchema.pre('save', async function(next) {
  if (this.isModified('matKhau') && !String(this.matKhau).startsWith('pbkdf2$')) {
    const { hashPassword } = require('../../services/passwordService');
    this.matKhau = await hashPassword(this.matKhau);
  }
  next();
});

module.exports = mongoose.model('Staff', staffSchema);
