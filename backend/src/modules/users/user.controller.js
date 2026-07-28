/**
 * Chức năng: Controller điều hướng request cho tài khoản và xác thực
 * Lý do tạo: Nhận tham số từ router, xử lý cookies bảo mật, gọi service nghiệp vụ và trả về kết quả
 */

const mongoose = require('mongoose');
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

    // Đính kèm subscriptionPlan của reader
    const Subscription = mongoose.model('Subscription');
    const activeSub = await Subscription.findOne({
      docGia: reader._id,
      trangThai: 'DANG_HIEU_LUC',
      ngayBatDau: { $lte: new Date() },
      ngayKetThuc: { $gte: new Date() }
    }).populate('goiDocGia');

    if (activeSub && activeSub.goiDocGia) {
      reader.subscriptionPlan = activeSub.goiDocGia;
    } else {
      const MembershipPlan = mongoose.model('MembershipPlan');
      const defaultPlan = await MembershipPlan.findOne({ giaTien: 0 }) || {
        tenGoi: 'Tiêu chuẩn',
        soNgayMuonToiDa: 7,
        soSachToiDa: 3,
        mienTienCoc: false
      };
      reader.subscriptionPlan = defaultPlan;
    }

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

    // Đính kèm subscriptionPlan đang hiệu lực của độc giả
    const userRole = req.user.role || (req.user.maSoNV ? 'STAFF' : 'READER');
    if (userRole === 'READER') {
      const Subscription = mongoose.model('Subscription');
      const activeSub = await Subscription.findOne({
        docGia: req.user._id,
        trangThai: 'DANG_HIEU_LUC',
        ngayBatDau: { $lte: new Date() },
        ngayKetThuc: { $gte: new Date() }
      }).populate('goiDocGia');

      if (activeSub && activeSub.goiDocGia) {
        userObj.subscriptionPlan = activeSub.goiDocGia;
      } else {
        const MembershipPlan = mongoose.model('MembershipPlan');
        const defaultPlan = await MembershipPlan.findOne({ giaTien: 0 }) || {
          tenGoi: 'Tiêu chuẩn',
          soNgayMuonToiDa: 7,
          soSachToiDa: 3,
          mienTienCoc: false
        };
        userObj.subscriptionPlan = defaultPlan;
      }
    }

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
    if (q) {
      const cleanQ = q.trim();
      filter.$or = [
        { hoLot: { $regex: cleanQ, $options: 'i' } },
        { ten: { $regex: cleanQ, $options: 'i' } },
        { email: { $regex: cleanQ, $options: 'i' } },
        { dienThoai: { $regex: cleanQ, $options: 'i' } },
        { maDocGia: { $regex: cleanQ, $options: 'i' } }
      ];
      if (cleanQ.includes(' ')) {
        filter.$or.push({
          $expr: {
            $regexMatch: {
              input: { $concat: ['$hoLot', ' ', '$ten'] },
              regex: cleanQ,
              options: 'i'
            }
          }
        });
      }
    }
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
    // Giải phóng email và số điện thoại để người khác có thể đăng ký lại
    reader.email = `deleted_${Date.now()}_${reader.email}`;
    reader.dienThoai = `deleted_${Date.now()}_${reader.dienThoai}`;
    await reader.save({ validateBeforeSave: false });
    return resultResponse.ok(res, { message: 'Đã xóa mềm độc giả thành công' });
  } catch (error) { next(error); }
};

// ==================== ADMIN: Quản lý Nhân viên ====================

/**
 * Lấy danh sách nhân viên (Quản lý only)
 */
const getStaffs = async (req, res, next) => {
  try {
    const { q, role } = req.query;
    const filter = { isDeleted: false };
    if (q) {
      filter.$or = [
        { hoTenNV: { $regex: q, $options: 'i' } },
        { soDienThoai: { $regex: q, $options: 'i' } },
        { maSoNV: { $regex: q, $options: 'i' } }
      ];
    }
    if (role) {
      filter.chucVu = role;
    }
    const staffs = await Staff.find(filter).select('-matKhau').sort({ createdAt: -1 });
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
    // Giải phóng số điện thoại và mã số nhân viên để tránh trùng lặp
    staff.soDienThoai = `deleted_${Date.now()}_${staff.soDienThoai}`;
    staff.maSoNV = `DELETED_${Date.now()}_${staff.maSoNV}`;
    await staff.save({ validateBeforeSave: false });
    return resultResponse.ok(res, { message: 'Đã xóa mềm nhân viên thành công' });
  } catch (error) { next(error); }
};

/**
 * Gợi ý tìm kiếm độc giả (Staff/Admin only)
 */
const getReaderSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) return resultResponse.ok(res, []);
    const keyword = q.trim();
    const regex = new RegExp(keyword, 'i');
    
    const readers = await Reader.find({
      isDeleted: false,
      $or: [
        { ten: regex },
        { hoLot: regex },
        { dienThoai: regex },
        { maDocGia: regex }
      ]
    }).limit(10).select('hoLot ten dienThoai maDocGia');
    
    const suggestions = readers.map(r => ({
      id: r._id,
      text: `${r.hoLot} ${r.ten} (${r.maDocGia}) - ${r.dienThoai}`,
      name: `${r.hoLot} ${r.ten}`,
      code: r.maDocGia
    }));
    
    return resultResponse.ok(res, suggestions);
  } catch (error) { next(error); }
};

/**
 * Gợi ý tìm kiếm nhân viên (Quản lý only)
 */
const getStaffSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) return resultResponse.ok(res, []);
    const keyword = q.trim();
    const regex = new RegExp(keyword, 'i');
    
    const staffs = await Staff.find({
      isDeleted: false,
      $or: [
        { hoTenNV: regex },
        { soDienThoai: regex },
        { maSoNV: regex }
      ]
    }).limit(10).select('hoTenNV soDienThoai maSoNV');
    
    const suggestions = staffs.map(s => ({
      id: s._id,
      text: `${s.hoTenNV} (${s.maSoNV}) - ${s.soDienThoai}`,
      name: s.hoTenNV,
      code: s.maSoNV
    }));
    
    return resultResponse.ok(res, suggestions);
  } catch (error) { next(error); }
};

/**
 * Khôi phục độc giả đã bị xóa mềm (Staff/Quản lý only)
 */
const restoreReader = async (req, res, next) => {
  try {
    const reader = await Reader.findById(req.params.id);
    if (!reader || !reader.isDeleted) return resultResponse.err(res, 'Không tìm thấy độc giả đã bị xóa', 404);

    const emailGoc = reader.email.replace(/^deleted_\d+_/, '');
    const dienThoaiGoc = reader.dienThoai.replace(/^deleted_\d+_/, '');

    // Kiểm tra xem email hoặc SĐT gốc có bị độc giả đang hoạt động khác chiếm dụng không
    const dupEmail = await Reader.findOne({ email: emailGoc, isDeleted: false });
    if (dupEmail) {
      return resultResponse.err(res, `Không thể khôi phục vì Email gốc (${emailGoc}) đã được sử dụng bởi độc giả đang hoạt động khác`, 409);
    }
    const dupPhone = await Reader.findOne({ dienThoai: dienThoaiGoc, isDeleted: false });
    if (dupPhone) {
      return resultResponse.err(res, `Không thể khôi phục vì Số điện thoại gốc (${dienThoaiGoc}) đã được sử dụng bởi độc giả đang hoạt động khác`, 409);
    }

    reader.isDeleted = false;
    reader.deletedAt = null;
    reader.email = emailGoc;
    reader.dienThoai = dienThoaiGoc;
    await reader.save();

    const obj = reader.toObject(); delete obj.matKhau;
    return resultResponse.ok(res, { message: 'Khôi phục tài khoản độc giả thành công', reader: obj });
  } catch (error) { next(error); }
};

/**
 * Khôi phục nhân viên đã bị xóa mềm (Quản lý only)
 */
const restoreStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff || !staff.isDeleted) return resultResponse.err(res, 'Không tìm thấy nhân viên đã bị xóa', 404);

    const phoneGoc = staff.soDienThoai.replace(/^deleted_\d+_/, '');
    const maSoNVGoc = staff.maSoNV.replace(/^DELETED_\d+_/, '');

    // Kiểm tra xem số điện thoại hoặc mã nhân viên gốc có bị ai chiếm dụng không
    const dupPhone = await Staff.findOne({ soDienThoai: phoneGoc, isDeleted: false });
    if (dupPhone) {
      return resultResponse.err(res, `Không thể khôi phục vì Số điện thoại gốc (${phoneGoc}) đã được sử dụng bởi nhân viên đang hoạt động khác`, 409);
    }
    const dupCode = await Staff.findOne({ maSoNV: maSoNVGoc, isDeleted: false });
    if (dupCode) {
      return resultResponse.err(res, `Không thể khôi phục vì Mã số nhân viên gốc (${maSoNVGoc}) đã tồn tại trong hệ thống`, 409);
    }

    staff.isDeleted = false;
    staff.deletedAt = null;
    staff.soDienThoai = phoneGoc;
    staff.maSoNV = maSoNVGoc;
    await staff.save();

    const obj = staff.toObject(); delete obj.matKhau;
    return resultResponse.ok(res, { message: 'Khôi phục tài khoản nhân viên thành công', staff: obj });
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
  restoreReader,
  getReaderSuggestions,
  // Admin: Quản lý Nhân viên
  getStaffs,
  createStaff,
  updateStaff,
  softDeleteStaff,
  restoreStaff,
  getStaffSuggestions
};
