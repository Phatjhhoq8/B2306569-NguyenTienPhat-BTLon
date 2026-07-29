/**
 * Chức năng: Controller điều phối request cho Mượn/Trả Sách và Phiếu Phạt
 * Lý do tạo: Tiếp nhận thông tin từ router, xác thực dữ liệu, gọi service nghiệp vụ và phản hồi JSON
 */

const mongoose = require('mongoose');
const BorrowReceipt = require('./borrowReceipt.model');
const PenaltyTicket = require('./penaltyTicket.model');
const borrowService = require('./borrow.service');
const resultResponse = require('../../utils/resultResponse');
const discountService = require('../discounts/discount.service');
const { getEffectiveMembershipPlan } = require('../memberships/membershipPrivileges');

const getSubscriptionPaidAmount = (subscription) => {
  return subscription?.tongTienThanhToan ?? subscription?.tongTien ?? subscription?.giaGoc ?? 0;
};

const isChargeableBookTitle = (title) => {
  const name = (title?.tenSach || '').toLowerCase();
  const category = (title?.theLoai || '').toString().toLowerCase();
  return !(name.includes('giáo trình') ||
    name.includes('bài tập') ||
    name.includes('sách giáo khoa') ||
    category.includes('giáo dục') ||
    category.includes('ngoại ngữ') ||
    category.includes('khoa học'));
};

