/**
 * Chức năng: Cập nhật nhanh số sách tối đa của gói Family lên 25 cuốn trực tiếp vào CSDL
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/library_management';

const run = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected.');

    const MembershipPlan = mongoose.model('MembershipPlan', new mongoose.Schema({}, { strict: false }));
    const r1 = await MembershipPlan.updateOne({ tenGoi: /Family/i }, { $set: { soSachToiDa: 25, khuyenDung: true } });
    const r2 = await MembershipPlan.updateOne({ tenGoi: /Max/i }, { $set: { khuyenDung: true } });
    console.log('Đã cập nhật gói Family:', r1);
    console.log('Đã cập nhật gói Max:', r2);
    process.exit(0);
  } catch (err) {
    console.error('Lỗi khi cập nhật:', err);
    process.exit(1);
  }
};

run();
