/**
 * Chức năng: Facade proxy cho Book Service
 * Lý do tạo: Tái cấu trúc modular nhưng giữ nguyên proxy để tương thích ngược với các file tests/scripts cũ
 */

const bookService = require('../modules/books/book.service');

module.exports = bookService;
