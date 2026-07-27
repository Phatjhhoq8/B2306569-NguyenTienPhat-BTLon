/**
 * Chức năng: Định nghĩa cấu trúc Schema và Model Mongoose cho Thể Loại Sách (Category)
 * Lý do tạo: Chuẩn hóa thực thể Thể Loại từ CSDL erd.cdm
 */

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  _id: {
    type: String,
    trim: true
  },
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

categorySchema.pre('validate', async function(next) {
  if (this.isNew && !this._id) {
    const { nextCode } = require('../../services/codeService');
    const code = await nextCode('category');
    this._id = code;
    this.maTheLoai = code;
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);
