/**
 * Chức năng: Định nghĩa cấu trúc Schema và Model Mongoose cho Nhà Xuất Bản (Publisher)
 * Lý do tạo: Chuẩn hóa thực thể Nhà Xuất Bản từ CSDL erd.cdm
 * Link trích dẫn: https://mongoosejs.com/docs/guide.html
 */

const mongoose = require('mongoose');

const publisherSchema = new mongoose.Schema({
  _id: {
    type: String,
    trim: true
  },
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
    match: [/^(0[35789])([0-9]{8})$/, 'Số điện thoại không hợp lệ (định dạng Việt Nam: 10 chữ số)']
  }
}, { timestamps: true });

publisherSchema.pre('validate', async function(next) {
  if (this.isNew && !this._id) {
    const { nextCode } = require('../services/codeService');
    const code = await nextCode('publisher');
    this._id = code;
    this.maNXB = code;
  }
  next();
});

module.exports = mongoose.model('Publisher', publisherSchema);