const calculateBorrowFee = async ({ copyIds, readerId, ngayHenTra }) => {
  const membershipPlan = await getEffectiveMembershipPlan(readerId);
  if (!membershipPlan) throw new Error('Độc giả không có gói hội viên còn hiệu lực để mượn sách');

  const BookCopy = mongoose.model('BookCopy');
  const copies = await BookCopy.find({ _id: { $in: copyIds } }).populate('dauSach');
  const baseFee = copies.reduce((sum, copy) => {
    return sum + (isChargeableBookTitle(copy.dauSach) ? Number(membershipPlan.phiMuonSachGiay || 0) : 0);
  }, 0);
  const borrowDays = Math.ceil((new Date(ngayHenTra).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  return baseFee * (borrowDays > 0 ? borrowDays : 1);
};

/**
 * Độc giả đăng ký mượn sách
 */
const createReceipt = async (req, res, next) => {
  try {
    if (!req.user || req.user.role === 'STAFF') {
      return resultResponse.err(res, 'Chỉ độc giả mới được phép đăng ký mượn sách', 403);
    }

    const { chiTietMuon, ngayHenTra, discountCode } = req.body;
    if (!chiTietMuon || chiTietMuon.length === 0 || !ngayHenTra) {
      return resultResponse.err(res, 'Thông tin mượn sách và ngày hẹn trả là bắt buộc', 400);
    }

    const BookCopy = mongoose.model('BookCopy');
    const BookTitle = mongoose.model('BookTitle');

    const formattedChiTietMuon = [];
    const reservedCopyIds = new Set();
    for (const item of chiTietMuon) {
      const soLuong = Math.max(1, parseInt(item.soLuong, 10) || 1);
      let copy = await BookCopy.findOne({ _id: item.sach, isDeleted: false });
      
      if (!copy) {
        // Tìm đủ số bản sao khả dụng của BookTitle theo số lượng độc giả chọn.
        const copies = await BookCopy.find({ 
          dauSach: item.sach, 
          tinhTrang: 'CHO_MUON', 
          isDeleted: false,
          _id: { $nin: Array.from(reservedCopyIds) }
        }).limit(soLuong);
        
        if (copies.length < soLuong) {
          const title = await BookTitle.findById(item.sach);
          const bookName = title ? `"${title.tenSach}"` : `ID ${item.sach}`;
          return resultResponse.err(res, `Đầu sách ${bookName} chỉ còn ${copies.length} bản khả dụng để mượn`, 400);
        }

        for (const availableCopy of copies) {
          reservedCopyIds.add(String(availableCopy._id));
          formattedChiTietMuon.push({
            sach: availableCopy._id,
            tinhTrangLucMuon: item.tinhTrangLucMuon || availableCopy.ghiChu || 'Tốt',
            daTraChua: false
          });
        }
        continue;
      } else {
        if (soLuong > 1) {
          return resultResponse.err(res, 'Mã cuốn sách vật lý chỉ được đăng ký số lượng 1. Vui lòng gửi mã đầu sách nếu muốn mượn nhiều bản.', 400);
        }
        if (copy.tinhTrang !== 'CHO_MUON') {
          const title = await BookTitle.findById(copy.dauSach);
          const bookName = title ? `"${title.tenSach}"` : `Mã sách ${copy._id}`;
          return resultResponse.err(res, `Cuốn sách ${bookName} hiện đang bận hoặc bảo trì`, 400);
        }
        if (reservedCopyIds.has(String(copy._id))) {
          return resultResponse.err(res, `Cuốn sách ${copy._id} đã được chọn trùng trong phiếu mượn`, 400);
        }
      }

      reservedCopyIds.add(String(copy._id));
      formattedChiTietMuon.push({
        sach: copy._id,
        tinhTrangLucMuon: item.tinhTrangLucMuon || copy.ghiChu || 'Tốt',
        daTraChua: false
      });
    }

    const phiMuon = await calculateBorrowFee({
      copyIds: formattedChiTietMuon.map(item => item.sach),
      readerId: req.user._id,
      ngayHenTra
    });
    const discountResult = discountCode
      ? await discountService.applyDiscountCode(discountCode, phiMuon, { consume: true, apDungCho: 'MUON_SACH' })
      : null;
    const soTienGiam = discountResult ? discountResult.discountAmount : 0;
    const tongTienThanhToan = discountResult ? discountResult.finalAmount : phiMuon;

    const receipt = await borrowService.createBorrowReceipt({
      docGia: req.user._id,
      chiTietMuon: formattedChiTietMuon,
      ngayMuon: new Date(),
      ngayHenTra,
      phiMuon,
      tongTienTamTinh: phiMuon,
      maGiamGia: discountResult ? discountResult.discountCode.maCode : '',
      soTienGiam,
      tongTienThanhToan,
      trangThai: 'SAN_SANG'
    });

    return resultResponse.ok(res, receipt, 201);
  } catch (error) {
    next(error);
  }
};

const approveReceipt = async (req, res, next) => {
  try {
    const receipt = await borrowService.approveBorrowReceipt(req.params.id, req.user && req.user._id);
    return resultResponse.ok(res, receipt);
  } catch (error) {
    next(error);
  }
};

/**
 * Nhân viên giao sách cho độc giả (SAN_SANG → DANG_MUON)
 * Thời điểm này mới bắt đầu tính ngày mượn, hạn trả và phí
 */
const pickupReceipt = async (req, res, next) => {
  try {
    const receipt = await borrowService.pickupBorrowReceipt(req.params.id, req.user && req.user._id);
    return resultResponse.ok(res, receipt);
  } catch (error) {
    next(error);
  }
};

const renewReceipt = async (req, res, next) => {
  try {
    const receipt = await BorrowReceipt.findById(req.params.id);
    if (!receipt) return resultResponse.err(res, 'Không tìm thấy phiếu mượn', 404);

    const isReaderOwner = req.user && !req.user.chucVu && String(receipt.docGia) === String(req.user._id);
    const isStaff = req.user && req.user.chucVu;
    if (!isReaderOwner && !isStaff) {
      return resultResponse.err(res, 'Bạn không có quyền gia hạn phiếu mượn này', 403);
    }

    if (!req.body.ngayHenTraMoi) {
      return resultResponse.err(res, 'Ngày hẹn trả mới là bắt buộc', 400);
    }

    const renewed = await borrowService.renewBorrowReceipt(req.params.id, req.body.ngayHenTraMoi);
    return resultResponse.ok(res, renewed);
  } catch (error) {
    next(error);
  }
};

/**
 * Độc giả xem danh sách phiếu mượn cá nhân
 */
const getMyReceipts = async (req, res, next) => {
  try {
    if (!req.user || req.user.role === 'STAFF') {
      return resultResponse.err(res, 'Chỉ độc giả mới có thể xem lịch sử cá nhân', 403);
    }

    const receipts = await BorrowReceipt.find({ docGia: req.user._id })
      .populate({
        path: 'chiTietMuon.sach',
        populate: { path: 'dauSach' }
      })
      .sort({ createdAt: -1 });

    return resultResponse.ok(res, receipts);
  } catch (error) {
    next(error);
  }
};

/**
 * Thủ thư/Quản lý xem danh sách toàn bộ phiếu mượn
 */
const getReceipts = async (req, res, next) => {
  try {
    const { status, readerId, q } = req.query;
    const filter = {};

    if (status) {
      filter.trangThai = status === 'PENDING' ? 'CHO_DUYET' : status;
    }
    if (readerId) {
      filter.docGia = readerId;
    }

    if (q) {
      const Reader = mongoose.model('Reader');
      const matchingReaders = await Reader.find({
        $or: [
          { hoLot: { $regex: String(q), $options: 'i' } },
          { ten: { $regex: String(q), $options: 'i' } },
          { email: { $regex: String(q), $options: 'i' } },
          { dienThoai: { $regex: String(q), $options: 'i' } },
          { maDocGia: { $regex: String(q), $options: 'i' } }
        ],
        isDeleted: false
      });
      const matchingReaderIds = matchingReaders.map(r => r._id);

      filter.$or = [
        { maPhieu: { $regex: String(q), $options: 'i' } },
        { docGia: { $in: matchingReaderIds } }
      ];
    }

    const receipts = await BorrowReceipt.find(filter)
      .populate('docGia')
      .populate({
        path: 'chiTietMuon.sach',
        populate: { path: 'dauSach' }
      })
      .sort({ createdAt: -1 });

    return resultResponse.ok(res, receipts);
  } catch (error) {
    next(error);
  }
};

/**
 * Ghi nhận trả sách (Thủ thư thực hiện)
 */
const returnReceipt = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { chiTietMuon, ngayTraThucTe } = req.body;

    const receipt = await borrowService.returnBorrowReceipt(id, {
      chiTietMuon,
      ngayTraThucTe: ngayTraThucTe || new Date()
    });

    return resultResponse.ok(res, receipt);
  } catch (error) {
    next(error);
  }
};

