/**
 * Chức năng: Điểm khởi chạy chính (Main Entry Point) của HTTP Server
 * Lý do tạo: Kết nối cơ sở dữ liệu MongoDB và khởi động Express App lắng nghe cổng PORT
 * Link trích dẫn: https://nodejs.org/api/http.html
 */

const app = require('./app');
const config = require('./config');
const { connectDatabase } = require('./config/database');

const syncAllBookBorrowCounts = async () => {
  try {
    const mongoose = require('mongoose');
    const BookTitle = mongoose.model('BookTitle');
    const BookCopy = mongoose.model('BookCopy');
    const BorrowReceipt = mongoose.model('BorrowReceipt');

    const books = await BookTitle.find({ isDeleted: false });
    let syncCount = 0;
    for (const book of books) {
      const copies = await BookCopy.find({ dauSach: book._id, isDeleted: false });
      const copiesIds = copies.map(c => c._id);
      const actualBorrowCount = await BorrowReceipt.countDocuments({
        'chiTietMuon.sach': { $in: copiesIds },
        trangThai: { $nin: ['CHO_DUYET', 'HUY'] }
      });
      if (book.soLuotMuon !== actualBorrowCount) {
        book.soLuotMuon = actualBorrowCount;
        await book.save();
        syncCount++;
      }
    }
    if (syncCount > 0) {
      console.log(`[Sync] Đã đồng bộ lại số lượt mượn thực tế cho ${syncCount} đầu sách.`);
    }
  } catch (err) {
    console.error('[Sync Error] Lỗi đồng bộ lượt mượn:', err.message);
  }
};

const startServer = async () => {
  try {
    // 1. Kết nối cơ sở dữ liệu MongoDB
    await connectDatabase();

    // 2. Khởi chạy HTTP Server lắng nghe cổng PORT cấu hình
    app.listen(config.port, () => {
      console.log(`===================================================`);
      console.log(`🚀 Server đang chạy trên cổng: ${config.port}`);
      console.log(`🌐 Môi trường hoạt động: ${config.env}`);
      console.log(`👉 CORS Public Web Origin: ${config.cors.publicOrigin}`);
      console.log(`👉 CORS Admin Panel Origin: ${config.cors.adminOrigin}`);
      console.log(`===================================================`);
      
      syncAllBookBorrowCounts();
    });
  } catch (error) {
    console.error('❌ Lỗi khởi chạy server:', error);
    process.exit(1);
  }
};

startServer();
