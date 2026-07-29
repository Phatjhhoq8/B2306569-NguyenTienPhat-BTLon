/**
 * Chức năng: Controller điều phối request cho Gói Hội Viên (MembershipPlan) và Đăng ký (Subscription)
 * Lý do tạo: Tiếp nhận đăng ký gói, tính toán hạn sử dụng, gọi database và phản hồi JSON chuẩn
 */

const MembershipPlan = require('./membershipPlan.model');
const Subscription = require('./subscription.model');
const resultResponse = require('../../utils/resultResponse');
const mongoose = require('mongoose');
const { getActiveSubscriptions } = require('./membershipPrivileges');
const discountService = require('../discounts/discount.service');

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

    const { goiId, phuongThucThanhToan, thongTinThe, tuDongGiaHan, discountCode } = req.body;
    if (!goiId) {
      return resultResponse.err(res, 'ID gói hội viên là bắt buộc', 400);
    }

    const plan = await MembershipPlan.findById(goiId);
    if (!plan) {
      return resultResponse.err(res, 'Gói hội viên không tồn tại', 404);
    }

    await Subscription.collection.dropIndex('docGia_1_trangThai_1').catch((error) => {
      if (error.codeName !== 'IndexNotFound' && error.code !== 27) throw error;
    });

    const baseAmount = Number(plan.giaTien || 0);
    const discountResult = discountCode
      ? await discountService.applyDiscountCode(discountCode, baseAmount, { consume: true, apDungCho: 'GOI_HOI_VIEN' })
      : null;
    const soTienGiam = discountResult ? discountResult.discountAmount : 0;
    const tongTienThanhToan = discountResult ? discountResult.finalAmount : baseAmount;
    const maGiamGia = discountResult ? discountResult.discountCode.maCode : '';

    const ngayBatDau = new Date();
    const existingSubscription = await Subscription.findOne({
      docGia: req.user._id,
      goiDocGia: plan._id,
      trangThai: 'DANG_HIEU_LUC',
      ngayBatDau: { $lte: ngayBatDau },
      ngayKetThuc: { $gte: ngayBatDau }
    });

    if (existingSubscription) {
      existingSubscription.ngayKetThuc = new Date(existingSubscription.ngayKetThuc.getTime() + plan.soNgayHieuLuc * 24 * 60 * 60 * 1000);
      existingSubscription.giaGoc = (existingSubscription.giaGoc || 0) + baseAmount;
      existingSubscription.maGiamGia = maGiamGia || existingSubscription.maGiamGia;
      existingSubscription.soTienGiam = (existingSubscription.soTienGiam || 0) + soTienGiam;
      existingSubscription.tongTienThanhToan = (existingSubscription.tongTienThanhToan || existingSubscription.tongTien || 0) + tongTienThanhToan;
      existingSubscription.tongTien = existingSubscription.tongTienThanhToan;
      existingSubscription.phuongThucThanhToan = phuongThucThanhToan || 'VIETQR';
      existingSubscription.tuDongGiaHan = tuDongGiaHan !== undefined ? tuDongGiaHan : (phuongThucThanhToan === 'THE_TIN_DUNG');
      existingSubscription.thongTinThe = phuongThucThanhToan === 'THE_TIN_DUNG' ? thongTinThe : undefined;
      await existingSubscription.save();

      return resultResponse.ok(res, existingSubscription, 200);
    }

    const ngayKetThuc = new Date(ngayBatDau.getTime() + plan.soNgayHieuLuc * 24 * 60 * 60 * 1000);

    const subscription = new Subscription({
      docGia: req.user._id,
      goiDocGia: plan._id,
      ngayBatDau,
      ngayKetThuc,
      giaGoc: baseAmount,
      tienVAT: 0,
      maGiamGia,
      soTienGiam,
      tongTienThanhToan,
      tongTien: tongTienThanhToan,
      trangThai: 'DANG_HIEU_LUC',
      phuongThucThanhToan: phuongThucThanhToan || 'VIETQR',
      tuDongGiaHan: tuDongGiaHan !== undefined ? tuDongGiaHan : (phuongThucThanhToan === 'THE_TIN_DUNG'),
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
        giaGoc: sub.goiDocGia.giaTien,
        tienVAT: 0,
        soTienGiam: 0,
        tongTienThanhToan: sub.goiDocGia.giaTien,
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
        giaGoc: sub.goiDocGia.giaTien,
        tienVAT: 0,
        soTienGiam: 0,
        tongTienThanhToan: sub.goiDocGia.giaTien,
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
      return resultResponse.err(res, 'Chỉ độc giả mới có thể quản lý nhóm gia đình', 403);
    }

    const { maDocGiaMoi } = req.body;
    if (!maDocGiaMoi) {
      return resultResponse.err(res, 'Mã độc giả thành viên được mời là bắt buộc', 400);
    }

    const targetCode = maDocGiaMoi.trim().toUpperCase();

    if (req.user._id === targetCode) {
      return resultResponse.err(res, 'Bạn không thể tự mời chính mình vào nhóm', 400);
    }

    // 1. Kiểm tra độc giả được mời có tồn tại và đang hoạt động không
    const Reader = mongoose.model('Reader');
    const targetReader = await Reader.findById(targetCode);
    if (!targetReader || targetReader.isDeleted || targetReader.trangThai !== 'ACTIVE') {
      return resultResponse.err(res, 'Độc giả được mời không tồn tại hoặc tài khoản đã bị khóa/xóa', 404);
    }

    // 2. Tìm gói hội viên đang hiệu lực của CHỦ NHÓM (người gửi request)
    const ownerSubs = await getActiveSubscriptions(req.user._id);
    const ownerSub = ownerSubs.find((sub) => {
      const plan = sub.goiDocGia;
      const planName = plan?.tenGoi || '';
      return plan && (
        plan.chiaSeNhomGiaDinh ||
        planName.toLowerCase().includes('gold') ||
        planName.toLowerCase().includes('vàng') ||
        planName.toLowerCase().includes('family')
      ) && sub.nguoiDuocMoi.length < 2;
    });

    if (!ownerSub) {
      return resultResponse.err(res, 'Bạn chưa kích hoạt gói hội viên nào có hỗ trợ chia sẻ nhóm gia đình', 400);
    }

    if (ownerSub.nguoiDuocMoi.includes(targetCode)) {
      return resultResponse.err(res, 'Độc giả này đã nằm trong nhóm gia đình của bạn', 400);
    }

    // 3. 1 chính + tối đa 2 người được thêm (nguoiDuocMoi.length < 2)
    if (ownerSub.nguoiDuocMoi.length >= 2) {
      return resultResponse.err(res, 'Nhóm gia đình của bạn đã đạt số lượng tối đa (3 người gồm 1 chủ nhóm + 2 thành viên phụ)', 400);
    }

    // 4. Thêm người dùng vào danh sách thành viên phụ của chủ nhóm, không hủy gói riêng của người được mời.
    ownerSub.nguoiDuocMoi.push(targetCode);
    await ownerSub.save();

    return resultResponse.ok(res, {
      message: `Đã thêm độc giả ${targetCode} vào nhóm gia đình của bạn thành công!`,
      subscription: ownerSub
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

const enableAutoRenew = async (req, res, next) => {
  try {
    const userRole = req.user.role || (req.user.chucVu ? 'STAFF' : 'READER');
    if (!req.user || userRole === 'STAFF') {
      return resultResponse.err(res, 'Chỉ độc giả mới có thể bật tự động gia hạn', 403);
    }

    const now = new Date();
    const subscription = await Subscription.findOne({
      docGia: req.user._id,
      trangThai: 'DANG_HIEU_LUC',
      ngayBatDau: { $lte: now },
      ngayKetThuc: { $gte: now }
    }).populate('goiDocGia');

    if (!subscription) {
      return resultResponse.err(res, 'Không tìm thấy gói hội viên đang hiệu lực để bật tự động gia hạn', 404);
    }
    if (subscription.phuongThucThanhToan !== 'THE_TIN_DUNG') {
      return resultResponse.err(res, 'Chỉ gói thanh toán bằng thẻ tín dụng/ghi nợ mới hỗ trợ tự động gia hạn', 400);
    }

    const cardInfo = subscription.thongTinThe || {};
    if (!cardInfo.soThe || !cardInfo.tenTrenThe || !cardInfo.ngayHetHan || !cardInfo.maCVC) {
      return resultResponse.err(res, 'Không tìm thấy thông tin thẻ hợp lệ để bật tự động gia hạn', 400);
    }

    subscription.tuDongGiaHan = true;
    await subscription.save();

    return resultResponse.ok(res, {
      message: 'Đã bật lại tự động gia hạn thành công.',
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
  enableAutoRenew,
  getAllSubscriptions
};
