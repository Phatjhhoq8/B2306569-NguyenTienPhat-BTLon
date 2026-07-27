/**
 * Chức năng: Facade proxy cho Borrow Service
 * Lý do tạo: Tái cấu trúc modular nhưng giữ nguyên proxy để tương thích ngược với các file tests/scripts cũ
 */

const borrowService = require('../modules/borrowing/borrow.service');

module.exports = borrowService;
