/**
 * Chức năng: Script cập nhật bổ sung trường mô tả (moTa) cho các sách hiện có trong DB
 * Lý do tạo: Sửa lỗi thiếu trường moTa khi seed mà không làm mất dữ liệu phiếu mượn/độc giả cũ
 */

const mongoose = require('mongoose');
const path = require('path');
const config = require('../config');
const { connectDatabase } = require('../config/database');
const { BookTitle } = require('../models');
const books = require('./output/scraped_books.json');

const deepNormalizeNFC = (val) => {
  if (typeof val === 'string') return val.normalize('NFC');
  if (Array.isArray(val)) return val.map(deepNormalizeNFC);
  if (typeof val === 'object' && val !== null) {
    const res = {};
    for (const key in val) {
      res[key] = deepNormalizeNFC(val[key]);
    }
    return res;
  }
  return val;
};

const run = async () => {
  try {
    console.log('Đang kết nối cơ sở dữ liệu...');
    await connectDatabase();
    console.log('Kết nối database thành công. Bắt đầu cập nhật mô tả...');

    let updatedCount = 0;
    let notFoundCount = 0;

    for (const book of books) {
      const normalized = deepNormalizeNFC(book);
      if (!normalized.moTa) continue;

      // Tìm kiếm theo ISBN hoặc tên sách
      const query = {
        $or: []
      };
      if (normalized.isbn) {
        query.$or.push({ isbn: normalized.isbn });
      }
      query.$or.push({ tenSach: normalized.tenSach });

      const dbBook = await BookTitle.findOne(query);

      if (dbBook) {
        dbBook.moTa = normalized.moTa;
        await dbBook.save();
        updatedCount++;
      } else {
        notFoundCount++;
      }
    }

    console.log(`=== KẾT QUẢ CẬP NHẬT ===`);
    console.log(`- Đã cập nhật thành công mô tả cho: ${updatedCount} đầu sách.`);
    console.log(`- Không tìm thấy trong DB: ${notFoundCount} sách.`);
    
    mongoose.connection.close();
    console.log('Đã đóng kết nối cơ sở dữ liệu.');
    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi chạy script cập nhật mô tả:', error);
    process.exit(1);
  }
};

run();
