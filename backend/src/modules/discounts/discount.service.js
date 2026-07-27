/**
 * Chức năng: Kiểm tra và sử dụng mã giảm giá an toàn đồng thời
 * Lý do tạo: Đảm bảo mã còn hạn, đủ điều kiện đơn tối thiểu và không dùng vượt số lượt tối đa
 */

const DiscountCode = require('./discountCode.model');

const normalizeCode = (code) => String(code || '').trim().toUpperCase();

const applyDiscountCode = async (code, orderAmount, { session = null, consume = true } = {}) => {
  const maCode = normalizeCode(code);
  const amount = Number(orderAmount || 0);
  const now = new Date();

  if (!maCode) throw new Error('Mã giảm giá là bắt buộc');
  if (amount < 0) throw new Error('Giá trị đơn hàng không được âm');

  const filter = {
    maCode,
    ngayBatDau: { $lte: now },
    ngayKetThuc: { $gte: now },
    giaTriDonToiThieu: { $lte: amount },
    $expr: { $lt: ['$soLuotDaDung', '$soLuongMaToiDa'] }
  };

  const query = consume
    ? DiscountCode.findOneAndUpdate(filter, { $inc: { soLuotDaDung: 1 } }, { new: true })
    : DiscountCode.findOne(filter);

  const discountCode = await query.session(session);
  if (!discountCode) {
    throw new Error('Mã giảm giá không hợp lệ, đã hết hạn, chưa đạt đơn tối thiểu hoặc đã hết lượt sử dụng');
  }

  const discountAmount = Math.min(discountCode.giaTriGiam, amount);
  return {
    discountCode,
    discountAmount,
    finalAmount: amount - discountAmount
  };
};

module.exports = { applyDiscountCode };
