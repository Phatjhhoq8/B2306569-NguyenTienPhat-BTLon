/**
 * Chức năng: Định nghĩa cấu trúc Schema và Model Mongoose cho Gói Độc Giả (MembershipPlan)
 * Lý do tạo: Đại diện cho các hạng gói dịch vụ mượn sách
 */

const mongoose = require('mongoose');

const membershipPlanSchema = new mongoose.Schema({
  _id: {
    type: String,
    trim: true
  },
  maGoi: {
    type: String,
    required: [true, 'Mã gói là bắt buộc'],
    unique: true,
    trim: true,
    uppercase: true
  },
  tenGoi: {
    type: String,
    required: [true, 'Tên gói là bắt buộc'],
    trim: true
  },
  giaTien: {
    type: Number,
    required: [true, 'Giá tiền gói là bắt buộc'],
    min: [0, 'Giá tiền không được âm']
  },
  soNgayHieuLuc: {
    type: Number,
    required: [true, 'Số ngày hiệu lực là bắt buộc'],
    min: [1, 'Số ngày hiệu lực phải lớn hơn 0']
  },
  soSachToiDa: {
    type: Number,
    required: true,
    min: [1, 'Số sách tối đa phải lớn hơn 0'],
    default: 3
  },
  soNgayMuonToiDa: {
    type: Number,
    required: true,
    min: [1, 'Số ngày mượn tối đa phải lớn hơn 0'],
    default: 14
  },
  mienTienCoc: {
    type: Boolean,
    default: false
  },
  choPhepGiaHanOnline: {
    type: Boolean,
    default: false
  },
  quayNhanUuTien: {
    type: Boolean,
    default: false
  },
  chiaSeNhomGiaDinh: {
    type: Boolean,
    default: false
  },
  docEbookKhongGioiHan: {
    type: Boolean,
    default: false
  },
  giaoSachTanNha: {
    type: Boolean,
    default: false
  },
  workshopDocQuyen: {
    type: Boolean,
    default: false
  },
  loaiGoi: {
    type: String,
    enum: ['INDIVIDUAL', 'TEAM'],
    default: 'INDIVIDUAL'
  },
  khuyenDung: {
    type: Boolean,
    default: false
  },
  phiMuonSachGiay: {
    type: Number,
    default: 0,
    min: [0, 'Phí mượn không được âm']
  },
  phiPhatTreHan: {
    type: Number,
    default: 2000,
    min: [0, 'Phí phạt trễ hạn không được âm']
  },
  tienDatCoc: {
    type: Number,
    default: 0,
    min: [0, 'Tiền đặt cọc không được âm']
  }
}, { timestamps: true });

membershipPlanSchema.pre('validate', async function(next) {
  if (this.isNew && !this._id) {
    const { nextCode } = require('../../services/codeService');
    const code = await nextCode('membershipPlan');
    this._id = code;
    this.maGoi = code;
  }
  next();
});

module.exports = mongoose.model('MembershipPlan', membershipPlanSchema);
