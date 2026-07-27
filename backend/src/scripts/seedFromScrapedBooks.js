const path = require('path');
const config = require('../config');
const { connectDatabase } = require('../config/database');
const { 
  Reader, 
  Staff, 
  MembershipPlan, 
  BookTitle, 
  BookCopy, 
  Subscription, 
  BorrowReceipt, 
  PenaltyTicket,
  DiscountCode,
  Category,
  Author,
  Publisher,
  Counter
} = require('../models');
const { nextCode } = require('../services/codeService');
const { createBookTitle } = require('../services/bookService');

const books = require('./output/scraped_books.json');

const deepNormalizeNFC = (val) => {
  if (typeof val === 'string') {
    return val.normalize('NFC');
  }
  if (Array.isArray(val)) {
    return val.map(deepNormalizeNFC);
  }
  if (typeof val === 'object' && val !== null && !(val instanceof Date)) {
    const res = {};
    for (const key in val) {
      res[key] = deepNormalizeNFC(val[key]);
    }
    return res;
  }
  return val;
};

const seedStaff = async () => {
  const existed = await Staff.findOne({ maSoNV: 'NV001' });
  if (existed) return existed;

  return Staff.create(deepNormalizeNFC({
    hoTenNV: 'Quản lý hệ thống',
    matKhau: 'admin123',
    chucVu: 'QUAN_LY',
    diachi: 'Thư viện trung tâm',
    soDienThoai: '0900000000'
  }));
};

const seedReader = async () => {
  const existed = await Reader.findOne({ email: 'reader@library.local' });
  if (existed) return existed;

  return Reader.create(deepNormalizeNFC({
    hoLot: 'Nguyễn Văn',
    ten: 'Độc Giả',
    email: 'reader@library.local',
    matKhau: 'reader123',
    ngaySinh: new Date('2000-01-01'),
    gioiTinh: 'NAM',
    diachi: 'Cần Thơ',
    dienThoai: '0911111111'
  }));
};

const seedMembershipPlans = async () => {
  const plans = [
    { tenGoi: 'Tiêu chuẩn', giaTien: 0, soNgayHieuLuc: 365, soSachToiDa: 3, soNgayMuonToiDa: 14, mienTienCoc: false },
    { tenGoi: 'Đọc VIP', giaTien: 99000, soNgayHieuLuc: 30, soSachToiDa: 10, soNgayMuonToiDa: 30, mienTienCoc: true },
    { tenGoi: 'Gia đình', giaTien: 199000, soNgayHieuLuc: 30, soSachToiDa: 15, soNgayMuonToiDa: 30, mienTienCoc: true }
  ];

  return Promise.all(plans.map(async (plan) => {
    const existed = await MembershipPlan.findOne({ tenGoi: plan.tenGoi.normalize('NFC') });
    if (existed) return existed;
    return MembershipPlan.create(deepNormalizeNFC(plan));
  }));
};

const normalizeCategoryName = (rawName) => {
  if (!rawName) return 'Khác';
  const name = rawName.trim().toLowerCase().normalize('NFC');
  
  if (name.includes('truyện dài')) return 'Truyện Dài';
  if (name.includes('truyện ngắn') || name.includes('tạp văn')) return 'Truyện Ngắn';
  if (name.includes('văn học hiện đại') || name.includes('hiện đại')) return 'Văn Học Hiện Đại';
  if (name.includes('văn học cổ điển') || name.includes('cổ điển')) return 'Văn Học Cổ Điển';
  if (name.includes('thiếu nhi') || name.includes('cổ tích')) return 'Văn Học Thiếu Nhi';
  if (name.includes('tiểu thuyết')) return 'Tiểu Thuyết';
  if (name.includes('văn học')) return 'Văn Học';
  
  if (name.includes('kinh tế') || name.includes('tài chính') || name.includes('quản trị') || name.includes('kinh doanh')) {
    return 'Kinh Tế';
  }
  
  if (name.includes('tâm lý') || name.includes('kỹ năng') || name.includes('giao tiếp')) {
    return 'Tâm Lý - Kỹ Năng';
  }
  
  if (name.includes('giáo dục') || name.includes('học tập')) {
    return 'Giáo Dục';
  }
  
  if (name.includes('ngôn ngữ') || name.includes('ngoại ngữ') || name.includes('tiếng anh')) {
    return 'Ngoại Ngữ';
  }
  
  if (name.includes('truyện tranh') || name.includes('comic') || name.includes('manga')) {
    return 'Truyện Tranh';
  }
  
  if (name.includes('khoa học') || name.includes('công nghệ') || name.includes('tin học')) {
    return 'Khoa Học & Công Nghệ';
  }
  
  if (name.includes('nghệ thuật') || name.includes('tô màu') || name.includes('đời sống') || name.includes('tâm linh')) {
    return 'Nghệ Thuật & Đời Sống';
  }
  
  return 'Khác';
};

const seedBooks = async () => {
  const results = await books.reduce(async (previous, book, index) => {
    const summary = await previous;
    const normalizedBook = deepNormalizeNFC(book);
    
    const existed = await BookTitle.findOne({ $or: [{ isbn: normalizedBook.isbn || '' }, { tenSach: normalizedBook.tenSach }] });
    if (existed) return { ...summary, skipped: summary.skipped + 1 };

    const randomBorrowCount = Math.floor(Math.random() * 196) + 5;
    const randomRating = Number((Math.random() * 1.0 + 4.0).toFixed(1));
    const randomReviewsCount = Math.floor(Math.random() * 78) + 3;

    let normalizedCategory = normalizeCategoryName(normalizedBook.theLoai);
    if (index === 9) {
      normalizedCategory = 'Khác';
    }

    await createBookTitle({
      ...normalizedBook,
      theLoai: normalizedCategory,
      tongSoLuong: config.app.defaultBookCopiesCount,
      hinhAnh: normalizedBook.hinhAnhLocal ? path.posix.join('/uploads/books', normalizedBook.hinhAnhLocal) : '',
      tuKhoa: [normalizedCategory, normalizedBook.nguon, ...(normalizedBook.tacGia || [])].filter(Boolean).map(s => s.normalize('NFC')),
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

  await Promise.all([
    BookTitle.deleteMany({}),
    BookCopy.deleteMany({}),
    Category.deleteMany({}),
    Author.deleteMany({}),
    Publisher.deleteMany({}),
    Reader.deleteMany({}),
    Staff.deleteMany({}),
    MembershipPlan.deleteMany({}),
    Subscription.deleteMany({}),
    BorrowReceipt.deleteMany({}),
    PenaltyTicket.deleteMany({}),
    DiscountCode.deleteMany({}),
    Counter.deleteMany({})
  ]);
  console.log('Đã làm sạch toàn bộ cơ sở dữ liệu (Clean Database và Counters).');

  await seedStaff();
  await seedReader();
  await seedMembershipPlans();
  const bookStats = await seedBooks();

  console.log('Seed hoàn tất:', {
    staff: 'NV001 / admin123',
    reader: 'reader@library.local / reader123',
    books: bookStats
  });
  process.exit(0);
};

run().catch((error) => {
  console.error('Seed thất bại:', error);
  process.exit(1);
});
