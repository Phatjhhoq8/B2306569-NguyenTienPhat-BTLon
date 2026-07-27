/**
 * Chức năng: Middleware hỗ trợ xác thực định dạng dữ liệu đầu vào thô
 * Lý do tạo: Ngăn chặn request không hợp lệ đi sâu vào database/services sớm nhất có thể
 * Link tham khảo: https://expressjs.com/en/guide/using-middleware.html
 */

const resultResponse = require('../utils/resultResponse');

/**
 * Kiểm tra các trường bắt buộc có trong req.body
 * @param {string[]} fields - Danh sách các key bắt buộc phải có
 * @returns {Function} Express middleware function
 */
const requiredFields = (fields) => {
  return (req, res, next) => {
    const body = req.body || {};
    const missing = fields.filter((field) => {
      const value = body[field];
      // Kiểm tra nếu giá trị là undefined, null hoặc chuỗi rỗng sau khi trim
      return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
    });

    if (missing.length > 0) {
      return resultResponse.err(
        res,
        `Thiếu thông tin bắt buộc: ${missing.join(', ')}`,
        400
      );
    }

    next();
  };
};

module.exports = {
  requiredFields
};
