/**
 * Chức năng: Script cập nhật mật khẩu cho Staff NV001
 * Lý do tạo: Cập nhật dữ liệu cũ đã tồn tại trước đó để đồng bộ mật khẩu mới admin123
 */

const mongoose = require('mongoose');
const { connectDatabase } = require('../config/database');
const { Staff } = require('../models');

async function run() {
  try {
    await connectDatabase();
    const staff = await Staff.findOne({ maSoNV: 'NV001' });
    if (staff) {
      staff.matKhau = 'admin123';
      await staff.save();
      console.log('✅ Đã cập nhật mật khẩu cho NV001 thành: admin123');
    } else {
      console.log('❌ Không tìm thấy nhân viên NV001 để cập nhật');
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật mật khẩu:', error);
  } finally {
    await mongoose.connection.close();
  }
}

run();
