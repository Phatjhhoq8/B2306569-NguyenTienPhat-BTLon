/**
 * Chức năng: Định nghĩa cấu trúc Schema và Model Mongoose cho Phiếu Phạt Vi Phạm (PenaltyTicket)
 * Lý do tạo: Ghi nhận sự cố mất sách, làm hỏng hoặc trễ hạn mượn sách
 */

const mongoose = require('mongoose');

const penaltyTicketSchema = new mongoose.Schema({
  _id: {
    type: String,
    trim: true
  },
  maPhieuPhat: {
    type: String,
    required: [true, 'Mã phiếu phạt là bắt buộc'],
    unique: true,
    trim: true,
    uppercase: true
  },
  phieuMuon: {
    type: String,
    ref: 'BorrowReceipt',
    required: [true, 'Phiếu mượn liên quan là bắt buộc'],
    index: true
  },
  nhanVien: {
    type: String,
    ref: 'Staff',
    required: [true, 'Nhân viên lập phiếu phạt là bắt buộc']
  },
  lyDoPhat: {
    type: String,
    required: [true, 'Lý do phạt là bắt buộc'],
    trim: true
  },
  soTienPhat: {
    type: Number,
    required: [true, 'Số tiền phạt là bắt buộc'],
    min: [0, 'Số tiền phạt không được âm']
  },
  ngayLap: {
    type: Date,
    default: Date.now
  },
  daThanhToan: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

penaltyTicketSchema.path('phieuMuon').validate(async function(value) {
  if (!value) return true;
  const BorrowReceipt = mongoose.model('BorrowReceipt');
  const session = this.$session ? this.$session() : null;
  return !!await BorrowReceipt.exists({ _id: value }).session(session);
}, 'Phiếu mượn tham chiếu không tồn tại');

penaltyTicketSchema.path('nhanVien').validate(async function(value) {
  if (!value) return true;
  const Staff = mongoose.model('Staff');
  const session = this.$session ? this.$session() : null;
  const staff = await Staff.findById(value).session(session);
  return !!staff && !staff.isDeleted;
}, 'Nhân viên tham chiếu không tồn tại hoặc đã bị xóa');

penaltyTicketSchema.pre('validate', async function(next) {
  if (this.isNew && !this._id) {
    const { nextCode } = require('../../services/codeService');
    const code = await nextCode('penaltyTicket');
    this._id = code;
    this.maPhieuPhat = code;
  }
  next();
});

module.exports = mongoose.model('PenaltyTicket', penaltyTicketSchema);
