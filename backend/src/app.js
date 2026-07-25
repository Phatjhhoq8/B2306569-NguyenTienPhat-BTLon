/**
 * Chức năng: Khởi tạo ứng dụng Express (Mockup phục vụ verification và phát triển API sau này)
 * Lý do tạo: Cho phép các scripts verify và test chạy được mà không bị lỗi thiếu tệp
 * Link trích dẫn: https://expressjs.com/
 */

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route chào mừng cơ bản
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Book Borrowing Online System API Core'
  });
});

module.exports = app;
