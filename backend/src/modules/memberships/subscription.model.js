/**
 * Chức năng: Định nghĩa cấu trúc Schema và Model Mongoose cho Đăng Ký Gói Thẻ (Subscription)
 * Lý do tạo: Theo dõi trạng thái hoạt động của độc giả đăng ký mượn sách có phí/miễn phí
 */

const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  _id: {
    type: String,
    trim: true
  },
  maDangKy: {
    type: String,
    required: [true, 'Mã đăng ký là bắt buộc'],
    unique: true,
    trim: true,
    uppercase: true
  },
  docGia: {
    type: String,
    ref: 'Reader',
    required: [true, 'Độc giả là bắt buộc'],
    index: true
  },
  goiDocGia: {
    type: String,
    ref: 'MembershipPlan',
    required: [true, 'Gói đăng ký là bắt buộc']
  },
  ngayBatDau: {
    type: Date,
    default: Date.now
  },
  ngayKetThuc: {
    type: Date,
    required: [true, 'Ngày kết thúc là bắt buộc']
  },
  tongTien: {
    type: Number,
    required: true,
    min: [0, 'Tổng tiền không được âm']
  },
  giaGoc: {
    type: Number,
    min: [0, 'Giá gốc không được âm'],
    default: 0
  },
  tienVAT: {
    type: Number,
    min: [0, 'Tiền VAT không được âm'],
    default: 0
  },
  maGiamGia: {
    type: String,
    trim: true,
    uppercase: true,
    default: ''
  },
  soTienGiam: {
    type: Number,
    min: [0, 'Số tiền giảm không được âm'],
    default: 0
  },
  tongTienThanhToan: {
    type: Number,
    min: [0, 'Tổng tiền thanh toán không được âm'],
    default: 0
  },
  trangThai: {
    type: String,
    enum: ['DANG_HIEU_LUC', 'HET_HAN', 'HUY'],
    default: 'DANG_HIEU_LUC'
  },
  phuongThucThanhToan: {
    type: String,
    enum: ['THE_TIN_DUNG', 'VIETQR'],
    default: 'VIETQR'
  },
  tuDongGiaHan: {
    type: Boolean,
    default: false
  },
  thongTinThe: {
    soThe: String,
    tenTrenThe: String,
    ngayHetHan: String,
    maCVC: String
  },
  nguoiDuocMoi: {
    type: [String],
    ref: 'Reader',
    default: []
  }
}, { timestamps: true });

subscriptionSchema.path('ngayKetThuc').validate(function (value) {
  return value > this.ngayBatDau;
}, 'Ngày kết thúc gói phải lớn hơn ngày bắt đầu');

subscriptionSchema.path('docGia').validate(async function (value) {
  if (!value) return true;
  const Reader = mongoose.model('Reader');
  const session = this.$session ? this.$session() : null;
  const reader = await Reader.findById(value).session(session);
  return !!reader && !reader.isDeleted && reader.trangThai === 'ACTIVE';
}, 'Độc giả tham chiếu không tồn tại hoặc không còn hoạt động');

subscriptionSchema.path('goiDocGia').validate(async function (value) {
  if (!value) return true;
  const MembershipPlan = mongoose.model('MembershipPlan');
  const session = this.$session ? this.$session() : null;
  return !!await MembershipPlan.exists({ _id: value }).session(session);
}, 'Gói độc giả tham chiếu không tồn tại');

subscriptionSchema.pre('validate', async function (next) {
  if (this.isNew && !this._id) {
    const { nextCode } = require('../../services/codeService');
    const code = await nextCode('subscription');
    this._id = code;
    this.maDangKy = code;
  }
  next();
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
