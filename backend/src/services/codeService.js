/**
 * Chức năng: Service cung cấp mã số tự động tăng, an toàn đồng thời (concurrency-safe)
 * Lý do tạo: Ngăn ngừa trùng lặp khóa chính khi nhiều request cùng ghi nhận mới vào hệ thống
 */

const { Counter } = require('../models');

// Định nghĩa cấu hình tiền tố và độ dài phần số cho các thực thể
const configs = {
  publisher: { prefix: 'NXB', length: 3 },
  author: { prefix: 'TG', length: 4 },
  category: { prefix: 'TL', length: 3 },
  bookTitle: { prefix: 'DS', length: 5 },
  bookCopy: { prefix: 'BS', length: 6 },
  reader: { prefix: 'DG', length: 5 },
  staff: { prefix: 'NV', length: 3 },
  membershipPlan: { prefix: 'GOI', length: 3 },
  subscription: { prefix: 'DK', length: 6 },
  borrowReceipt: { prefix: 'PM', length: 6 },
  penaltyTicket: { prefix: 'PP', length: 6 },
  discountCode: {
    prefix: () => {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `KM${year}${month}`;
    },
    length: 3
  }
};

/**
 * Lấy mã tự tăng tiếp theo cho một thực thể
 * @param {string} entityName - Tên của thực thể (ví dụ: 'publisher', 'author'...)
 * @returns {Promise<string>} Mã tự tăng được format đúng định dạng quy chuẩn
 */
const nextCode = async (entityName) => {
  const config = configs[entityName];
  if (!config) {
    throw new Error(`Không tìm thấy cấu hình mã tự động cho thực thể "${entityName}"`);
  }

  // Thực hiện cập nhật nguyên tử bằng update + inc của MongoDB
  const counter = await Counter.findOneAndUpdate(
    { _id: entityName },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const prefix = typeof config.prefix === 'function' ? config.prefix() : config.prefix;
  const paddedNumber = String(counter.seq).padStart(config.length, '0');
  
  return `${prefix}${paddedNumber}`;
};

module.exports = { nextCode };
