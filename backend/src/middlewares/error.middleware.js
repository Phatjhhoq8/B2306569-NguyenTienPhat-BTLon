/**
 * Chức năng: Middleware xử lý lỗi tập trung (Global Error Handler)
 * Lý do tạo: Bắt toàn bộ lỗi phát sinh trong luồng request và format chuẩn JSON Result Pattern
 * Link tham khảo: https://expressjs.com/en/guide/error-handling.html
 */

const resultResponse = require('../utils/resultResponse');

/**
 * Global Error Handler Middleware
 */
const errorMiddleware = (err, req, res, next) => {
  const errorPayload = {
    message: err.message || 'Lỗi hệ thống không xác định'
  };

  let statusCode = err.status || err.statusCode || 500;

  // 1. Xử lý lỗi validation của Mongoose Schema
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.keys(err.errors).map(key => err.errors[key].message);
    errorPayload.message = messages.join('. ') || 'Dữ liệu không hợp lệ';
    errorPayload.details = Object.keys(err.errors).reduce((acc, key) => {
      acc[key] = err.errors[key].message;
      return acc;
    }, {});
  }

  // 2. Xử lý lỗi Cast ID của Mongoose (ví dụ ObjectId sai định dạng)
  if (err.name === 'CastError') {
    statusCode = 400;
    errorPayload.message = `Trường ${err.path} nhận giá trị không hợp lệ: ${err.value}`;
  }

  // 3. Xử lý lỗi trùng lặp khóa chính của MongoDB (Duplicate Key Error)
  if (err.code === 11000) {
    statusCode = 409; // Conflict
    const field = Object.keys(err.keyValue || {})[0];
    errorPayload.message = `Giá trị của trường '${field}' đã tồn tại trong hệ thống, không được trùng lặp.`;
  }

  // 4. Xử lý lỗi JWT hết hạn hoặc không hợp lệ
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorPayload.message = 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại';
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorPayload.message = 'Mã xác thực không hợp lệ';
  }

  // Log lỗi hệ thống (500) để phục vụ debug
  if (statusCode === 500) {
    console.error('SERVER_ERROR_LOG:', err);
  }

  return resultResponse.err(res, errorPayload.message, statusCode);
};

module.exports = errorMiddleware;
