/**
 * Chức năng: Controller điều phối request cho Mã Giảm Giá (DiscountCode)
 * Lý do tạo: Tạo mã mới, lấy danh sách mã và kiểm tra tính khả dụng của mã trước khi áp dụng
 */

const DiscountCode = require('./discountCode.model');
const discountService = require('./discount.service');
const resultResponse = require('../../utils/resultResponse');

/**
 * Tạo mã giảm giá mới
 */
const createDiscount = async (req, res, next) => {
  try {
    const { tenKhuyenMai, giaTriGiam, giaTriDonToiThieu, ngayBatDau, ngayKetThuc, soLuongMaToiDa } = req.body;

    if (!tenKhuyenMai || giaTriGiam === undefined || !ngayBatDau || !ngayKetThuc) {
      return resultResponse.err(res, 'Thiếu thông tin bắt buộc để tạo mã giảm giá', 400);
    }

    const discount = new DiscountCode({
      tenKhuyenMai,
      giaTriGiam,
      giaTriDonToiThieu: giaTriDonToiThieu || 0,
      ngayBatDau,
      ngayKetThuc,
      soLuongMaToiDa: soLuongMaToiDa || 100
    });

    await discount.save();

    return resultResponse.ok(res, discount, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Xem danh sách mã giảm giá
 */
const getDiscounts = async (req, res, next) => {
  try {
    const discounts = await DiscountCode.find({}).sort({ createdAt: -1 });
    return resultResponse.ok(res, discounts);
  } catch (error) {
    next(error);
  }
};

/**
 * Độc giả validate mã giảm giá
 */
const validateDiscount = async (req, res, next) => {
  try {
    const { code, orderAmount } = req.body;
    if (!code || orderAmount === undefined) {
      return resultResponse.err(res, 'Mã giảm giá và giá trị đơn hàng là bắt buộc', 400);
    }

    const result = await discountService.applyDiscountCode(code, orderAmount, { consume: false });
    return resultResponse.ok(res, result);
  } catch (error) {
    next(error);
  }
};

/**
 * Cập nhật mã giảm giá (Staff only)
 */
const updateDiscount = async (req, res, next) => {
  try {
    const discount = await DiscountCode.findById(req.params.id);
    if (!discount) return resultResponse.err(res, 'Không tìm thấy mã giảm giá', 404);
    const allowedUpdates = ['tenKhuyenMai', 'giaTriGiam', 'giaTriDonToiThieu', 'ngayBatDau', 'ngayKetThuc', 'soLuongMaToiDa'];
    allowedUpdates.forEach((f) => { if (req.body[f] !== undefined) discount[f] = req.body[f]; });
    await discount.save();
    return resultResponse.ok(res, discount);
  } catch (error) { next(error); }
};

/**
 * Xóa mã giảm giá (Staff only)
 */
const deleteDiscount = async (req, res, next) => {
  try {
    const discount = await DiscountCode.findById(req.params.id);
    if (!discount) return resultResponse.err(res, 'Không tìm thấy mã giảm giá', 404);
    await DiscountCode.deleteOne({ _id: discount._id });
    return resultResponse.ok(res, { message: 'Đã xóa mã giảm giá thành công' });
  } catch (error) { next(error); }
};

module.exports = {
  createDiscount,
  getDiscounts,
  validateDiscount,
  updateDiscount,
  deleteDiscount
};
