/**
 * Chức năng: Điểm xuất khẩu tập trung (Entry Point) của toàn bộ Services
 * Lý do tạo: Tái cấu trúc sang Modular Design nhưng vẫn giữ nguyên proxy để tương thích ngược với các file tests/scripts cũ
 */

const codeService = require('./codeService');
const passwordService = require('./passwordService');
const bookService = require('./bookService');
const borrowService = require('./borrowService');
const discountService = require('./discountService');

module.exports = {
  codeService,
  passwordService,
  bookService,
  borrowService,
  discountService
};