/**
 * Hủy phiếu mượn (chỉ khi sách chưa được giao thực tế)
 */
const cancelReceipt = async (req, res, next) => {
  try {
    const { id } = req.params;
    const receipt = await BorrowReceipt.findById(id);
    if (!receipt) {
      return resultResponse.err(res, 'Không tìm thấy phiếu mượn', 404);
    }

    const isReader = req.user && req.user.role === 'READER';
    if (isReader && String(receipt.docGia) !== String(req.user._id)) {
      return resultResponse.err(res, 'Bạn không có quyền hủy phiếu mượn này', 403);
    }

    const cancelled = await borrowService.cancelBorrowReceipt(id);
    return resultResponse.ok(res, cancelled);
  } catch (error) {
    next(error);
  }
};

/**
 * Xem toàn bộ danh sách phiếu phạt (Chỉ nhân viên)
 */
const getPenalties = async (req, res, next) => {
  try {
    const penalties = await PenaltyTicket.find({})
      .populate('phieuMuon')
      .populate('nhanVien')
      .sort({ createdAt: -1 });

    return resultResponse.ok(res, penalties);
  } catch (error) {
    next(error);
  }
};

const createPenalty = async (req, res, next) => {
  try {
    const { phieuMuon, lyDoPhat, soTienPhat } = req.body;
    if (!phieuMuon || !lyDoPhat || soTienPhat === undefined) {
      return resultResponse.err(res, 'Phiếu mượn, lý do phạt và số tiền phạt là bắt buộc', 400);
    }

    const receipt = await BorrowReceipt.findById(phieuMuon);
    if (!receipt) return resultResponse.err(res, 'Không tìm thấy phiếu mượn liên quan', 404);

    const penalty = await PenaltyTicket.create({
      phieuMuon,
      nhanVien: req.user._id,
      lyDoPhat,
      soTienPhat,
      daThanhToan: false
    });

    return resultResponse.ok(res, penalty, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Xem danh sách phiếu phạt của bản thân độc giả
 */
const getMyPenalties = async (req, res, next) => {
  try {
    if (!req.user || req.user.role === 'STAFF') {
      return resultResponse.err(res, 'Chỉ độc giả mới có thể xem phiếu phạt cá nhân', 403);
    }

    const myReceipts = await BorrowReceipt.find({ docGia: req.user._id }).select('_id');
    const myReceiptIds = myReceipts.map((r) => r._id);

    const penalties = await PenaltyTicket.find({ phieuMuon: { $in: myReceiptIds } })
      .populate('phieuMuon')
      .sort({ createdAt: -1 });

    return resultResponse.ok(res, penalties);
  } catch (error) {
    next(error);
  }
};

/**
 * Thanh toán tiền phạt (Nhân viên ghi nhận)
 */
const payPenalty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const penalty = await PenaltyTicket.findById(id).populate('phieuMuon');
    
    if (!penalty) {
      return resultResponse.err(res, 'Không tìm thấy phiếu phạt', 404);
    }

    const userRole = req.user.role || (req.user.chucVu ? 'STAFF' : 'READER');
    if (userRole === 'READER' && penalty.phieuMuon && String(penalty.phieuMuon.docGia) !== String(req.user._id)) {
      return resultResponse.err(res, 'Bạn không có quyền thanh toán phiếu phạt này', 403);
    }

    penalty.daThanhToan = true;
    await penalty.save();

    return resultResponse.ok(res, penalty);
  } catch (error) {
    next(error);
  }
};

/**
 * Xem chi tiết 1 phiếu mượn theo ID
 */
const getReceiptById = async (req, res, next) => {
  try {
    const receipt = await BorrowReceipt.findById(req.params.id)
      .populate('docGia')
      .populate({ path: 'chiTietMuon.sach', populate: { path: 'dauSach' } });
    if (!receipt) return resultResponse.err(res, 'Không tìm thấy phiếu mượn', 404);
    return resultResponse.ok(res, receipt);
  } catch (error) { next(error); }
};

/**
 * Thống kê tài chính hệ thống (Admin/Staff)
 */
const getFinancialStats = async (req, res, next) => {
  try {
    const Subscription = mongoose.model('Subscription');

    const now = new Date();
    const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const startOfWeek = (date) => {
      const d = startOfDay(date);
      const day = d.getDay() || 7;
      d.setDate(d.getDate() - day + 1);
      return d;
    };
    const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
    const weekStart = startOfWeek(now);
    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const monthStart = startOfMonth(now);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const getReceiptRevenueDate = (receipt) => receipt.ngayTraThucTe || receipt.updatedAt || receipt.createdAt;
    const getRevenueInRange = ({ receipts, penalties, subscriptions }, from, to) => {
      const inRange = (date) => {
        const value = date ? new Date(date) : null;
        return value && value >= from && value < to;
      };

      const phiMuon = receipts
        .filter(r => inRange(getReceiptRevenueDate(r)))
        .reduce((sum, r) => sum + (r.tongTienThanhToan || 0), 0);
      const tienPhatDaThu = penalties
        .filter(p => p.daThanhToan && inRange(p.updatedAt || p.ngayLap || p.createdAt))
        .reduce((sum, p) => sum + (p.soTienPhat || 0), 0);
      const doanhThuHoiVien = subscriptions
        .filter(s => inRange(s.createdAt || s.ngayBatDau))
        .reduce((sum, s) => sum + getSubscriptionPaidAmount(s), 0);

      return {
        phiMuon,
        tienPhatDaThu,
        doanhThuHoiVien,
        tongDoanhThu: phiMuon + tienPhatDaThu + doanhThuHoiVien
      };
    };
    const compareRevenue = (current, previous) => {
      const diff = current - previous;
      const percent = previous > 0 ? (diff / previous) * 100 : (current > 0 ? 100 : 0);
      return {
        current,
        previous,
        diff,
        percent: Number(percent.toFixed(2)),
        trend: diff > 0 ? 'UP' : (diff < 0 ? 'DOWN' : 'FLAT')
      };
    };

    // Tính tổng phí mượn sách từ các phiếu đã trả (DA_TRA)
    const paidReceipts = await BorrowReceipt.find({ trangThai: 'DA_TRA' }).select('tongTienThanhToan tienCoc ngayTraThucTe updatedAt createdAt');
    const tongPhiMuon = paidReceipts.reduce((sum, r) => sum + (r.tongTienThanhToan || 0), 0);
    const soPhieuDaTra = paidReceipts.length;
    const pendingReceipts = await BorrowReceipt.find({
      trangThai: { $in: ['SAN_SANG', 'DANG_MUON', 'QUA_HAN'] }
    }).select('tongTienThanhToan');
    const phiMuonDangXuLy = pendingReceipts.reduce((sum, r) => sum + (r.tongTienThanhToan || 0), 0);
    const soPhieuDangXuLyPhi = pendingReceipts.length;

    // Tính tổng tiền phạt
    const allPenalties = await PenaltyTicket.find().select('soTienPhat daThanhToan ngayLap updatedAt createdAt');
    const tongTienPhat = allPenalties.reduce((sum, p) => sum + (p.soTienPhat || 0), 0);
    const tienPhatDaThu = allPenalties
      .filter(p => p.daThanhToan)
      .reduce((sum, p) => sum + (p.soTienPhat || 0), 0);
    const tienPhatChuaThu = tongTienPhat - tienPhatDaThu;

    // Doanh thu từ gói hội viên (Subscription có trạng thái DANG_HIEU_LUC hoặc HET_HAN — đã mua)
    const allSubs = await Subscription.find({
      trangThai: { $in: ['DANG_HIEU_LUC', 'HET_HAN'] }
    }).select('tongTien tongTienThanhToan giaGoc ngayBatDau createdAt');
    const doanhThuHoiVien = allSubs.reduce((sum, s) => sum + getSubscriptionPaidAmount(s), 0);
    const soGoiDaBan = allSubs.length;

    // Tổng tiền cọc đang giữ (phiếu DANG_MUON hoặc QUA_HAN)
    const activeReceipts = await BorrowReceipt.find({
      trangThai: { $in: ['DANG_MUON', 'QUA_HAN'] }
    }).select('tienCoc');
    const tongTienCoc = activeReceipts.reduce((sum, r) => sum + (r.tienCoc || 0), 0);
    const soPhieuDangMuon = activeReceipts.length;

    const tongDoanhThu = tongPhiMuon + tienPhatDaThu + doanhThuHoiVien;
    const periodSource = {
      receipts: paidReceipts,
      penalties: allPenalties,
      subscriptions: allSubs
    };
    const weekThis = getRevenueInRange(periodSource, weekStart, now);
    const weekPrevious = getRevenueInRange(periodSource, prevWeekStart, weekStart);
    const monthThis = getRevenueInRange(periodSource, monthStart, now);
    const monthPrevious = getRevenueInRange(periodSource, prevMonthStart, monthStart);
    const breakdown = {
      phiMuon: { amount: tongPhiMuon, count: soPhieuDaTra },
      tienPhatDaThu: { amount: tienPhatDaThu, count: allPenalties.filter(p => p.daThanhToan).length },
      tienPhatChuaThu: { amount: tienPhatChuaThu, count: allPenalties.filter(p => !p.daThanhToan).length },
      doanhThuHoiVien: { amount: doanhThuHoiVien, count: soGoiDaBan },
      tienCocDangGiu: { amount: tongTienCoc, count: soPhieuDangMuon }
    };

    const [membershipPurchasesRaw, borrowPaymentsRaw, penaltyPaymentsRaw] = await Promise.all([
      Subscription.find({ trangThai: { $in: ['DANG_HIEU_LUC', 'HET_HAN'] } })
        .populate('docGia')
        .populate('goiDocGia')
        .sort({ createdAt: -1 }),
      BorrowReceipt.find({})
        .populate('docGia')
        .populate({ path: 'chiTietMuon.sach', populate: { path: 'dauSach' } })
        .sort({ createdAt: -1 }),
      PenaltyTicket.find({})
        .populate({ path: 'phieuMuon', populate: { path: 'docGia' } })
        .populate('nhanVien')
        .sort({ createdAt: -1 })
    ]);

    const membershipPurchases = membershipPurchasesRaw.map((sub) => ({
      id: sub._id,
      maDangKy: sub.maDangKy,
      docGia: sub.docGia ? {
        id: sub.docGia._id,
        maDocGia: sub.docGia.maDocGia,
        hoTen: `${sub.docGia.hoLot || ''} ${sub.docGia.ten || ''}`.trim(),
        email: sub.docGia.email,
        dienThoai: sub.docGia.dienThoai
      } : null,
      goiDocGia: sub.goiDocGia ? {
        id: sub.goiDocGia._id,
        maGoi: sub.goiDocGia.maGoi,
        tenGoi: sub.goiDocGia.tenGoi
      } : null,
      giaGoc: sub.giaGoc ?? sub.goiDocGia?.giaTien ?? 0,
      soTienGiam: sub.soTienGiam || 0,
      maGiamGia: sub.maGiamGia || '',
      tongTienThanhToan: getSubscriptionPaidAmount(sub),
      tongTien: getSubscriptionPaidAmount(sub),
      phuongThucThanhToan: sub.phuongThucThanhToan,
      tuDongGiaHan: sub.tuDongGiaHan,
      ngayBatDau: sub.ngayBatDau,
      ngayKetThuc: sub.ngayKetThuc,
      trangThai: sub.trangThai,
      createdAt: sub.createdAt
    }));

    const borrowPayments = borrowPaymentsRaw.map((receipt) => ({
      id: receipt._id,
      maPhieu: receipt.maPhieu,
      docGia: receipt.docGia ? {
        id: receipt.docGia._id,
        maDocGia: receipt.docGia.maDocGia,
        hoTen: `${receipt.docGia.hoLot || ''} ${receipt.docGia.ten || ''}`.trim(),
        email: receipt.docGia.email,
        dienThoai: receipt.docGia.dienThoai
      } : null,
      books: (receipt.chiTietMuon || []).map((item) => ({
        maSach: item.sach && item.sach.maSach,
        tenSach: item.sach && item.sach.dauSach && item.sach.dauSach.tenSach,
        viTriKe: item.sach && item.sach.viTriKe,
        daTraChua: item.daTraChua,
        ngayTraThucTe: item.ngayTraThucTe,
        tinhTrangSauMuon: item.tinhTrangSauMuon
      })),
      soCuon: (receipt.chiTietMuon || []).length,
      phiMuon: receipt.phiMuon || 0,
      tienCoc: receipt.tienCoc || 0,
      soTienGiam: receipt.soTienGiam || 0,
      tongTienThanhToan: receipt.tongTienThanhToan || 0,
      ngayMuon: receipt.ngayMuon,
      ngayHenTra: receipt.ngayHenTra,
      ngayTraThucTe: receipt.ngayTraThucTe,
      trangThai: receipt.trangThai,
      createdAt: receipt.createdAt
    }));

    const penaltyPayments = penaltyPaymentsRaw.map((penalty) => ({
      id: penalty._id,
      maPhieuPhat: penalty.maPhieuPhat,
      phieuMuon: penalty.phieuMuon ? {
        id: penalty.phieuMuon._id,
        maPhieu: penalty.phieuMuon.maPhieu
      } : null,
      docGia: penalty.phieuMuon && penalty.phieuMuon.docGia ? {
        id: penalty.phieuMuon.docGia._id,
        maDocGia: penalty.phieuMuon.docGia.maDocGia,
        hoTen: `${penalty.phieuMuon.docGia.hoLot || ''} ${penalty.phieuMuon.docGia.ten || ''}`.trim(),
        email: penalty.phieuMuon.docGia.email,
        dienThoai: penalty.phieuMuon.docGia.dienThoai
      } : null,
      nhanVien: penalty.nhanVien ? {
        id: penalty.nhanVien._id,
        maSoNV: penalty.nhanVien.maSoNV,
        hoTenNV: penalty.nhanVien.hoTenNV
      } : null,
      lyDoPhat: penalty.lyDoPhat,
      soTienPhat: penalty.soTienPhat || 0,
      daThanhToan: penalty.daThanhToan,
      ngayLap: penalty.ngayLap,
      updatedAt: penalty.updatedAt,
      createdAt: penalty.createdAt
    }));

    return resultResponse.ok(res, {
      tongPhiMuon,
      soPhieuDaTra,
      phiMuonDangXuLy,
      soPhieuDangXuLyPhi,
      tongTienPhat,
      tienPhatDaThu,
      tienPhatChuaThu,
      doanhThuHoiVien,
      soGoiDaBan,
      tongTienCoc,
      soPhieuDangMuon,
      tongDoanhThu,
      summary: {
        tongDoanhThu,
        tongPhiMuon,
        tienPhatDaThu,
        tienPhatChuaThu,
        doanhThuHoiVien,
        tongTienCoc
      },
      breakdown,
      periods: {
        week: {
          current: weekThis,
          previous: weekPrevious
        },
        month: {
          current: monthThis,
          previous: monthPrevious
        }
      },
      comparison: {
        week: compareRevenue(weekThis.tongDoanhThu, weekPrevious.tongDoanhThu),
        month: compareRevenue(monthThis.tongDoanhThu, monthPrevious.tongDoanhThu)
      },
      details: {
        membershipPurchases,
        borrowPayments,
        penaltyPayments
      }
    });
  } catch (error) { next(error); }
};

/**
 * Thống kê tài chính cá nhân của độc giả hiện tại, dùng cùng công thức với dashboard admin.
 */
const getMyFinancialStats = async (req, res, next) => {
  try {
    if (!req.user || req.user.role === 'STAFF') {
      return resultResponse.err(res, 'Chỉ độc giả mới có thể xem thống kê tài chính cá nhân', 403);
    }

    const Subscription = mongoose.model('Subscription');
    const receipts = await BorrowReceipt.find({ docGia: req.user._id });
    const receiptIds = receipts.map(r => r._id);
    const paidReceipts = receipts.filter(r => r.trangThai === 'DA_TRA');
    const penalties = await PenaltyTicket.find({ phieuMuon: { $in: receiptIds } });
    const subscriptions = await Subscription.find({
      docGia: req.user._id,
      trangThai: { $in: ['DANG_HIEU_LUC', 'HET_HAN'] }
    });

    const tongPhiMuon = paidReceipts.reduce((sum, r) => sum + (r.tongTienThanhToan || 0), 0);
    const soPhieuDaTra = paidReceipts.length;
    const pendingReceipts = receipts.filter(r => ['SAN_SANG', 'DANG_MUON', 'QUA_HAN'].includes(r.trangThai));
    const phiMuonDangXuLy = pendingReceipts.reduce((sum, r) => sum + (r.tongTienThanhToan || 0), 0);
    const soPhieuDangXuLyPhi = pendingReceipts.length;
    const tongTienPhat = penalties.reduce((sum, p) => sum + (p.soTienPhat || 0), 0);
    const tienPhatDaTra = penalties.filter(p => p.daThanhToan).reduce((sum, p) => sum + (p.soTienPhat || 0), 0);
    const tienPhatChuaTra = tongTienPhat - tienPhatDaTra;
    const doanhThuHoiVien = subscriptions.reduce((sum, s) => sum + getSubscriptionPaidAmount(s), 0);
    
    // Chỉ đếm các gói hội viên có trả phí thực tế (> 0)
    const paidSubscriptions = subscriptions.filter(s => getSubscriptionPaidAmount(s) > 0 || (s.giaGoc && s.giaGoc > 0));
    const soGoiDaMua = paidSubscriptions.length;

    const activeReceipts = receipts.filter(r => ['DANG_MUON', 'QUA_HAN'].includes(r.trangThai));
    const tongTienCoc = activeReceipts.reduce((sum, r) => sum + (r.tienCoc || 0), 0);
    const soPhieuDangMuon = activeReceipts.length;
    const tongDaChi = tongPhiMuon + tienPhatDaTra + doanhThuHoiVien;

    return resultResponse.ok(res, {
      tongPhiMuon,
      soPhieuDaTra,
      phiMuonDangXuLy,
      soPhieuDangXuLyPhi,
      tongTienPhat,
      tienPhatDaTra,
      tienPhatChuaTra,
      doanhThuHoiVien,
      soGoiDaMua,
      tongTienCoc,
      soPhieuDangMuon,
      tongDaChi,
      breakdown: {
        phiMuon: { amount: tongPhiMuon, count: soPhieuDaTra },
        phiMuonDangXuLy: { amount: phiMuonDangXuLy, count: soPhieuDangXuLyPhi },
        tienPhatDaTra: { amount: tienPhatDaTra, count: penalties.filter(p => p.daThanhToan).length },
        tienPhatChuaTra: { amount: tienPhatChuaTra, count: penalties.filter(p => !p.daThanhToan).length },
        hoiVien: { amount: doanhThuHoiVien, count: soGoiDaMua },
        tienCocDangGiu: { amount: tongTienCoc, count: soPhieuDangMuon }
      }
    });
  } catch (error) { next(error); }
};

module.exports = {
  createReceipt,
  getMyReceipts,
  getReceipts,
  getReceiptById,
  approveReceipt,
  pickupReceipt,
  renewReceipt,
  returnReceipt,
  cancelReceipt,
  getPenalties,
  createPenalty,
  getMyPenalties,
  payPenalty,
  getFinancialStats,
  getMyFinancialStats
};
