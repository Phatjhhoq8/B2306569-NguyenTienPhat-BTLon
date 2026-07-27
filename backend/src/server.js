/**
 * Chức năng: Điểm khởi chạy chính (Main Entry Point) của HTTP Server
 * Lý do tạo: Kết nối cơ sở dữ liệu MongoDB và khởi động Express App lắng nghe cổng PORT
 * Link trích dẫn: https://nodejs.org/api/http.html
 */

const app = require('./app');
const config = require('./config');
const { connectDatabase } = require('./config/database');

const startServer = async () => {
  try {
    // 1. Kết nối cơ sở dữ liệu MongoDB
    await connectDatabase();

    // 2. Khởi chạy HTTP Server lắng nghe cổng PORT cấu hình
    app.listen(config.port, () => {
      console.log(`===================================================`);
      console.log(`🚀 Server đang chạy trên cổng: ${config.port}`);
      console.log(`🌐 Môi trường hoạt động: ${config.env}`);
      console.log(`👉 CORS Public Web Origin: ${config.cors.publicOrigin}`);
      console.log(`👉 CORS Admin Panel Origin: ${config.cors.adminOrigin}`);
      console.log(`===================================================`);
    });
  } catch (error) {
    console.error('❌ Lỗi khởi chạy server:', error);
    process.exit(1);
  }
};

startServer();
