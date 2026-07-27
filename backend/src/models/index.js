/**
 * Chức năng: Điểm xuất khẩu tập trung (Entry Point) của toàn bộ Mongoose Models
 * Lý do tạo: Tái cấu trúc sang Modular Design nhưng vẫn giữ nguyên proxy để tương thích ngược với các file tests/scripts cũ
 */

const Counter = require('./counter.model'); // Counter giữ nguyên tại thư mục models/
const Publisher = require('../modules/books/publisher.model');
const Author = require('../modules/books/author.model');
const Category = require('../modules/books/category.model');
const BookTitle = require('../modules/books/bookTitle.model');
const BookCopy = require('../modules/books/bookCopy.model');
const Reader = require('../modules/users/reader.model');
const Staff = require('../modules/users/staff.model');
const MembershipPlan = require('../modules/memberships/membershipPlan.model');
const Subscription = require('../modules/memberships/subscription.model');
const BorrowReceipt = require('../modules/borrowing/borrowReceipt.model');
const PenaltyTicket = require('../modules/borrowing/penaltyTicket.model');
const DiscountCode = require('../modules/discounts/discountCode.model');
const SystemSetting = require('../modules/settings/systemSetting.model');

module.exports = {
  Counter,
  Publisher,
  Author,
  Category,
  BookTitle,
  BookCopy,
  Reader,
  Staff,
  MembershipPlan,
  Subscription,
  BorrowReceipt,
  PenaltyTicket,
  DiscountCode,
  SystemSetting
};
