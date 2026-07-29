/**
 * Chức năng: Quản lý cấu hình tập trung và nạp các biến môi trường từ tệp .env
 * Lý do tạo: Tránh lặp lại việc gọi dotenv.config() ở nhiều tệp tin và gom cụm cấu hình dùng chung
 * Link trích dẫn: https://github.com/motdotla/dotenv
 */

const path = require('path');
const dotenv = require('dotenv');

// Nạp biến môi trường từ file .env ở thư mục backend
dotenv.config({ path: path.join(__dirname, '../../.env') });

const isTest = process.env.NODE_ENV === 'test' || process.argv.some(arg => arg.includes('test') || arg.includes('mocha'));
if (isTest) {
  process.env.NODE_ENV = 'test';
}

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  
  db: {
    uri: isTest 
      ? 'mongodb://localhost:27017/book_borrowing_test'
      : (process.env.MONGODB_URI || 'mongodb://localhost:27017/book_borrowing')
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_key',
    expire: process.env.JWT_EXPIRE || '12h'
  },
  
  app: {
    defaultShelfLocation: process.env.DEFAULT_SHELF_LOCATION || 'KE-A1',
    defaultBookCopiesCount: parseInt(process.env.DEFAULT_BOOK_COPIES_COUNT, 10) || 3
  },
  
  cors: {
    publicOrigin: process.env.PUBLIC_ORIGIN || 'http://localhost:5173',
    adminOrigin: process.env.ADMIN_ORIGIN || 'http://localhost:5174'
  },

  cookie: {
    maxAge: parseInt(process.env.COOKIE_MAX_AGE, 10) || 12 * 60 * 60 * 1000,
    domain: process.env.COOKIE_DOMAIN || undefined
  }
};
