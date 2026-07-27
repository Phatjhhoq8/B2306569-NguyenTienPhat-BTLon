/**
 * Chức năng: Định nghĩa API Routes cho Module Cài Đặt Hệ Thống (System Settings)
 * Lý do tạo: Định tuyến các endpoints xem và cập nhật cấu hình giao diện
 */

const express = require('express');
const router = express.Router();
const systemSettingController = require('./systemSetting.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// Public route: lấy cấu hình trang chủ / giới thiệu
router.get('/settings/:key', systemSettingController.getSetting);

// Admin route: cập nhật cấu hình trang chủ / giới thiệu
router.put(
  '/settings/:key', 
  authMiddleware.authenticate, 
  authMiddleware.authorize('STAFF'), 
  systemSettingController.updateSetting
);

// Admin route: upload hình ảnh (Base64)
router.post(
  '/settings/upload-image',
  authMiddleware.authenticate,
  authMiddleware.authorize('STAFF'),
  systemSettingController.uploadImage
);

module.exports = router;
