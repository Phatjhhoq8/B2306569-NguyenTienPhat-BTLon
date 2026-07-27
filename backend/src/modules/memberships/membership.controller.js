/**
 * Chức năng: Controller điều phối request cho Gói Hội Viên (MembershipPlan) và Đăng ký (Subscription)
 * Lý do tạo: Tiếp nhận đăng ký gói, tính toán hạn sử dụng, gọi database và phản hồi JSON chuẩn
 */

const MembershipPlan = require('./membershipPlan.model');
const Subscription = require('./subscription.model');
const resultResponse = require('../../utils/resultResponse');

/**
 * Lấy danh sách gói hội viên
 */
const getPlans = async (req, res, next) => {
  try {
    const plans = await MembershipPlan.find({});
    return resultResponse.ok(res, plans);
  } catch (error) {
    next(error);
  }
};

/**
 * Đăng ký mua gói hội viên
 */
const subscribePlan = async (req, res, next) => {
  try {
    if (!req.user || req.user.role === 'STAFF') {
      return resultResponse.err(res, 'Chỉ độc giả mới có thể đăng ký gói hội viên', 403);
    }

    const { goiId } = req.body;
    if (!goiId) {
      return resultResponse.err(res, 'ID gói hội viên là bắt buộc', 400);
    }

    const plan = await MembershipPlan.findById(goiId);
    if (!plan) {
      return resultResponse.err(res, 'Gói hội viên không tồn tại', 404);
    }

    const ngayBatDau = new Date();
    const ngayKetThuc = new Date(ngayBatDau.getTime() + plan.soNgayHieuLuc * 24 * 60 * 60 * 1000);

    const subscription = new Subscription({
      docGia: req.user._id,
      goiDocGia: plan._id,
      ngayBatDau,
      ngayKetThuc,
      tongTien: plan.giaTien,
      trangThai: 'DANG_HIEU_LUC'
    });

    await subscription.save();

    return resultResponse.ok(res, subscription, 201);
  } catch (error) {
    next(error);
  }
};
// ==================== Admin: CRUD Gói hội viên ====================

const createPlan = async (req, res, next) => {
  try {
    const { tenGoi, giaTien, soNgayHieuLuc, soSachToiDa, soNgayMuonToiDa, mienTienCoc } = req.body;
    if (!tenGoi || soNgayHieuLuc === undefined || soSachToiDa === undefined || soNgayMuonToiDa === undefined) {
      return resultResponse.err(res, 'Thiếu thông tin bắt buộc để tạo gói', 400);
    }
    const plan = await MembershipPlan.create({ tenGoi, giaTien, soNgayHieuLuc, soSachToiDa, soNgayMuonToiDa, mienTienCoc });
    return resultResponse.ok(res, plan, 201);
  } catch (error) { next(error); }
};

const updatePlan = async (req, res, next) => {
  try {
    const plan = await MembershipPlan.findById(req.params.id);
    if (!plan) return resultResponse.err(res, 'Không tìm thấy gói hội viên', 404);
    const allowedUpdates = ['tenGoi', 'giaTien', 'soNgayHieuLuc', 'soSachToiDa', 'soNgayMuonToiDa', 'mienTienCoc'];
    allowedUpdates.forEach((f) => { if (req.body[f] !== undefined) plan[f] = req.body[f]; });
    await plan.save();
    return resultResponse.ok(res, plan);
  } catch (error) { next(error); }
};

const deletePlan = async (req, res, next) => {
  try {
    const plan = await MembershipPlan.findById(req.params.id);
    if (!plan) return resultResponse.err(res, 'Không tìm thấy gói hội viên', 404);
    await MembershipPlan.deleteOne({ _id: plan._id });
    return resultResponse.ok(res, { message: 'Đã xóa gói hội viên thành công' });
  } catch (error) { next(error); }
};

// ==================== Độc giả: Xem subscription cá nhân ====================

const getMySubscription = async (req, res, next) => {
  try {
    if (!req.user || req.user.role === 'STAFF') {
      return resultResponse.err(res, 'Chỉ độc giả mới có thể xem subscription', 403);
    }
    const subscriptions = await Subscription.find({ docGia: req.user._id })
      .populate('goiDocGia')
      .sort({ createdAt: -1 });
    return resultResponse.ok(res, subscriptions);
  } catch (error) { next(error); }
};

module.exports = {
  getPlans,
  subscribePlan,
  createPlan,
  updatePlan,
  deletePlan,
  getMySubscription
};
