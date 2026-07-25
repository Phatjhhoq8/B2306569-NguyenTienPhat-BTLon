const app = require('../app');
const models = require('../models');

const requiredModels = [
  'Publisher',
  'Author',
  'Category',
  'BookTitle',
  'BookCopy',
  'Reader',
  'Staff',
  'MembershipPlan',
  'Subscription',
  'BorrowReceipt',
  'PenaltyTicket',
  'DiscountCode'
];

const missingModels = requiredModels.filter((modelName) => !models[modelName]);

if (missingModels.length) {
  console.error(`Thiếu models: ${missingModels.join(', ')}`);
  process.exit(1);
}

if (!app) {
  console.error('Express app không khởi tạo được');
  process.exit(1);
}

console.log('Backend structure verification passed.');
