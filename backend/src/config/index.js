/**
 * Chức năng: Quản lý cấu hình tập trung và nạp các biến môi trường từ tệp .env
 * Lý do tạo: Tránh lặp lại việc gọi dotenv.config() ở nhiều tệp tin và gom cụm cấu hình dùng chung
 * Link trích dẫn: https://github.com/motdotla/dotenv
 */

const path = require('path');
const dotenv = require('dotenv');

// Nạp biến môi trường từ file .env ở thư mục backend
dotenv.config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  
  db: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/book_borrowing'
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_key',
    expire: process.env.JWT_EXPIRE || '7d'
  },
  
  app: {
    defaultShelfLocation: process.env.DEFAULT_SHELF_LOCATION || 'KE-A1',
    defaultBookCopiesCount: parseInt(process.env.DEFAULT_BOOK_COPIES_COUNT, 10) || 3
  }
};
