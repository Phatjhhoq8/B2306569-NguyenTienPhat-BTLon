/**
 * Chức năng: Khởi tạo ứng dụng Express và tích hợp các module router, middlewares
 * Lý do tạo: Trung tâm quản lý luồng request, cấu hình CORS động credentials, static files và error handler
 * Link trích dẫn: https://expressjs.com/
 */

const path = require('path');
const express = require('express');
const cors = require('cors');
const config = require('./config');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

// Cấu hình CORS đa nguồn dựa trên danh sách origins cấu hình trong .env
const allowedOrigins = [
  config.cors.publicOrigin,
  config.cors.adminOrigin
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Cho phép các requests không có origin (như Postman, cURL, Mobile hoặc unit test)
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.some(o => origin.startsWith(o))) {
      return callback(null, true);
    }
    return callback(new Error('Blocked by CORS policy: Origin not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files phục vụ ảnh bìa sách tải về từ crawler
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Mount API Routes
const userRoutes = require('./modules/users/user.routes');
const bookRoutes = require('./modules/books/book.routes');
const borrowRoutes = require('./modules/borrowing/borrow.routes');
const membershipRoutes = require('./modules/memberships/membership.routes');
const discountRoutes = require('./modules/discounts/discount.routes');
const settingRoutes = require('./modules/settings/systemSetting.routes');

app.use('/api', userRoutes);
app.use('/api', bookRoutes);
app.use('/api', borrowRoutes);
app.use('/api', membershipRoutes);
app.use('/api', discountRoutes);
app.use('/api', settingRoutes);

// Route chào mừng cơ bản
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Book Borrowing Online System API Core'
  });
});

// Middleware bắt lỗi tập trung (bắt buộc đặt ở cuối cùng)
app.use(errorMiddleware);

module.exports = app;
