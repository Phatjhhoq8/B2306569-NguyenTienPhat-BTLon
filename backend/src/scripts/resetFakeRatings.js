/**
 * Chức năng: Script đặt lại rating và soLuotDanhGia của đầu sách về đúng thực tế bình luận trong DB
 * Lý do tạo: Loại bỏ điểm đánh giá giả lập ban đầu để hiển thị 0.0 nếu chưa có ai đánh giá thực sự
 */

const mongoose = require('mongoose');
const { connectDatabase } = require('../config/database');
const { BookTitle } = require('../models');

const run = async () => {
  try {
    console.log('Đang kết nối cơ sở dữ liệu...');
    await connectDatabase();
    console.log('Kết nối database thành công. Bắt đầu cập nhật lại rating...');

    const books = await BookTitle.find({});
    let resetCount = 0;
    let recalculatedCount = 0;

    for (const book of books) {
      if (!book.binhLuan || book.binhLuan.length === 0) {
        // Reset về 0 nếu chưa có bình luận thực tế
        book.rating = 0;
        book.soLuotDanhGia = 0;
        await book.save();
        resetCount++;
      } else {
        // Tính toán lại theo dữ liệu thực tế
        const total = book.binhLuan.length;
        const sum = book.binhLuan.reduce((acc, curr) => acc + curr.soSao, 0);
        book.rating = parseFloat((sum / total).toFixed(1));
        book.soLuotDanhGia = total;
        await book.save();
        recalculatedCount++;
      }
    }

    console.log(`=== KẾT QUẢ ĐẶT LẠI RATING ===`);
    console.log(`- Đã đặt lại về 0 (do chưa có đánh giá): ${resetCount} đầu sách.`);
    console.log(`- Đã tính toán lại thực tế: ${recalculatedCount} đầu sách.`);
    
    mongoose.connection.close();
    console.log('Đã đóng kết nối cơ sở dữ liệu.');
    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi chạy script reset rating:', error);
    process.exit(1);
  }
};

run();
