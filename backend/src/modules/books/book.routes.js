/**
 * Chức năng: Định nghĩa API Routes cho Module Sách và Catalog
 * Lý do tạo: Phân chia định tuyến, bảo vệ các API ghi bằng middleware xác thực & phân quyền nhân viên (STAFF)
 */

const express = require('express');
const router = express.Router();
const bookController = require('./book.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// ==================== Public: Catalog ====================
router.get('/books', bookController.getBooks);
router.get('/books/search-suggestions', bookController.getSearchSuggestions);
router.get('/books/:id', bookController.getBookById);
router.get('/categories', bookController.getCategories);
router.get('/authors', bookController.getAuthors);
router.get('/publishers', bookController.getPublishers);

// ==================== Độc giả: Đánh giá & Bình luận ====================
router.post('/books/:id/reviews', authMiddleware.authenticate, authMiddleware.authorize('READER'), bookController.addBookReview);
router.delete('/books/:id/reviews', authMiddleware.authenticate, authMiddleware.authorize('READER'), bookController.deleteBookReview);
router.post('/books/:id/like-toggle', authMiddleware.authenticate, authMiddleware.authorize('READER'), bookController.toggleLikeBook);

// ==================== Admin: Category ====================
router.post('/categories', authMiddleware.authenticate, authMiddleware.authorize('STAFF'), bookController.createCategory);
router.put('/categories/:id', authMiddleware.authenticate, authMiddleware.authorize('STAFF'), bookController.updateCategory);
router.delete('/categories/:id', authMiddleware.authenticate, authMiddleware.authorize('STAFF'), bookController.deleteCategory);

// ==================== Admin: BookTitle ====================
router.post('/books', authMiddleware.authenticate, authMiddleware.authorize('STAFF'), bookController.createBookTitle);
router.put('/books/:id', authMiddleware.authenticate, authMiddleware.authorize('STAFF'), bookController.updateBookTitle);
router.delete('/books/:id', authMiddleware.authenticate, authMiddleware.authorize('STAFF'), bookController.softDeleteBookTitle);

// ==================== Admin: BookCopy ====================
router.get('/books/:bookId/copies', authMiddleware.authenticate, authMiddleware.authorize('STAFF'), bookController.getBookCopies);
router.put('/book-copies/:id', authMiddleware.authenticate, authMiddleware.authorize('STAFF'), bookController.updateBookCopy);
router.delete('/book-copies/:id', authMiddleware.authenticate, authMiddleware.authorize('STAFF'), bookController.softDeleteBookCopy);

// ==================== Admin: Author ====================
router.post('/authors', authMiddleware.authenticate, authMiddleware.authorize('STAFF'), bookController.createAuthor);
router.put('/authors/:id', authMiddleware.authenticate, authMiddleware.authorize('STAFF'), bookController.updateAuthor);

// ==================== Admin: Publisher ====================
router.post('/publishers', authMiddleware.authenticate, authMiddleware.authorize('STAFF'), bookController.createPublisher);
router.put('/publishers/:id', authMiddleware.authenticate, authMiddleware.authorize('STAFF'), bookController.updatePublisher);

module.exports = router;
