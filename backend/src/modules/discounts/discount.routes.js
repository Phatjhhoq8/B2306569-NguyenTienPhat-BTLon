/**
 * Chức năng: Định nghĩa API Routes cho Module Mã Giảm Giá (Discount)
 * Lý do tạo: Ánh xạ các endpoints tạo, xem, sửa, xóa và kiểm tra mã giảm giá với phân quyền tương ứng
 */

const express = require('express');
const router = express.Router();
const discountController = require('./discount.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// Admin: CRUD mã giảm giá
router.post('/discounts', authMiddleware.authenticate, authMiddleware.authorize('STAFF'), discountController.createDiscount);
router.get('/discounts', authMiddleware.authenticate, authMiddleware.authorize('STAFF'), discountController.getDiscounts);
router.put('/discounts/:id', authMiddleware.authenticate, authMiddleware.authorize('STAFF'), discountController.updateDiscount);
router.delete('/discounts/:id', authMiddleware.authenticate, authMiddleware.authorize('STAFF'), discountController.deleteDiscount);

// Độc giả: validate mã giảm giá
router.post('/discounts/validate', authMiddleware.authenticate, authMiddleware.authorize('READER'), discountController.validateDiscount);

module.exports = router;
