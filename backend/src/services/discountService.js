/**
 * Chức năng: Facade proxy cho Discount Service
 * Lý do tạo: Tái cấu trúc modular nhưng giữ nguyên proxy để tương thích ngược với các file tests/scripts cũ
 */

const discountService = require('../modules/discounts/discount.service');

module.exports = discountService;
