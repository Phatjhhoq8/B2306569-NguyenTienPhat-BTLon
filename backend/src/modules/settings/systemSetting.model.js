/**
 * Chức năng: Định nghĩa cấu trúc Schema và Model Mongoose cho Cài Đặt Hệ Thống (SystemSetting)
 * Lý do tạo: Cho phép thay đổi thông tin trang chủ, giới thiệu động từ Admin Portal
 */

const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: [true, 'Key cấu hình là bắt buộc'],
    unique: true,
    trim: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Giá trị cấu hình là bắt buộc']
  }
}, { timestamps: true });

module.exports = mongoose.model('SystemSetting', systemSettingSchema);
