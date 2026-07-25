/**
 * Chức năng: Service nghiệp vụ mượn/trả sách chạy trong MongoDB transaction
 * Lý do tạo: Đảm bảo các cập nhật BorrowReceipt, BookCopy, BookTitle, PenaltyTicket cùng thành công hoặc cùng rollback
 */

const mongoose = require('mongoose');
const { BorrowReceipt, BookTitle } = require('../models');

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
    receipt.chiTietMuon = chiTietMuon;
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
  markOverdueReceipts,
  discontinueBookTitle,
  softDeleteBookTitle
};
