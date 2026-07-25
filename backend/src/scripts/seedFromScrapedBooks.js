const path = require('path');
const config = require('../config');
const { connectDatabase } = require('../config/database');
const { Reader, Staff, MembershipPlan, BookTitle } = require('../models');
const { nextCode } = require('../services/codeService');
const { createBookTitle } = require('../services/bookService');

const books = require('./output/scraped_books.json');

const seedStaff = async () => {
  const existed = await Staff.findOne({ maSoNV: 'NV001' });
  if (existed) return existed;

  return Staff.create({
    maSoNV: await nextCode('staff'),
    hoTenNV: 'Quản lý hệ thống',
    email: 'admin@library.local',
    matKhau: 'admin123',
    chucVu: 'QUAN_LY',
    diachi: 'Thư viện trung tâm',
    soDienThoai: '0900000000'
  });
};

const seedReader = async () => {
  const existed = await Reader.findOne({ email: 'reader@library.local' });
  if (existed) return existed;

  return Reader.create({
    maDocGia: await nextCode('reader'),
    hoLot: 'Nguyễn Văn',
    ten: 'Độc Giả',
    email: 'reader@library.local',
    matKhau: 'reader123',
    ngaySinh: new Date('2000-01-01'),
    gioiTinh: 'NAM',
    diachi: 'Cần Thơ',
    dienThoai: '0911111111'
  });
};

const seedMembershipPlans = async () => {
  const plans = [
    { tenGoi: 'Tiêu chuẩn', giaTien: 0, soNgayHieuLuc: 365, soSachToiDa: 3, soNgayMuonToiDa: 14, mienTienCoc: false },
    { tenGoi: 'Đọc VIP', giaTien: 99000, soNgayHieuLuc: 30, soSachToiDa: 10, soNgayMuonToiDa: 30, mienTienCoc: true },
    { tenGoi: 'Gia đình', giaTien: 199000, soNgayHieuLuc: 30, soSachToiDa: 15, soNgayMuonToiDa: 30, mienTienCoc: true }
  ];

  return Promise.all(plans.map(async (plan) => {
    const existed = await MembershipPlan.findOne({ tenGoi: plan.tenGoi });
    if (existed) return existed;
    return MembershipPlan.create({ maGoi: await nextCode('membershipPlan'), ...plan });
  }));
};

const seedBooks = async () => {
  const results = await books.reduce(async (previous, book, index) => {
    const summary = await previous;
    const existed = await BookTitle.findOne({ $or: [{ isbn: book.isbn || '' }, { tenSach: book.tenSach }] });
    if (existed) return { ...summary, skipped: summary.skipped + 1 };

    const randomBorrowCount = Math.floor(Math.random() * 196) + 5; // 5 - 200
    const randomRating = Number((Math.random() * 1.0 + 4.0).toFixed(1)); // 4.0 - 5.0
    const randomReviewsCount = Math.floor(Math.random() * 78) + 3; // 3 - 80

    await createBookTitle({
      ...book,
      tongSoLuong: config.app.defaultBookCopiesCount,
      hinhAnh: book.hinhAnhLocal ? path.posix.join('/uploads/books', book.hinhAnhLocal) : '',
      tuKhoa: [book.theLoai, book.nguon, ...(book.tacGia || [])].filter(Boolean),
      soLuotMuon: randomBorrowCount,
      rating: randomRating,
      soLuotDanhGia: randomReviewsCount
    });

    if ((index + 1) % 10 === 0) console.log(`Đã seed ${index + 1}/${books.length} sách`);
    return { ...summary, created: summary.created + 1 };
  }, Promise.resolve({ created: 0, skipped: 0 }));

  return results;
};

const run = async () => {
  await connectDatabase();
  await seedStaff();
  await seedReader();
  await seedMembershipPlans();
  const bookStats = await seedBooks();

  console.log('Seed hoàn tất:', {
    staff: 'admin@library.local / admin123',
    reader: 'reader@library.local / reader123',
    books: bookStats
  });
  process.exit(0);
};

run().catch((error) => {
  console.error('Seed thất bại:', error);
  process.exit(1);
});
