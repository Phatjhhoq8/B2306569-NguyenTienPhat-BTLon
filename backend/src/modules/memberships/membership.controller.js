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
    const userRole = req.user.role || (req.user.chucVu ? 'STAFF' : 'READER');
    if (!req.user || userRole === 'STAFF') {
      return resultResponse.err(res, 'Chỉ độc giả mới có thể đăng ký gói hội viên', 403);
    }

    const { goiId, phuongThucThanhToan, thongTinThe } = req.body;
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
      trangThai: 'DANG_HIEU_LUC',
      phuongThucThanhToan: phuongThucThanhToan || 'VIETQR',
      tuDongGiaHan: phuongThucThanhToan === 'THE_TIN_DUNG',
      thongTinThe: phuongThucThanhToan === 'THE_TIN_DUNG' ? thongTinThe : undefined
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
    const { tenGoi, giaTien, soNgayHieuLuc, soSachToiDa, soNgayMuonToiDa, mienTienCoc, choPhepGiaHanOnline, quayNhanUuTien, chiaSeNhomGiaDinh, docEbookKhongGioiHan, giaoSachTanNha, workshopDocQuyen, loaiGoi, khuyenDung, phiMuonSachGiay, phiPhatTreHan, tienDatCoc } = req.body;
    if (!tenGoi || soNgayHieuLuc === undefined || soSachToiDa === undefined || soNgayMuonToiDa === undefined) {
      return resultResponse.err(res, 'Thiếu thông tin bắt buộc để tạo gói', 400);
    }
    const plan = await MembershipPlan.create({ tenGoi, giaTien, soNgayHieuLuc, soSachToiDa, soNgayMuonToiDa, mienTienCoc, choPhepGiaHanOnline, quayNhanUuTien, chiaSeNhomGiaDinh, docEbookKhongGioiHan, giaoSachTanNha, workshopDocQuyen, loaiGoi, khuyenDung, phiMuonSachGiay, phiPhatTreHan, tienDatCoc });
    return resultResponse.ok(res, plan, 201);
  } catch (error) { next(error); }
};

