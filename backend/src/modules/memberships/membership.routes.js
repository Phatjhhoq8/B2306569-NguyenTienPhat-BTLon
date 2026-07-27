/**
 * Chức năng: Định nghĩa API Routes cho Module Memberships
 * Lý do tạo: Định tuyến cho tra cứu gói hội viên, đăng ký và quản trị gói hội viên
 */

const express = require('express');
const router = express.Router();
const membershipController = require('./membership.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// Public: lấy danh sách gói
router.get('/memberships/plans', membershipController.getPlans);

// Độc giả: đăng ký gói và xem subscription cá nhân
router.post('/memberships/subscribe', authMiddleware.authenticate, authMiddleware.authorize('READER'), membershipController.subscribePlan);
router.get('/memberships/my-subscriptions', authMiddleware.authenticate, authMiddleware.authorize('READER'), membershipController.getMySubscription);

// Admin: CRUD gói hội viên
router.post('/memberships/plans', authMiddleware.authenticate, authMiddleware.authorize('STAFF'), membershipController.createPlan);
router.put('/memberships/plans/:id', authMiddleware.authenticate, authMiddleware.authorize('STAFF'), membershipController.updatePlan);
router.delete('/memberships/plans/:id', authMiddleware.authenticate, authMiddleware.authorize('STAFF'), membershipController.deletePlan);

module.exports = router;
