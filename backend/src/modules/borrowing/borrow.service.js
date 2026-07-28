/**
 * Chức năng: Service nghiệp vụ mượn/trả sách chạy trong MongoDB transaction
 * Lý do tạo: Đảm bảo các cập nhật BorrowReceipt, BookCopy, BookTitle, PenaltyTicket cùng thành công hoặc cùng rollback
 */

const mongoose = require('mongoose');
const BorrowReceipt = require('./borrowReceipt.model');
const BookTitle = require('../books/bookTitle.model');

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
    receipt.trangThai = 'DA_TRA';
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

  const Subscription = mongoose.model('Subscription');
  const activeSub = await Subscription.findOne({
    docGia: receipt.docGia,
    trangThai: 'DANG_HIEU_LUC',
    ngayBatDau: { $lte: new Date() },
    ngayKetThuc: { $gte: new Date() }
  }).populate('goiDocGia').session(session);

  if (!activeSub || !activeSub.goiDocGia) throw new Error('Độc giả không có gói hội viên còn hiệu lực để gia hạn');

  const borrowDays = Math.ceil((dueDate.getTime() - new Date(receipt.ngayMuon).getTime()) / (1000 * 60 * 60 * 24));
  if (borrowDays > activeSub.goiDocGia.soNgayMuonToiDa) {
    throw new Error(`Ngày gia hạn vượt quá số ngày mượn tối đa của gói thẻ (${activeSub.goiDocGia.soNgayMuonToiDa} ngày)`);
  }

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

module.exports = {
  createBorrowReceipt,
  returnBorrowReceipt,
  cancelBorrowReceipt,
  approveBorrowReceipt,
  renewBorrowReceipt,
  markOverdueReceipts,
  discontinueBookTitle,
  softDeleteBookTitle
};
