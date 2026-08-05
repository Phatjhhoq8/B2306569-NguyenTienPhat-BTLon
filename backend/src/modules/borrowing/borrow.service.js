/**
 * Chức năng: Service nghiệp vụ mượn/trả sách chạy trong MongoDB transaction
 * Lý do tạo: Đảm bảo các cập nhật BorrowReceipt, BookCopy, BookTitle, PenaltyTicket cùng thành công hoặc cùng rollback
 */

const mongoose = require('mongoose');
const BorrowReceipt = require('./borrowReceipt.model');
const BookTitle = require('../books/bookTitle.model');
const { getEffectiveMembershipPlan } = require('../memberships/membershipPrivileges');

const isTransactionUnsupportedError = (error) => {
  const message = String(error && error.message || '');
  return message.includes('Transaction numbers are only allowed') || message.includes('replica set member or mongos');
};

const withTransaction = async (work) => {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return result;
  } catch (error) {
    if (!isTransactionUnsupportedError(error)) throw error;
    return work(null);
  } finally {
    await session.endSession();
  }
};

const createBorrowReceipt = async (receiptData) => withTransaction(async (session) => {
  const receipt = new BorrowReceipt(receiptData);
  await receipt.save({ session });
  return receipt;
});

const returnBorrowReceipt = async (receiptId, { chiTietMuon, ngayTraThucTe } = {}) => withTransaction(async (session) => {
  const receipt = await BorrowReceipt.findById(receiptId).session(session);
  if (!receipt) throw new Error('Không tìm thấy phiếu mượn');

  if (chiTietMuon) {
    // Duyệt qua và cập nhật từng item để giữ nguyên các thông tin cũ (như tinhTrangLucMuon)
    for (const updateItem of chiTietMuon) {
      const dbItem = receipt.chiTietMuon.find(item => String(item.sach) === String(updateItem.sach));
      if (dbItem) {
        dbItem.daTraChua = updateItem.daTraChua;
        if (updateItem.tinhTrangSauMuon !== undefined) {
          dbItem.tinhTrangSauMuon = updateItem.tinhTrangSauMuon;
        }
        if (updateItem.daTraChua && !dbItem.ngayTraThucTe) {
          dbItem.ngayTraThucTe = ngayTraThucTe || new Date();
        }
      }
    }
    receipt.markModified('chiTietMuon');
  } else {
    receipt.trangThai = 'CHO_THANH_TOAN';
    receipt.ngayTraThucTe = ngayTraThucTe || new Date();
  }

  await receipt.save({ session });
  return receipt;
});

const cancelBorrowReceipt = async (receiptId) => withTransaction(async (session) => {
  const receipt = await BorrowReceipt.findById(receiptId).session(session);
  if (!receipt) throw new Error('Không tìm thấy phiếu mượn');

  receipt.trangThai = 'HUY';
  await receipt.save({ session });
  return receipt;
});

const approveBorrowReceipt = async (receiptId, staffId) => withTransaction(async (session) => {
  const receipt = await BorrowReceipt.findById(receiptId).session(session);
  if (!receipt) throw new Error('Không tìm thấy phiếu mượn');
  if (receipt.trangThai !== 'CHO_DUYET') throw new Error('Chỉ có thể duyệt phiếu đang chờ duyệt');

  receipt.trangThai = 'SAN_SANG';
  receipt.nhanVien = staffId || receipt.nhanVien;
  await receipt.save({ session });
  return receipt;
});

const pickupBorrowReceipt = async (receiptId, staffId) => withTransaction(async (session) => {
  const receipt = await BorrowReceipt.findById(receiptId).session(session);
  if (!receipt) throw new Error('Không tìm thấy phiếu mượn');
  if (receipt.trangThai !== 'SAN_SANG') throw new Error('Chỉ có thể giao sách cho phiếu đang ở trạng thái "Sẵn sàng"');

  receipt.trangThai = 'DANG_MUON';
  receipt.nhanVien = staffId || receipt.nhanVien;
  await receipt.save({ session });
  return receipt;
});

