/**
 * Chức năng: Middleware xác thực và phân quyền người dùng bằng token trong cookie
 * Lý do tạo: Bảo mật các API endpoints, phân biệt độc giả (Reader) và nhân viên (Staff)
 * Link tham khảo: https://expressjs.com/en/guide/using-middleware.html
 */

const mongoose = require('mongoose');
const jwtHelper = require('../utils/jwtHelper');
const resultResponse = require('../utils/resultResponse');

/**
 * Phân tích chuỗi header Cookie thành đối tượng key-value
 * @param {string} cookieHeader - Chuỗi cookie thô từ headers
 * @returns {object} Đối tượng cookies
 */
const parseCookies = (cookieHeader) => {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.split('=').map(c => c.trim());
    if (key) {
      acc[key] = decodeURIComponent(value);
    }
    return acc;
  }, {});
};

/**
 * Middleware xác thực người dùng thông qua Cookie Token
 */
const authenticate = async (req, res, next) => {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies.token;

    if (!token) {
      return resultResponse.err(res, 'Không tìm thấy token xác thực', 401);
    }

    let payload;
    try {
      payload = jwtHelper.verifyToken(token);
    } catch (err) {
      return resultResponse.err(res, 'Token không hợp lệ hoặc đã hết hạn', 401);
    }

    // Nếu cơ sở dữ liệu đã kết nối, thực hiện truy vấn để đảm bảo tài khoản còn hoạt động
    if (mongoose.connection.readyState >= 1) {
      if (payload.role === 'READER') {
        const Reader = mongoose.model('Reader');
        const reader = await Reader.findById(payload.id);
        if (!reader || reader.isDeleted || reader.trangThai !== 'ACTIVE') {
          return resultResponse.err(res, 'Tài khoản độc giả không hợp lệ hoặc đã bị khóa/xóa', 401);
        }
        req.user = reader;
      } else if (payload.role === 'STAFF') {
        const Staff = mongoose.model('Staff');
        const staff = await Staff.findById(payload.id);
        if (!staff || staff.isDeleted) {
          return resultResponse.err(res, 'Tài khoản nhân viên không hợp lệ hoặc đã bị xóa', 401);
        }
        req.user = staff;
      } else {
        return resultResponse.err(res, 'Vai trò tài khoản không hợp lệ', 401);
      }
    } else {
      // Dành cho môi trường test độc lập không có DB kết nối
      req.user = {
        _id: payload.id,
        id: payload.id,
        role: payload.role,
        chucVu: payload.chucVu
      };
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware phân quyền truy cập theo vai trò hoặc chức vụ nhân viên
 * @param {...string} allowedRoles - Danh sách các vai trò hoặc chức vụ được phép truy cập
 * @returns {Function} Express middleware function
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return resultResponse.err(res, 'Người dùng chưa được xác thực', 401);
    }

    // Lấy vai trò (READER/STAFF) và chức vụ nhân viên (THU_THU/QUAN_LY)
    const userRole = req.user.role || (req.user.chucVu ? 'STAFF' : 'READER');
    const userChucVu = req.user.chucVu || null;

    const hasPermission = allowedRoles.some((role) => {
      // Cho phép khớp vai trò READER hoặc STAFF nói chung
      if (role === userRole) return true;
      // Hoặc khớp chức vụ cụ thể của nhân viên (THU_THU, QUAN_LY)
      if (userChucVu && role === userChucVu) return true;
      return false;
    });

    if (!hasPermission) {
      return resultResponse.err(res, 'Bạn không có quyền thực hiện hành động này', 403);
    }

    next();
  };
};

module.exports = {
  parseCookies,
  authenticate,
  authorize
};
