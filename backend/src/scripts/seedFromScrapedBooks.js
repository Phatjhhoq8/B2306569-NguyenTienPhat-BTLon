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
  Counter,
  SystemSetting
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
    const randomRating = 0;
    const randomReviewsCount = 0;

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

const defaultSettings = [
  {
    key: 'homepage',
    value: {
      heroTitle: "KHÁM PHÁ THẾ GIỚI TRI THỨC TẠI CTU",
      heroSubtitle: "Tìm kiếm nhanh giáo trình môn học, công trình nghiên cứu khoa học và đăng ký mượn sách giấy trực tuyến dễ dàng tại Đại học Cần Thơ.",
      heroBanner: "/hero_banner.png",
      step1Title: "1. Chọn sách & Đăng ký",
      step1Desc: "Tìm kiếm cuốn sách cần thiết trong kho tài liệu số khổng lồ, nhấn nút đăng ký và lựa chọn gói dịch vụ phù hợp nhất.",
      step2Title: "2. Nhận mã xác nhận",
      step2Desc: "Hệ thống sẽ tự động phê duyệt nhanh chóng và gửi mã vạch xác nhận mượn sách trực tiếp qua thư điện tử/SMS.",
      step3Title: "3. Đến quầy thủ thư",
      step3Desc: "Mang mã xác nhận (hoặc thẻ độc giả) đến quầy thư viện trung tâm để nhận sách giấy trong thời gian hoạt động.",
      step4Title: "4. Trả sách đúng hẹn",
      step4Desc: "Độc giả trả sách tại quầy hoặc thùng trả tự động trước khi hết hạn để tránh phát sinh chi phí phạt không đáng có.",
      faqs: [
        {
          question: "Làm thế nào để đăng ký tài khoản độc giả mới?",
          answer: "Sinh viên và cán bộ giảng viên Trường Đại học Cần Thơ có thể nhấn nút 'Đăng ký' ở góc phải màn hình, điền thông tin MSSV/Mã số CB cùng email chính thức của trường để được xác thực và cấp tài khoản tự động."
        },
        {
          question: "Quy trình đặt mượn sách giấy trực tuyến diễn ra như thế nào?",
          answer: "Độc giả tìm kiếm sách trên trang danh mục, nhấn 'Đăng ký mượn', hệ thống sẽ gửi mã vạch phiếu hẹn điện tử. Độc giả chỉ cần mang mã này đến quầy thư viện trung tâm để nhận sách giấy trong vòng 5 phút."
        },
        {
          question: "Thời gian mượn tối đa là bao lâu và được mượn bao nhiêu cuốn sách?",
          answer: "Số lượng và thời gian mượn tùy thuộc gói hội viên: Gói Tiêu chuẩn (STUDENT) mượn tối đa 3 cuốn trong 14 ngày. Gói Đọc VIP mượn tối đa 10 cuốn trong 30 ngày. Bạn có thể gia hạn thời gian mượn trực tiếp trên trang cá nhân."
        },
        {
          question: "Trễ hạn trả sách có bị phạt tiền không và tính như thế nào?",
          answer: "Có. Để đảm bảo cơ hội mượn sách cho độc giả khác, sách trả trễ hạn sẽ bị áp dụng mức phí phạt nhỏ là 5.000 VND/ngày cho mỗi cuốn sách trễ hạn. Bạn cần thanh toán hết phí phạt để tiếp tục mượn sách."
        },
        {
          question: "Làm thế nào để thanh toán nâng cấp gói hội viên VIP?",
          answer: "Bạn truy cập mục 'Gói hội viên', bấm đăng ký gói mong muốn và quét mã QR chuyển khoản ngân hàng trên giao diện. Hệ thống sẽ tự động đối soát và kích hoạt đặc quyền VIP cho tài khoản của bạn ngay khi giao dịch thành công."
        }
      ]
    }
  },
  {
    key: 'aboutpage',
    value: {
      title: "Thư Viện Trung Tâm Đại Học Cần Thơ",
      description: "Thư viện Trung tâm Trường Đại học Cần Thơ là trung tâm thông tin học thuật hiện đại, đóng vai trò then chốt trong việc hỗ trợ đào tạo, nghiên cứu khoa học và chuyển giao công nghệ cho toàn vùng Đồng bằng sông Cửu Long.",
      historyTitle: "Lịch sử phát triển",
      historyContent: "Được thành lập cùng với sự phát triển của Trường Đại học Cần Thơ, Thư viện Trung tâm đã không ngừng được đầu tư nâng cấp cả về cơ sở vật chất, trang thiết bị lẫn nguồn học liệu số phong phú nhằm đáp ứng tiêu chuẩn quốc tế.",
      vision: "Trở thành trung tâm học liệu số hiện đại hàng đầu Việt Nam, kết nối tri thức toàn cầu.",
      mission: "Cung cấp nguồn thông tin khoa học chất lượng cao, không gian học tập nghiên cứu tiện nghi và dịch vụ thư viện chuyên nghiệp.",
      values: "Độc giả là trung tâm - Sáng tạo không ngừng - Kết nối tri thức - Minh bạch & Trách nhiệm."
    }
  },
  {
    key: 'catalogpage',
    value: {
      heroTitle: "Kho Tài Liệu Học Thuật & Sách Giấy",
      heroSubtitle: "Tra cứu hàng ngàn đầu sách giáo trình, nghiên cứu khoa học và tài liệu chuyên ngành chính thống của Trường Đại học Cần Thơ."
    }
  },
  {
    key: 'membershippage',
    value: {
      heroTitle: "Hạng Thẻ Hội Viên Thư Viện",
      heroSubtitle: "Đăng ký nâng cấp tài khoản hội viên để được hưởng đặc quyền mượn sách không giới hạn thời gian, số lượng lớn và dịch vụ ưu tiên tại Thư viện ĐH Cần Thơ.",
      qrTitle: "QUÉT MÃ QR THANH TOÁN",
      qrInstruction: "Sau khi chọn gói đăng ký mong muốn, vui lòng quét mã QR bên cạnh để thanh toán phí duy trì dịch vụ. Hệ thống sẽ tự động kích hoạt tài khoản ngay khi nhận được giao dịch thành công."
    }
  },
  {
    key: 'contactpage',
    value: {
      title: "Liên hệ với chúng tôi",
      subtitle: "Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ mọi nhu cầu học tập, mượn trả tài liệu của bạn.",
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3928.7933190848834!2d105.76757657591605!3d10.033905572428514!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a088194488383f%3A0xc07cfdb1ef3900f0!2zVGjGsCB2aeG7h24gVHJ1bmcgdMOibSAtIMSQ4bqhaSBo4buNYyBD4bqnbiBUaMah!5e0!3m2!1svi!2s!4v1714495570000!5m2!1svi!2s",
      libraryName: "Thư viện Trung tâm ĐH Cần Thơ",
      address: "Khu II, Đường 3/2, Phường Xuân Khánh, Quận Ninh Kiều, TP. Cần Thơ",
      hotline: "0292 3832 663",
      email: "support@ctu.edu.vn",
      moreTitle: "Thông Tin Thêm",
      moreHours: "Giờ làm việc: 7:30 – 21:00 (Tất cả các ngày trong tuần, kể cả Thứ Bảy, Chủ Nhật, trừ các ngày nghỉ lễ Tết theo quy định).",
      moreNote: "Độc giả vui lòng xuất trình thẻ độc giả (hoặc mã QR thẻ hội viên trên ứng dụng di động) khi thực hiện giao dịch mượn trả tại quầy thủ thư."
    }
  }
];

const seedSystemSettings = async () => {
  for (const setting of defaultSettings) {
    await SystemSetting.create(deepNormalizeNFC(setting));
  }
  console.log('Đã seed cấu hình cài đặt hệ thống (System Settings)');
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
    SystemSetting.deleteMany({}),
    Counter.deleteMany({})
  ]);
  console.log('Đã làm sạch toàn bộ cơ sở dữ liệu (Clean Database và Counters).');

  await seedStaff();
  await seedReader();
  await seedMembershipPlans();
  await seedSystemSettings();
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