const updatePlan = async (req, res, next) => {
  try {
    const plan = await MembershipPlan.findById(req.params.id);
    if (!plan) return resultResponse.err(res, 'Không tìm thấy gói hội viên', 404);
    const allowedUpdates = ['tenGoi', 'giaTien', 'soNgayHieuLuc', 'soSachToiDa', 'soNgayMuonToiDa', 'mienTienCoc', 'choPhepGiaHanOnline', 'quayNhanUuTien', 'chiaSeNhomGiaDinh', 'docEbookKhongGioiHan', 'giaoSachTanNha', 'workshopDocQuyen', 'loaiGoi', 'khuyenDung', 'phiMuonSachGiay', 'phiPhatTreHan', 'tienDatCoc'];
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

// Helper tự động gia hạn / hủy gia hạn khi hết hạn của 1 user
const checkAndUpdateSubscriptions = async (userId) => {
  const now = new Date();
  const expiredSubs = await Subscription.find({
    docGia: userId,
    trangThai: 'DANG_HIEU_LUC',
    ngayKetThuc: { $lt: now }
  }).populate('goiDocGia');

  for (const sub of expiredSubs) {
    if (sub.tuDongGiaHan && sub.goiDocGia) {
      // Đổi sub cũ thành HET_HAN
      sub.trangThai = 'HET_HAN';
      await sub.save();

      // Sinh sub mới tự động gia hạn tiếp nối
      const ngayBatDau = new Date(sub.ngayKetThuc);
      const ngayKetThuc = new Date(ngayBatDau.getTime() + sub.goiDocGia.soNgayHieuLuc * 24 * 60 * 60 * 1000);

      const newSub = new Subscription({
        docGia: userId,
        goiDocGia: sub.goiDocGia._id,
        ngayBatDau,
        ngayKetThuc,
        tongTien: sub.goiDocGia.giaTien,
        trangThai: 'DANG_HIEU_LUC',
        phuongThucThanhToan: 'THE_TIN_DUNG',
        tuDongGiaHan: true,
        thongTinThe: sub.thongTinThe
      });
      await newSub.save();
    } else {
      sub.trangThai = 'HET_HAN';
      await sub.save();
    }
  }
};

// Helper tự động gia hạn / hủy gia hạn khi hết hạn của TOÀN BỘ hệ thống (dành cho Admin)
const checkAndUpdateAllSubscriptions = async () => {
  const now = new Date();
  const expiredSubs = await Subscription.find({
    trangThai: 'DANG_HIEU_LUC',
    ngayKetThuc: { $lt: now }
  }).populate('goiDocGia');

  for (const sub of expiredSubs) {
    if (sub.tuDongGiaHan && sub.goiDocGia) {
      sub.trangThai = 'HET_HAN';
      await sub.save();

      const ngayBatDau = new Date(sub.ngayKetThuc);
      const ngayKetThuc = new Date(ngayBatDau.getTime() + sub.goiDocGia.soNgayHieuLuc * 24 * 60 * 60 * 1000);

      const newSub = new Subscription({
        docGia: sub.docGia,
        goiDocGia: sub.goiDocGia._id,
        ngayBatDau,
        ngayKetThuc,
        tongTien: sub.goiDocGia.giaTien,
        trangThai: 'DANG_HIEU_LUC',
        phuongThucThanhToan: 'THE_TIN_DUNG',
        tuDongGiaHan: true,
        thongTinThe: sub.thongTinThe
      });
      await newSub.save();
    } else {
      sub.trangThai = 'HET_HAN';
      await sub.save();
    }
  }
};

const getMySubscription = async (req, res, next) => {
  try {
    const userRole = req.user.role || (req.user.chucVu ? 'STAFF' : 'READER');
    if (!req.user || userRole === 'STAFF') {
      return resultResponse.err(res, 'Chỉ độc giả mới có thể xem subscription', 403);
    }
    
    await checkAndUpdateSubscriptions(req.user._id);

    // Tìm gói do bản thân đăng ký HOẶC gói được mời tham gia nhóm gia đình
    const subscriptions = await Subscription.find({
      $or: [
        { docGia: req.user._id },
        { nguoiDuocMoi: req.user._id }
      ]
    })
      .populate('goiDocGia')
      .sort({ createdAt: -1 });
    return resultResponse.ok(res, subscriptions);
  } catch (error) { next(error); }
};

/**
 * Độc giả liên kết tham gia vào nhóm gia đình của một độc giả khác
 */
const linkFamilyInvite = async (req, res, next) => {
  try {
    const userRole = req.user.role || (req.user.chucVu ? 'STAFF' : 'READER');
    if (!req.user || userRole === 'STAFF') {
      return resultResponse.err(res, 'Chỉ độc giả mới có thể tham gia nhóm gia đình', 403);
    }

    const { maDocGiaMoi } = req.body;
    if (!maDocGiaMoi) {
      return resultResponse.err(res, 'Mã độc giả người mời là bắt buộc', 400);
    }

    const targetCode = maDocGiaMoi.trim().toUpperCase();

    if (req.user._id === targetCode) {
      return resultResponse.err(res, 'Bạn không thể tự tham gia nhóm của chính mình', 400);
    }

    // Tìm gói hội viên đang hiệu lực của người mời
    const inviterSub = await Subscription.findOne({
      docGia: targetCode,
      trangThai: 'DANG_HIEU_LUC'
    }).populate('goiDocGia');

    if (!inviterSub) {
      return resultResponse.err(res, 'Không tìm thấy gói hội viên đang kích hoạt của độc giả này', 404);
    }

    const planName = inviterSub.goiDocGia?.tenGoi || '';
    if (!planName.toLowerCase().includes('gold') && !planName.toLowerCase().includes('vàng') && !planName.toLowerCase().includes('family')) {
      return resultResponse.err(res, 'Chỉ gói Vàng (Family) mới hỗ trợ chia sẻ thành viên nhóm gia đình', 400);
    }

    if (inviterSub.nguoiDuocMoi.includes(req.user._id)) {
      return resultResponse.err(res, 'Bạn đã ở trong nhóm gia đình của độc giả này rồi', 400);
    }

    // 1 chính + tối đa 2 người được thêm (nguoiDuocMoi.length < 2)
    if (inviterSub.nguoiDuocMoi.length >= 2) {
      return resultResponse.err(res, 'Nhóm gia đình của độc giả này đã đạt số lượng tối đa (3 người gồm 1 chính + 2 mời)', 400);
    }

    // Hủy các gói đang kích hoạt của người tham gia nếu có
    await Subscription.updateMany(
      { docGia: req.user._id, trangThai: 'DANG_HIEU_LUC' },
      { $set: { trangThai: 'HUY' } }
    );

    // Thêm người dùng vào danh sách thành viên phụ
    inviterSub.nguoiDuocMoi.push(req.user._id);
    await inviterSub.save();

    return resultResponse.ok(res, {
      message: `Tham gia nhóm gia đình của độc giả ${targetCode} thành công!`,
      subscription: inviterSub
    });
  } catch (error) {
    next(error);
  }
};

const cancelAutoRenew = async (req, res, next) => {
  try {
    const userRole = req.user.role || (req.user.chucVu ? 'STAFF' : 'READER');
    if (!req.user || userRole === 'STAFF') {
      return resultResponse.err(res, 'Chỉ độc giả mới có thể hủy gia hạn', 403);
    }

    const subscription = await Subscription.findOne({
      docGia: req.user._id,
      trangThai: 'DANG_HIEU_LUC',
      phuongThucThanhToan: 'THE_TIN_DUNG',
      tuDongGiaHan: true
    });

    if (!subscription) {
      return resultResponse.err(res, 'Không tìm thấy gói gia hạn tự động nào đang hoạt động', 404);
    }

    subscription.tuDongGiaHan = false;
    await subscription.save();

    return resultResponse.ok(res, {
      message: 'Đã hủy tự động gia hạn thành công. Gói sẽ kết thúc khi hết hạn.',
      subscription
    });
  } catch (error) {
    next(error);
  }
};

const getAllSubscriptions = async (req, res, next) => {
  try {
    const userRole = req.user.role || (req.user.chucVu ? 'STAFF' : 'READER');
    if (!req.user || userRole !== 'STAFF') {
      return resultResponse.err(res, 'Chỉ nhân viên mới có thể xem tất cả đăng ký gói', 403);
    }

    await checkAndUpdateAllSubscriptions();

    const subscriptions = await Subscription.find({})
      .populate('docGia')
      .populate('goiDocGia')
      .sort({ createdAt: -1 });

    return resultResponse.ok(res, subscriptions);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlans,
  subscribePlan,
  createPlan,
  updatePlan,
  deletePlan,
  getMySubscription,
  linkFamilyInvite,
  cancelAutoRenew,
  getAllSubscriptions
};
