/**
 * Chức năng: Định nghĩa cấu trúc Schema và Model Mongoose cho Nhà Xuất Bản (Publisher)
 * Lý do tạo: Chuẩn hóa thực thể Nhà Xuất Bản từ CSDL erd.cdm
 * Link trích dẫn: https://mongoosejs.com/docs/guide.html
 */

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
