/**
 * Chức năng: Service quản lý nghiệp vụ Độc Giả, Nhân Viên và Xác thực
 * Lý do tạo: Tách biệt logic nghiệp vụ khỏi controller, thực hiện băm mật khẩu, so sánh và ký token JWT
 */

const Reader = require('./reader.model');
const Staff = require('./staff.model');
const passwordService = require('../../services/passwordService');
const jwtHelper = require('../../utils/jwtHelper');

/**
 * Đăng ký tài khoản độc giả mới
 * @param {object} readerData - Thông tin độc giả
 * @returns {Promise<object>} Độc giả đã được tạo
 */
const registerReader = async (readerData) => {
  const email = String(readerData.email || '').trim().toLowerCase();
  const dienThoai = String(readerData.dienThoai || '').trim();

  // Kiểm tra trùng lặp email
  const existingEmail = await Reader.findOne({ email, isDeleted: false });
  if (existingEmail) {
    const error = new Error('Email đã được đăng ký bởi độc giả khác');
    error.status = 409;
    throw error;
  }

  // Kiểm tra trùng lặp điện thoại
  const existingPhone = await Reader.findOne({ dienThoai, isDeleted: false });
  if (existingPhone) {
    const error = new Error('Số điện thoại đã được đăng ký bởi độc giả khác');
    error.status = 409;
    throw error;
  }

  const reader = new Reader(readerData);
  await reader.save();
  return reader;
};

/**
 * Đăng nhập độc giả bằng email và mật khẩu
 * @param {string} email - Email đăng nhập
 * @param {string} matKhau - Mật khẩu plain text
 * @returns {Promise<object>} { reader, token }
 */
const loginReader = async (email, matKhau) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();

  const reader = await Reader.findOne({ email: normalizedEmail, isDeleted: false });
  if (!reader) {
    const error = new Error('Email hoặc mật khẩu không chính xác');
    error.status = 401;
    throw error;
  }

  if (reader.trangThai !== 'ACTIVE') {
    const error = new Error('Tài khoản của bạn đã bị khóa, vui lòng liên hệ thủ thư');
    error.status = 403;
    throw error;
  }

  const isMatch = await passwordService.verifyPassword(matKhau, reader.matKhau);
  if (!isMatch) {
    const error = new Error('Email hoặc mật khẩu không chính xác');
    error.status = 401;
    throw error;
  }

  const token = jwtHelper.signToken({
    id: reader._id,
    role: 'READER'
  });

  // Ẩn mật khẩu trước khi trả về
  const readerObj = reader.toObject();
  delete readerObj.matKhau;

  return {
    reader: readerObj,
    token
  };
};

/**
 * Đăng nhập nhân viên bằng maSoNV và mật khẩu
 * @param {string} maSoNV - Mã số nhân viên (ví dụ: NV001)
 * @param {string} matKhau - Mật khẩu plain text
 * @returns {Promise<object>} { staff, token }
 */
const loginStaff = async (maSoNV, matKhau) => {
  const normalizedCode = String(maSoNV || '').trim().toUpperCase();

  const staff = await Staff.findOne({ maSoNV: normalizedCode, isDeleted: false });
  if (!staff) {
    const error = new Error('Mã số nhân viên hoặc mật khẩu không chính xác');
    error.status = 401;
    throw error;
  }

  const isMatch = await passwordService.verifyPassword(matKhau, staff.matKhau);
  if (!isMatch) {
    const error = new Error('Mã số nhân viên hoặc mật khẩu không chính xác');
    error.status = 401;
    throw error;
  }

  const token = jwtHelper.signToken({
    id: staff._id,
    role: 'STAFF',
    chucVu: staff.chucVu
  });

  const staffObj = staff.toObject();
  delete staffObj.matKhau;

  return {
    staff: staffObj,
    token
  };
};

module.exports = {
  registerReader,
  loginReader,
  loginStaff
};
