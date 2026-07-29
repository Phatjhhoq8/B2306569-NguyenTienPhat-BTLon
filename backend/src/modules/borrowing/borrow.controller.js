/**
 * Chức năng: Controller điều phối request cho Mượn/Trả Sách và Phiếu Phạt
 * Lý do tạo: Tiếp nhận thông tin từ router, xác thực dữ liệu, gọi service nghiệp vụ và phản hồi JSON
 */

const mongoose = require('mongoose');
const BorrowReceipt = require('./borrowReceipt.model');
const PenaltyTicket = require('./penaltyTicket.model');
const borrowService = require('./borrow.service');
const resultResponse = require('../../utils/resultResponse');

/**
 * Độc giả đăng ký mượn sách
 */
const createReceipt = async (req, res, next) => {
  try {
    if (!req.user || req.user.role === 'STAFF') {
      return resultResponse.err(res, 'Chỉ độc giả mới được phép đăng ký mượn sách', 403);
    }

    const { chiTietMuon, ngayHenTra, phiMuon, soTienGiam, tongTienThanhToan, choDuyet } = req.body;
    if (!chiTietMuon || chiTietMuon.length === 0 || !ngayHenTra) {
      return resultResponse.err(res, 'Thông tin mượn sách và ngày hẹn trả là bắt buộc', 400);
    }

    const BookCopy = mongoose.model('BookCopy');
    const BookTitle = mongoose.model('BookTitle');

    const formattedChiTietMuon = [];
    for (const item of chiTietMuon) {
      let copy = await BookCopy.findOne({ _id: item.sach, isDeleted: false });
      
      if (!copy) {
        // Tìm bản sao khả dụng đầu tiên của BookTitle
        copy = await BookCopy.findOne({ 
          dauSach: item.sach, 
          tinhTrang: 'CHO_MUON', 
          isDeleted: false 
        });
        
        if (!copy) {
          const title = await BookTitle.findById(item.sach);
          const bookName = title ? `"${title.tenSach}"` : `ID ${item.sach}`;
          return resultResponse.err(res, `Đầu sách ${bookName} hiện đã hết bản sao khả dụng để mượn`, 400);
        }
      } else {
        if (copy.tinhTrang !== 'CHO_MUON') {
          const title = await BookTitle.findById(copy.dauSach);
          const bookName = title ? `"${title.tenSach}"` : `Mã sách ${copy._id}`;
          return resultResponse.err(res, `Cuốn sách ${bookName} hiện đang bận hoặc bảo trì`, 400);
        }
      }

      formattedChiTietMuon.push({
        sach: copy._id,
        tinhTrangLucMuon: item.tinhTrangLucMuon || copy.ghiChu || 'Tốt',
        daTraChua: false
      });
    }

    const receipt = await borrowService.createBorrowReceipt({
      docGia: req.user._id,
      chiTietMuon: formattedChiTietMuon,
      ngayMuon: new Date(),
      ngayHenTra,
      phiMuon: phiMuon || 0,
      soTienGiam: soTienGiam || 0,
      tongTienThanhToan: tongTienThanhToan || 0,
      trangThai: choDuyet ? 'CHO_DUYET' : 'DANG_MUON'
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
    const receipt = await borrowService.cancelBorrowReceipt(id);
    return resultResponse.ok(res, receipt);
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

    // Tính tổng phí mượn sách từ các phiếu đã trả (DA_TRA)
    const paidReceipts = await BorrowReceipt.find({ trangThai: 'DA_TRA' }).select('tongTienThanhToan tienCoc');
    const tongPhiMuon = paidReceipts.reduce((sum, r) => sum + (r.tongTienThanhToan || 0), 0);
    const soPhieuDaTra = paidReceipts.length;

    // Tính tổng tiền phạt
    const allPenalties = await PenaltyTicket.find().select('soTienPhat daThanhToan');
    const tongTienPhat = allPenalties.reduce((sum, p) => sum + (p.soTienPhat || 0), 0);
    const tienPhatDaThu = allPenalties
      .filter(p => p.daThanhToan)
      .reduce((sum, p) => sum + (p.soTienPhat || 0), 0);
    const tienPhatChuaThu = tongTienPhat - tienPhatDaThu;

    // Doanh thu từ gói hội viên (Subscription có trạng thái DANG_HIEU_LUC hoặc HET_HAN — đã mua)
    const allSubs = await Subscription.find({
      trangThai: { $in: ['DANG_HIEU_LUC', 'HET_HAN'] }
    }).select('tongTien');
    const doanhThuHoiVien = allSubs.reduce((sum, s) => sum + (s.tongTien || 0), 0);
    const soGoiDaBan = allSubs.length;

    // Tổng tiền cọc đang giữ (phiếu DANG_MUON hoặc QUA_HAN)
    const activeReceipts = await BorrowReceipt.find({
      trangThai: { $in: ['DANG_MUON', 'QUA_HAN'] }
    }).select('tienCoc');
    const tongTienCoc = activeReceipts.reduce((sum, r) => sum + (r.tienCoc || 0), 0);
    const soPhieuDangMuon = activeReceipts.length;

    const tongDoanhThu = tongPhiMuon + tienPhatDaThu + doanhThuHoiVien;

    return resultResponse.ok(res, {
      tongPhiMuon,
      soPhieuDaTra,
      tongTienPhat,
      tienPhatDaThu,
      tienPhatChuaThu,
      doanhThuHoiVien,
      soGoiDaBan,
      tongTienCoc,
      soPhieuDangMuon,
      tongDoanhThu
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
  getFinancialStats
};
