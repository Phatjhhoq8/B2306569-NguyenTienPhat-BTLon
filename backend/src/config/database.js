/**
 * Chức năng: Cấu hình và kết nối cơ sở dữ liệu MongoDB bằng Mongoose
 * Lý do tạo: Tách biệt cấu hình kết nối để tái sử dụng trong ứng dụng chính và kịch bản test
 * Link trích dẫn: https://mongoosejs.com/docs/connections.html
 */

const mongoose = require('mongoose');
const config = require('./index');

// Tắt cảnh báo strictQuery của Mongoose
mongoose.set('strictQuery', false);

const connectDatabase = async () => {
  const uri = config.db.uri;
  
  // Tránh kết nối lại nếu đã có kết nối sẵn (hữu ích khi chạy test nhiều lần)
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn.connection;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectDatabase };
