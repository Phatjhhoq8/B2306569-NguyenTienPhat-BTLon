/**
 * Chức năng: Định nghĩa cấu trúc Schema và Model Mongoose cho Mã Giảm Giá (DiscountCode)
 * Lý do tạo: Khuyến mãi giảm phí mượn hoặc gói hội viên cho độc giả
 */

const mongoose = require('mongoose');

const discountCodeSchema = new mongoose.Schema({
  _id: {
    type: String,
    trim: true
  },
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
  apDungCho: {
    type: String,
    enum: ['GOI_HOI_VIEN', 'MUON_SACH'],
    required: [true, 'Phạm vi áp dụng mã giảm giá là bắt buộc'],
    default: 'MUON_SACH'
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

discountCodeSchema.pre('validate', async function(next) {
  if (this.isNew && !this._id) {
    const { nextCode } = require('../../services/codeService');
    const code = await nextCode('discountCode');
    this._id = code;
    this.maCode = code;
  }
  next();
});

module.exports = mongoose.model('DiscountCode', discountCodeSchema);
