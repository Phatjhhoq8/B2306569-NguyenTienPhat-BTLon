/**
 * Chức năng: Script cập nhật phiếu mượn quá hạn sang trạng thái QUA_HAN
 * Lý do tạo: Cho phép chạy định kỳ bằng scheduler/cron bên ngoài hệ thống
 */

const { connectDatabase } = require('../config/database');
const { markOverdueReceipts } = require('../services/borrowService');

const run = async () => {
  await connectDatabase();
  const result = await markOverdueReceipts(new Date());
  console.log(`Updated overdue receipts: ${result.modifiedCount || 0}`);
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
