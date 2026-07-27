/**
 * Chức năng: Định dạng phản hồi API theo Result Pattern
 * Lý do tạo: Tạo tính nhất quán cho các phản hồi thành công hoặc lỗi trong toàn bộ hệ thống
 * Link tham khảo: https://expressjs.com/en/api.html#res.json
 */

/**
 * Trả về phản hồi thành công
 * @param {object} res - Đối tượng response của Express
 * @param {any} data - Dữ liệu trả về
 * @param {number} status - Mã trạng thái HTTP (mặc định 200)
 */
const ok = (res, data, status = 200) => {
  return res.status(status).json({
    success: true,
    data
  });
};

/**
 * Trả về phản hồi thất bại
 * @param {object} res - Đối tượng response của Express
 * @param {string} message - Thông điệp lỗi
 * @param {number} status - Mã trạng thái HTTP (mặc định 400)
 */
const err = (res, message, status = 400) => {
  return res.status(status).json({
    success: false,
    error: {
      message
    }
  });
};

module.exports = {
  ok,
  err
};
