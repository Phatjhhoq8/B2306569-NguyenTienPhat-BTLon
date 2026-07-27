/**
 * Chức năng: Định nghĩa API Routes cho Module Users và Auth
 * Lý do tạo: Ánh xạ các URI tài khoản và xác thực đến các controller tương ứng, bảo vệ route bằng auth middleware
 */

const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const validateMiddleware = require('../../middlewares/validate.middleware');

// Routes Đăng ký / Đăng nhập
router.post(
  '/auth/reader/register',
  validateMiddleware.requiredFields(['hoLot', 'ten', 'email', 'matKhau', 'ngaySinh', 'diachi', 'dienThoai']),
  userController.registerReader
);

router.post(
  '/auth/reader/login',
  validateMiddleware.requiredFields(['email', 'matKhau']),
  userController.loginReader
);

router.post(
  '/auth/staff/login',
  validateMiddleware.requiredFields(['maSoNV', 'matKhau']),
  userController.loginStaff
);

router.post(
  '/auth/logout',
  authMiddleware.authenticate,
  userController.logout
);

router.get(
  '/auth/me',
  authMiddleware.authenticate,
  userController.getMe
);

// Routes cá nhân độc giả tự cập nhật
router.get(
  '/users/me',
  authMiddleware.authenticate,
  userController.getMe
);

router.put(
  '/users/me',
  authMiddleware.authenticate,
  userController.updateMeProfile
);

router.put(
  '/users/me/password',
  authMiddleware.authenticate,
  userController.updateMePassword
);

// ==================== ADMIN: Quản lý Độc giả ====================
router.get('/admin/readers/search-suggestions', authMiddleware.authenticate, authMiddleware.authorize('STAFF'), userController.getReaderSuggestions);
router.get('/admin/readers', authMiddleware.authenticate, authMiddleware.authorize('STAFF'), userController.getReaders);
router.get('/admin/readers/:id', authMiddleware.authenticate, authMiddleware.authorize('STAFF'), userController.getReaderById);
router.post('/admin/readers/:id/toggle-status', authMiddleware.authenticate, authMiddleware.authorize('STAFF'), userController.toggleReaderStatus);
router.delete('/admin/readers/:id', authMiddleware.authenticate, authMiddleware.authorize('STAFF'), userController.softDeleteReader);

// ==================== ADMIN: Quản lý Nhân viên ====================
router.get('/admin/staffs/search-suggestions', authMiddleware.authenticate, authMiddleware.authorizeRootAdmin, userController.getStaffSuggestions);
router.get('/admin/staffs', authMiddleware.authenticate, authMiddleware.authorizeRootAdmin, userController.getStaffs);
router.post('/admin/staffs', authMiddleware.authenticate, authMiddleware.authorizeRootAdmin, userController.createStaff);
router.put('/admin/staffs/:id', authMiddleware.authenticate, authMiddleware.authorizeRootAdmin, userController.updateStaff);
router.delete('/admin/staffs/:id', authMiddleware.authenticate, authMiddleware.authorizeRootAdmin, userController.softDeleteStaff);

module.exports = router;
