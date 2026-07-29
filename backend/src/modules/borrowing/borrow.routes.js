/**
 * Chức năng: Định nghĩa API Routes cho Module Mượn/Trả Sách và Phiếu Phạt
 * Lý do tạo: Ánh xạ các API mượn, trả, phạt và bảo vệ phân quyền chặt chẽ theo vai trò Độc giả/Nhân viên
 */

const express = require('express');
const router = express.Router();
const borrowController = require('./borrow.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// API Phiếu Mượn (BorrowReceipt)
router.post(
  '/borrowing/receipts',
  authMiddleware.authenticate,
  authMiddleware.authorize('READER'),
  borrowController.createReceipt
);

router.get(
  '/borrowing/my-receipts',
  authMiddleware.authenticate,
  authMiddleware.authorize('READER'),
  borrowController.getMyReceipts
);

router.get(
  '/borrowing/receipts',
  authMiddleware.authenticate,
  authMiddleware.authorize('STAFF'),
  borrowController.getReceipts
);

router.get(
  '/borrowing/receipts/:id',
  authMiddleware.authenticate,
  borrowController.getReceiptById
);


router.post(
  '/borrowing/receipts/:id/return',
  authMiddleware.authenticate,
  authMiddleware.authorize('STAFF'),
  borrowController.returnReceipt
);

router.post(
  '/borrowing/receipts/:id/approve',
  authMiddleware.authenticate,
  authMiddleware.authorize('STAFF'),
  borrowController.approveReceipt
);

router.post(
  '/borrowing/receipts/:id/pickup',
  authMiddleware.authenticate,
  authMiddleware.authorize('STAFF'),
  borrowController.pickupReceipt
);

router.post(
  '/borrowing/receipts/:id/renew',
  authMiddleware.authenticate,
  authMiddleware.authorize('READER'),
  borrowController.renewReceipt
);

router.post(
  '/borrowing/receipts/:id/cancel',
  authMiddleware.authenticate,
  borrowController.cancelReceipt
);

// API Phiếu Phạt (PenaltyTicket)
router.get(
  '/borrowing/penalties',
  authMiddleware.authenticate,
  authMiddleware.authorize('STAFF'),
  borrowController.getPenalties
);

router.post(
  '/borrowing/penalties',
  authMiddleware.authenticate,
  authMiddleware.authorize('STAFF'),
  borrowController.createPenalty
);

router.get(
  '/borrowing/my-penalties',
  authMiddleware.authenticate,
  authMiddleware.authorize('READER'),
  borrowController.getMyPenalties
);

router.get(
  '/borrowing/my-financial-stats',
  authMiddleware.authenticate,
  authMiddleware.authorize('READER'),
  borrowController.getMyFinancialStats
);

router.post(
  '/borrowing/penalties/:id/pay',
  authMiddleware.authenticate,
  authMiddleware.authorize('STAFF', 'READER'),
  borrowController.payPenalty
);

// API Thống kê tài chính (STAFF only)
router.get(
  '/borrowing/financial-stats',
  authMiddleware.authenticate,
  authMiddleware.authorize('STAFF'),
  borrowController.getFinancialStats
);

router.post(
  '/borrowing/receipts/:id/pay',
  authMiddleware.authenticate,
  borrowController.payReceipt
);

module.exports = router;
