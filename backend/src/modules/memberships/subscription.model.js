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
  trangThai: {
    type: String,
    enum: ['DANG_HIEU_LUC', 'HET_HAN', 'HUY'],
    default: 'DANG_HIEU_LUC'
  },
  nguoiDuocMoi: {
    type: [String],
    ref: 'Reader',
    default: []
  }
}, { timestamps: true });

subscriptionSchema.index(
  { docGia: 1, trangThai: 1 },
  {
    unique: true,
    partialFilterExpression: { trangThai: 'DANG_HIEU_LUC' }
  }
);

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

// Trigger tự động hủy gói subscription cũ khi đăng ký gói mới
subscriptionSchema.pre('save', async function (next) {
  if (this.isNew && this.trangThai === 'DANG_HIEU_LUC') {
    const Subscription = mongoose.model('Subscription');
    const session = this.$session();
    await Subscription.updateMany(
      {
        docGia: this.docGia,
        trangThai: 'DANG_HIEU_LUC',
        _id: { $ne: this._id }
      },
      { $set: { trangThai: 'HUY' } }
    ).session(session);
  }
  next();
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
