/**
 * Chức năng: Model lưu trữ sequence tự tăng phục vụ việc sinh mã tự động an toàn đồng thời
 * Lý do tạo: Giải quyết bài toán trùng lặp mã định danh khi nhiều request cùng ghi nhận bản ghi mới
 */

const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    trim: true
  },
  seq: {
    type: Number,
    required: true,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Counter', counterSchema);
