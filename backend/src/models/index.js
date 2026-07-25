/**
 * Chức năng: Điểm xuất khẩu tập trung (Entry Point) của toàn bộ Mongoose Models trong hệ thống
 * Lý do tạo: Giúp các module khác trong backend import dễ dàng bằng cú pháp gom cụm
 */

const Counter = require('./counter.model');
const Publisher = require('./publisher.model');
const Author = require('./author.model');
const Category = require('./category.model');
const BookTitle = require('./bookTitle.model');
const BookCopy = require('./bookCopy.model');
const Reader = require('./reader.model');
const Staff = require('./staff.model');
const MembershipPlan = require('./membershipPlan.model');
const Subscription = require('./subscription.model');
const BorrowReceipt = require('./borrowReceipt.model');
const PenaltyTicket = require('./penaltyTicket.model');
const DiscountCode = require('./discountCode.model');

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
  DiscountCode
};