const renewBorrowReceipt = async (receiptId, newDueDate) => withTransaction(async (session) => {
  const receipt = await BorrowReceipt.findById(receiptId).session(session);
  if (!receipt) throw new Error('Không tìm thấy phiếu mượn');
  if (!['DANG_MUON', 'QUA_HAN'].includes(receipt.trangThai)) {
    throw new Error('Chỉ có thể gia hạn phiếu đang mượn hoặc quá hạn');
  }

  const dueDate = new Date(newDueDate);
  if (Number.isNaN(dueDate.getTime()) || dueDate <= receipt.ngayHenTra) {
    throw new Error('Ngày gia hạn mới phải hợp lệ và lớn hơn ngày hẹn trả hiện tại');
  }

  const membershipPlan = await getEffectiveMembershipPlan(receipt.docGia, { session });
  if (!membershipPlan) throw new Error('Độc giả không có gói hội viên còn hiệu lực để gia hạn');
  
  if (!membershipPlan.choPhepGiaHanOnline) {
    throw new Error('Gói hội viên của bạn không hỗ trợ gia hạn trực tuyến');
  }

  const borrowDays = Math.ceil((dueDate.getTime() - new Date(receipt.ngayMuon).getTime()) / (1000 * 60 * 60 * 24));
  if (borrowDays > membershipPlan.soNgayMuonToiDa) {
    throw new Error(`Ngày gia hạn vượt quá số ngày mượn tối đa của gói thẻ (${membershipPlan.soNgayMuonToiDa} ngày)`);
  }

  // Tính phí dịch vụ gia hạn phát sinh thêm (1% giá mượn sách giấy cho mỗi ngày gia hạn thêm)
  const oldDueDate = new Date(receipt.ngayHenTra);
  const ngayMuon = new Date(receipt.ngayMuon);
  const newBorrowDays = Math.ceil((dueDate.getTime() - ngayMuon.getTime()) / (1000 * 60 * 60 * 24));
  const oldBorrowDays = Math.ceil((oldDueDate.getTime() - ngayMuon.getTime()) / (1000 * 60 * 60 * 24));
  const extraDays = newBorrowDays - oldBorrowDays > 0 ? newBorrowDays - oldBorrowDays : 0;
  
  const basePhiMuonPerBook = membershipPlan.phiMuonSachGiay !== undefined ? membershipPlan.phiMuonSachGiay : 0;
  
  const BookCopy = mongoose.model('BookCopy');
  let currentRenewServiceFee = 0;
  for (const item of receipt.chiTietMuon) {
    const copyCheck = await BookCopy.findById(item.sach).populate('dauSach').session(session);
    if (copyCheck && copyCheck.dauSach) {
      const title = copyCheck.dauSach;
      const isGiaoTrinh = (title.tenSach || '').toLowerCase().includes('giáo trình') ||
                           (title.tenSach || '').toLowerCase().includes('bài tập') ||
                           (title.tenSach || '').toLowerCase().includes('sách giáo khoa') ||
                           (title.theLoai || '').toString().toLowerCase().includes('giáo dục') ||
                           (title.theLoai || '').toString().toLowerCase().includes('ngoại ngữ') ||
                           (title.theLoai || '').toString().toLowerCase().includes('khoa học');
      if (!isGiaoTrinh) {
        const renewFeeRate = 0.20; // 20% giá mượn sách giấy cho mỗi ngày gia hạn thêm
        currentRenewServiceFee += basePhiMuonPerBook * renewFeeRate * extraDays;
      }
    }
  }

  receipt.phiGiaHan = (receipt.phiGiaHan || 0) + currentRenewServiceFee;
  receipt.ngayHenTra = dueDate;
  if (receipt.trangThai === 'QUA_HAN') receipt.trangThai = 'DANG_MUON';
  await receipt.save({ session });
  return receipt;
});

const markOverdueReceipts = async (referenceDate = new Date()) => withTransaction(async (session) => {
  return BorrowReceipt.markOverdueReceipts(referenceDate, session);
});

const discontinueBookTitle = async (bookTitleId) => withTransaction(async (session) => {
  const bookTitle = await BookTitle.findById(bookTitleId).session(session);
  if (!bookTitle) throw new Error('Không tìm thấy đầu sách');

  bookTitle.trangThai = 'DISCONTINUED';
  await bookTitle.save({ session });
  return bookTitle;
});

const softDeleteBookTitle = async (bookTitleId) => withTransaction(async (session) => {
  const bookTitle = await BookTitle.findById(bookTitleId).session(session);
  if (!bookTitle) throw new Error('Không tìm thấy đầu sách');

  bookTitle.isDeleted = true;
  bookTitle.deletedAt = new Date();
  await bookTitle.save({ session });
  return bookTitle;
});

const payBorrowReceipt = async (receiptId, { maGiamGia, phuongThucThanhToan } = {}) => withTransaction(async (session) => {
  const receipt = await BorrowReceipt.findById(receiptId).session(session);
  if (!receipt) throw new Error('Không tìm thấy phiếu mượn');
  if (receipt.trangThai !== 'CHO_THANH_TOAN') {
    throw new Error('Chỉ có thể thanh toán phiếu mượn ở trạng thái chờ thanh toán');
  }

  let finalAmount = receipt.phiMuon;
  let discountAmount = 0;
  let codeApplied = '';

  if (maGiamGia) {
    const discountService = require('../discounts/discount.service');
    const discountResult = await discountService.applyDiscountCode(maGiamGia, receipt.phiMuon, {
      session,
      consume: true,
      apDungCho: 'MUON_SACH'
    });
    discountAmount = discountResult.discountAmount;
    finalAmount = discountResult.finalAmount;
    codeApplied = discountResult.discountCode.maCode;
  }

  receipt.soTienGiam = discountAmount;
  receipt.maGiamGia = codeApplied || receipt.maGiamGia;
  receipt.phuongThucThanhToan = phuongThucThanhToan || receipt.phuongThucThanhToan;
  
  receipt.tongTienThanhToan = finalAmount < 0 ? 0 : finalAmount;
  receipt.trangThai = 'DA_TRA';

  await receipt.save({ session });
  return receipt;
});

module.exports = {
  createBorrowReceipt,
  returnBorrowReceipt,
  cancelBorrowReceipt,
  approveBorrowReceipt,
  pickupBorrowReceipt,
  renewBorrowReceipt,
  payBorrowReceipt,
  markOverdueReceipts,
  discontinueBookTitle,
  softDeleteBookTitle
};
