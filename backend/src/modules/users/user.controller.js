/**
 * Chức năng: Controller điều hướng request cho tài khoản và xác thực
 * Lý do tạo: Nhận tham số từ router, xử lý cookies bảo mật, gọi service nghiệp vụ và trả về kết quả
 */

const userService = require('./user.service');
const cookieHelper = require('../../utils/cookieHelper');
const resultResponse = require('../../utils/resultResponse');
const Reader = require('./reader.model');
const Staff = require('./staff.model');
const passwordService = require('../../services/passwordService');

/**
 * Đăng ký độc giả mới
 */
const registerReader = async (req, res, next) => {
  try {
    const reader = await userService.registerReader(req.body);
    // Ẩn mật khẩu trước khi trả về
    const readerObj = reader.toObject();
    delete readerObj.matKhau;
    return resultResponse.ok(res, readerObj, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Đăng nhập độc giả
 */
const loginReader = async (req, res, next) => {
  try {
    const { email, matKhau } = req.body;
    if (!email || !matKhau) {
      return resultResponse.err(res, 'Email và mật khẩu là bắt buộc', 400);
    }

    const { reader, token } = await userService.loginReader(email, matKhau);
    cookieHelper.setCookieToken(res, token);
    return resultResponse.ok(res, { reader });
  } catch (error) {
    next(error);
  }
};

/**
 * Đăng nhập nhân viên
 */
const loginStaff = async (req, res, next) => {
  try {
    const { maSoNV, matKhau } = req.body;
    if (!maSoNV || !matKhau) {
      return resultResponse.err(res, 'Mã số nhân viên và mật khẩu là bắt buộc', 400);
    }

    const { staff, token } = await userService.loginStaff(maSoNV, matKhau);
    cookieHelper.setCookieToken(res, token);
    return resultResponse.ok(res, { staff });
  } catch (error) {
    next(error);
  }
};

/**
 * Đăng xuất tài khoản
 */
const logout = async (req, res, next) => {
  try {
    cookieHelper.clearCookieToken(res);
    return resultResponse.ok(res, { message: 'Đăng xuất thành công' });
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy thông tin tài khoản hiện tại
 */
const getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return resultResponse.err(res, 'Người dùng chưa xác thực', 401);
    }
    // Ẩn mật khẩu nếu có
    const userObj = req.user.toObject ? req.user.toObject() : { ...req.user };
    delete userObj.matKhau;
    return resultResponse.ok(res, { user: userObj });
  } catch (error) {
    next(error);
  }
};

/**
 * Độc giả tự cập nhật thông tin cá nhân
 */
const updateMeProfile = async (req, res, next) => {
  try {
    if (!req.user || req.user.chucVu) {
      return resultResponse.err(res, 'Chức năng chỉ dành cho độc giả', 403);
    }

    const allowedUpdates = ['hoLot', 'ten', 'diachi', 'dienThoai', 'ngaySinh', 'gioiTinh'];
    const updates = {};
    
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const reader = await Reader.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    const readerObj = reader.toObject();
    delete readerObj.matKhau;

    return resultResponse.ok(res, readerObj);
  } catch (error) {
    next(error);
  }
};

/**
 * Độc giả tự thay đổi mật khẩu
 */
const updateMePassword = async (req, res, next) => {
  try {
    if (!req.user || req.user.chucVu) {
      return resultResponse.err(res, 'Chức năng chỉ dành cho độc giả', 403);
    }

    const { matKhauCu, matKhauMoi } = req.body;
    if (!matKhauCu || !matKhauMoi) {
      return resultResponse.err(res, 'Mật khẩu cũ và mật khẩu mới là bắt buộc', 400);
    }

    const reader = await Reader.findById(req.user._id);
    const isMatch = await passwordService.verifyPassword(matKhauCu, reader.matKhau);
    if (!isMatch) {
      return resultResponse.err(res, 'Mật khẩu cũ không chính xác', 400);
    }

    reader.matKhau = matKhauMoi;
    await reader.save();

    return resultResponse.ok(res, { message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    next(error);
  }
};

// ==================== ADMIN: Quản lý Độc giả ====================

/**
 * Lấy danh sách tất cả độc giả (Staff only)
 */
const getReaders = async (req, res, next) => {
  try {
    const { q, status, page = 1, limit = 20 } = req.query;
    const filter = { isDeleted: false };
    if (q) filter.$or = [
      { hoLot: { $regex: q, $options: 'i' } },
      { ten: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } }
    ];
    if (status) filter.trangThai = status;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [readers, totalCount] = await Promise.all([
      Reader.find(filter).select('-matKhau').skip(skip).limit(parseInt(limit, 10)).sort({ createdAt: -1 }),
      Reader.countDocuments(filter)
    ]);
    return resultResponse.ok(res, { readers, totalCount, page: parseInt(page, 10), limit: parseInt(limit, 10) });
  } catch (error) { next(error); }
};

/**
 * Lấy chi tiết 1 độc giả (Staff only)
 */
const getReaderById = async (req, res, next) => {
  try {
    const reader = await Reader.findById(req.params.id).select('-matKhau');
    if (!reader || reader.isDeleted) return resultResponse.err(res, 'Không tìm thấy độc giả', 404);
    return resultResponse.ok(res, reader);
  } catch (error) { next(error); }
};

/**
 * Khóa / Mở khóa tài khoản độc giả (Staff only)
 */
const toggleReaderStatus = async (req, res, next) => {
  try {
    const reader = await Reader.findById(req.params.id);
    if (!reader || reader.isDeleted) return resultResponse.err(res, 'Không tìm thấy độc giả', 404);
    reader.trangThai = reader.trangThai === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
    await reader.save();
    const obj = reader.toObject(); delete obj.matKhau;
    return resultResponse.ok(res, obj);
  } catch (error) { next(error); }
};

/**
 * Xóa mềm độc giả (Staff only)
 */
const softDeleteReader = async (req, res, next) => {
  try {
    const reader = await Reader.findById(req.params.id);
    if (!reader || reader.isDeleted) return resultResponse.err(res, 'Không tìm thấy độc giả', 404);
    reader.isDeleted = true;
    reader.deletedAt = new Date();
    await reader.save();
    return resultResponse.ok(res, { message: 'Đã xóa mềm độc giả thành công' });
  } catch (error) { next(error); }
};

// ==================== ADMIN: Quản lý Nhân viên ====================

/**
 * Lấy danh sách nhân viên (Quản lý only)
 */
const getStaffs = async (req, res, next) => {
  try {
    const staffs = await Staff.find({ isDeleted: false }).select('-matKhau').sort({ createdAt: -1 });
    return resultResponse.ok(res, staffs);
  } catch (error) { next(error); }
};

/**
 * Tạo nhân viên mới (Quản lý only)
 */
const createStaff = async (req, res, next) => {
  try {
    const { hoTenNV, matKhau, chucVu, diachi, soDienThoai } = req.body;
    if (!hoTenNV || !matKhau || !diachi || !soDienThoai) {
      return resultResponse.err(res, 'Thiếu thông tin bắt buộc', 400);
    }
    const staff = await Staff.create({ hoTenNV, matKhau, chucVu, diachi, soDienThoai });
    const obj = staff.toObject(); delete obj.matKhau;
    return resultResponse.ok(res, obj, 201);
  } catch (error) { next(error); }
};

/**
 * Cập nhật thông tin nhân viên (Quản lý only)
 */
const updateStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff || staff.isDeleted) return resultResponse.err(res, 'Không tìm thấy nhân viên', 404);
    const allowedUpdates = ['hoTenNV', 'chucVu', 'diachi', 'soDienThoai'];
    allowedUpdates.forEach((field) => { if (req.body[field] !== undefined) staff[field] = req.body[field]; });
    if (req.body.matKhau) staff.matKhau = req.body.matKhau;
    await staff.save();
    const obj = staff.toObject(); delete obj.matKhau;
    return resultResponse.ok(res, obj);
  } catch (error) { next(error); }
};

/**
 * Xóa mềm nhân viên (Quản lý only)
 */
const softDeleteStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff || staff.isDeleted) return resultResponse.err(res, 'Không tìm thấy nhân viên', 404);
    staff.isDeleted = true;
    staff.deletedAt = new Date();
    await staff.save();
    return resultResponse.ok(res, { message: 'Đã xóa mềm nhân viên thành công' });
  } catch (error) { next(error); }
};

module.exports = {
  registerReader,
  loginReader,
  loginStaff,
  logout,
  getMe,
  updateMeProfile,
  updateMePassword,
  // Admin: Quản lý Độc giả
  getReaders,
  getReaderById,
  toggleReaderStatus,
  softDeleteReader,
  // Admin: Quản lý Nhân viên
  getStaffs,
  createStaff,
  updateStaff,
  softDeleteStaff
};
