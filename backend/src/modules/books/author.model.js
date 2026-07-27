/**
 * Chức năng: Định nghĩa cấu trúc Schema và Model Mongoose cho Tác Giả (Author)
 * Lý do tạo: Chuẩn hóa thực thể Tác Giả từ CSDL erd.cdm
 */

const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
  _id: {
    type: String,
    trim: true
  },
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

authorSchema.pre('validate', async function(next) {
  if (this.isNew && !this._id) {
    const { nextCode } = require('../../services/codeService');
    const code = await nextCode('author');
    this._id = code;
    this.maTacGia = code;
  }
  next();
});

module.exports = mongoose.model('Author', authorSchema);
