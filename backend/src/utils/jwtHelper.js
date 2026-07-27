/**
 * Chức năng: Ký và giải mã token JWT
 * Lý do tạo: Cung cấp cơ chế tạo chuỗi JWT để xác thực và phân quyền
 * Link tham khảo: https://github.com/auth0/node-jsonwebtoken
 */

const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Ký mã token JWT với payload được truyền vào
 * @param {object} payload - Dữ liệu cần mã hóa
 * @returns {string} Token JWT dạng string
 */
const signToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expire
  });
};

/**
 * Giải mã token JWT và trả về payload bên trong
 * @param {string} token - Chuỗi token cần giải mã
 * @returns {object} Payload đã được giải mã
 */
const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

module.exports = {
  signToken,
  verifyToken
};
