/**
 * Chức năng: Quản lý thiết lập và xóa Cookie chứa token JWT
 * Lý do tạo: Tự động hóa việc tạo header Set-Cookie bảo mật HTTP-Only và SameSite=Lax
 * Link tham khảo: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie
 */

const config = require('../config');

/**
 * Thiết lập Cookie chứa token xác thực gửi về trình duyệt
 * @param {object} res - Đối tượng response của Express
 * @param {string} token - Chuỗi token JWT
 */
const setCookieToken = (res, token) => {
  const maxAgeSeconds = Math.floor(config.cookie.maxAge / 1000);
  const isProduction = config.env === 'production';
  
  let cookieString = `token=${token}; HttpOnly; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
  
  if (isProduction) {
    cookieString += '; Secure';
  }
  
  if (config.cookie.domain) {
    cookieString += `; Domain=${config.cookie.domain}`;
  }

  res.setHeader('Set-Cookie', cookieString);
};

/**
 * Xóa Cookie token xác thực (bằng cách đặt Max-Age = 0)
 * @param {object} res - Đối tượng response của Express
 */
const clearCookieToken = (res) => {
  const isProduction = config.env === 'production';
  let cookieString = `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`;
  
  if (isProduction) {
    cookieString += '; Secure';
  }
  
  if (config.cookie.domain) {
    cookieString += `; Domain=${config.cookie.domain}`;
  }

  res.setHeader('Set-Cookie', cookieString);
};

module.exports = {
  setCookieToken,
  clearCookieToken
};
