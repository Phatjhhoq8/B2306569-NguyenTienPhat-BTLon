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
  {
    "tenGoi": "Tiêu chuẩn",
    "giaTien": 0,
    "soNgayHieuLuc": 365,
    "soSachToiDa": 3,
    "soNgayMuonToiDa": 7,
    "mienTienCoc": false,
    "choPhepGiaHanOnline": false,
    "quayNhanUuTien": false,
    "chiaSeNhomGiaDinh": false,
    "docEbookKhongGioiHan": false,
    "giaoSachTanNha": false,
    "workshopDocQuyen": false,
    "loaiGoi": "INDIVIDUAL",
    "khuyenDung": false,
    "phiMuonSachGiay": 5000,
    "phiPhatTreHan": 10000,
    "tienDatCoc": 100000
  },
  {
    "tenGoi": "Pro",
    "giaTien": 39000,
    "soNgayHieuLuc": 30,
    "soSachToiDa": 8,
    "soNgayMuonToiDa": 14,
    "mienTienCoc": false,
    "choPhepGiaHanOnline": true,
    "quayNhanUuTien": false,
    "chiaSeNhomGiaDinh": false,
    "docEbookKhongGioiHan": false,
    "giaoSachTanNha": false,
    "workshopDocQuyen": false,
    "loaiGoi": "INDIVIDUAL",
    "khuyenDung": false,
    "phiMuonSachGiay": 3000,
    "phiPhatTreHan": 6000,
    "tienDatCoc": 50000
  },
  {
    "tenGoi": "VIP",
    "giaTien": 79000,
    "soNgayHieuLuc": 30,
    "soSachToiDa": 15,
    "soNgayMuonToiDa": 30,
    "mienTienCoc": true,
    "choPhepGiaHanOnline": true,
    "quayNhanUuTien": true,
    "chiaSeNhomGiaDinh": false,
    "docEbookKhongGioiHan": true,
    "giaoSachTanNha": true,
    "workshopDocQuyen": true,
    "loaiGoi": "INDIVIDUAL",
    "khuyenDung": true,
    "phiMuonSachGiay": 0,
    "phiPhatTreHan": 4000,
    "tienDatCoc": 0
  },
  {
    "tenGoi": "Family",
    "giaTien": 149000,
    "soNgayHieuLuc": 30,
    "soSachToiDa": 20,
    "soNgayMuonToiDa": 30,
    "mienTienCoc": true,
    "choPhepGiaHanOnline": true,
    "quayNhanUuTien": true,
    "chiaSeNhomGiaDinh": true,
    "docEbookKhongGioiHan": true,
    "giaoSachTanNha": true,
    "workshopDocQuyen": true,
    "loaiGoi": "TEAM",
    "khuyenDung": false,
    "phiMuonSachGiay": 0,
    "phiPhatTreHan": 4000,
    "tienDatCoc": 0
  },
  {
    "tenGoi": "Enterprise",
    "giaTien": 299000,
    "soNgayHieuLuc": 30,
    "soSachToiDa": 50,
    "soNgayMuonToiDa": 60,
    "mienTienCoc": true,
    "choPhepGiaHanOnline": true,
    "quayNhanUuTien": true,
    "chiaSeNhomGiaDinh": true,
    "docEbookKhongGioiHan": true,
    "giaoSachTanNha": true,
    "workshopDocQuyen": true,
    "loaiGoi": "TEAM",
    "khuyenDung": true,
    "phiMuonSachGiay": 0,
    "phiPhatTreHan": 2000,
    "tienDatCoc": 0
  }
];

  return Promise.all(plans.map(async (plan) => {
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

    const randomBorrowCount = 0;
    const randomRating = 0;
    const randomReviewsCount = 0;

    let normalizedCategory = normalizeCategoryName(normalizedBook.theLoai);
    if (index === 9) {
      normalizedCategory = 'Khác';
    }

    // Phân bổ vị trí kệ phù hợp theo thể loại
    let viTriKe = 'KE-F1';
    if (normalizedCategory === 'Truyện Dài' || normalizedCategory === 'Truyện Ngắn') {
      viTriKe = `KE-A${Math.floor(Math.random() * 5) + 1}`; // KE-A1 đến KE-A5
    } else if (normalizedCategory === 'Tiểu Thuyết' || normalizedCategory === 'Văn Học' || normalizedCategory.includes('Văn Học')) {
      viTriKe = `KE-B${Math.floor(Math.random() * 5) + 1}`; // KE-B1 đến KE-B5
    } else if (normalizedCategory === 'Kinh Tế') {
      viTriKe = `KE-C${Math.floor(Math.random() * 5) + 1}`; // KE-C1 đến KE-C5
    } else if (normalizedCategory === 'Tâm Lý - Kỹ Năng') {
      viTriKe = `KE-D${Math.floor(Math.random() * 5) + 1}`; // KE-D1 đến KE-D5
    } else if (normalizedCategory === 'Giáo Dục' || normalizedCategory === 'Khoa Học & Công Nghệ') {
      viTriKe = `KE-E${Math.floor(Math.random() * 5) + 1}`; // KE-E1 đến KE-E5
    } else {
      viTriKe = `KE-F${Math.floor(Math.random() * 5) + 1}`; // KE-F1 đến KE-F5
    }

    await createBookTitle({
      ...normalizedBook,
      theLoai: normalizedCategory,
      tongSoLuong: config.app.defaultBookCopiesCount,
      viTriKe: viTriKe,
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
    "key": "homepage",
    "value": {
      "heroTitle": "KHÁM PHÁ THẾ GIỚI TRI THỨC TẠI CTU",
      "heroSubtitle": "Tìm kiếm nhanh giáo trình môn học, công trình nghiên cứu khoa học và đăng ký mượn sách giấy trực tuyến dễ dàng tại Đại học Cần Thơ.",
      "heroBanner": "/hero_banner.png",
      "step1Title": "Tìm kiếm & Chọn sách",
      "step1Desc": "Tra cứu đầu sách mong muốn trên hệ thống cổng thư viện điện tử CTU eLibrary với bộ lọc thông minh.",
      "step2Title": "Thêm vào giỏ mượn",
      "step2Desc": "Đưa các cuốn sách cần mượn vào giỏ trực tuyến và xác nhận thời hạn cùng chi nhánh nhận sách mong muốn.",
      "step3Title": "Nhận mã phiếu hẹn",
      "step3Desc": "Hệ thống cấp ngay mã phiếu hẹn điện tử ghi rõ hạn giữ sách và gửi thông tin xác nhận trực tiếp.",
      "step4Title": "Đến nhận sách giấy",
      "step4Desc": "Độc giả xuất trình mã phiếu hẹn tại quầy thủ thư chi nhánh đã chọn để nhận sách giấy trong 5 phút.",
      "faqs": [
        {
          "question": "Làm thế nào để đăng ký tài khoản độc giả mới?",
          "answer": "Sinh viên và cán bộ giảng viên Trường Đại học Cần Thơ có thể nhấn nút 'Đăng ký' ở góc phải màn hình, điền thông tin MSSV/Mã số CB cùng email chính thức của trường để được xác thực và cấp tài khoản tự động."
        },
        {
          "question": "Quy trình đặt mượn sách giấy trực tuyến diễn ra như thế nào?",
          "answer": "Độc giả tìm kiếm sách trên trang danh mục, nhấn 'Đăng ký mượn', hệ thống sẽ gửi mã vạch phiếu hẹn điện tử. Độc giả chỉ cần mang mã này đến quầy thư viện trung tâm để nhận sách giấy trong vòng 5 phút."
        },
        {
          "question": "Thời gian mượn tối đa là bao lâu và được mượn bao nhiêu cuốn sách?",
          "answer": "Số lượng và thời gian mượn tùy thuộc gói hội viên: Gói Tiêu chuẩn (STUDENT) mượn tối đa 3 cuốn trong 14 ngày. Gói Đọc VIP mượn tối đa 10 cuốn trong 30 ngày. Bạn có thể gia hạn thời gian mượn trực tiếp trên trang cá nhân."
        },
        {
          "question": "Trễ hạn trả sách có bị phạt tiền không và tính như thế nào?",
          "answer": "Có. Để đảm bảo cơ hội mượn sách cho độc giả khác, sách trả trễ hạn sẽ bị áp dụng mức phí phạt nhỏ là 5.000 VND/ngày cho mỗi cuốn sách trễ hạn. Bạn cần thanh toán hết phí phạt để tiếp tục mượn sách."
        },
        {
          "question": "Làm thế nào để thanh toán nâng cấp gói hội viên VIP?",
          "answer": "Bạn truy cập mục 'Gói hội viên', bấm đăng ký gói mong muốn và quét mã QR chuyển khoản ngân hàng trên giao diện. Hệ thống sẽ tự động đối soát và kích hoạt đặc quyền VIP cho tài khoản của bạn ngay khi giao dịch thành công."
        }
      ]
    }
  },
  {
    "key": "aboutpage",
    "value": {
      "title": "Hệ Thống Thư Viện Điện Tử CTU eLibrary",
      "description": "Đơn vị thư viện học thuật uy tín hàng đầu chuyên cung cấp giải pháp tra cứu sách giấy, giáo trình, nghiên cứu khoa học chất lượng cao cho sinh viên và cán bộ giảng viên Trường Đại học Cần Thơ.",
      "historyTitle": "Hành trình Kết nối Tri thức & Phát triển Tương lai",
      "historyContent": "Được phát triển nhằm nâng cao năng lực tự học và nghiên cứu của sinh viên Trường Đại học Cần Thơ, CTU eLibrary bắt đầu sứ mệnh mang đến trải nghiệm mượn sách giấy online tiện lợi, minh bạch và nhanh chóng. Trải qua thời gian dài nâng cấp, chúng tôi tự hào đồng hành cùng hàng chục ngàn sinh viên trên con đường học vấn.",
      "vision": "Trở thành hệ thống cổng thông tin thư viện điện tử kết hợp mượn trả sách giấy tự động hiện đại nhất khu vực Đồng bằng sông Cửu Long, tiên phong áp dụng công nghệ số và hệ thống quản lý thẻ hội viên thông minh.",
      "mission": "Cung cấp giải pháp tra cứu và đăng ký mượn sách giấy trực tuyến nhanh gọn, khoa học và hoàn toàn minh bạch. Hỗ trợ sinh viên tối ưu hóa thời gian nghiên cứu và tiếp cận nguồn tri thức chính thống giá trị.",
      "values": "Mọi hoạt động quản lý sách và hỗ giả của thư viện đều được chuẩn hóa nghiêm ngặt để mang lại sự tiện lợi tốt nhất cho sinh viên.",
      "stats": {
        "years": "10+",
        "readers": "50,000+",
        "branches": "01"
      },
      "teamMembers": [
        {
          "name": "Nguyễn Tiến Phát",
          "role": "Giám đốc Thư viện",
          "avatarText": "P",
          "avatar": "/uploads/upload_1785267122959_602110275.jpg"
        },
        {
          "name": "Mark Zuckerberg",
          "role": "Phó Giám đốc điều hành",
          "avatarText": "M",
          "avatar": "/uploads/mark_zuckerberg.png"
        },
        {
          "name": "Elon Musk",
          "role": "Trưởng phòng Quản lý Sách",
          "avatarText": "E",
          "avatar": "/uploads/elon_musk.png"
        },
        {
          "name": "Cristiano Ronaldo",
          "role": "Thủ thư Trưởng chi nhánh",
          "avatarText": "C",
          "avatar": "/uploads/cristiano_ronaldo.png"
        }
      ]
    }
  },
  {
    "key": "catalogpage",
    "value": {
      "heroTitle": "Kho Tài Liệu Học Thuật & Sách Giấy",
      "heroSubtitle": "Tra cứu hàng ngàn đầu sách giáo trình, nghiên cứu khoa học và tài liệu chuyên ngành chính thống của Trường Đại học Cần Thơ."
    }
  },
  {
    "key": "membershippage",
    "value": {
      "heroTitle": "Hạng Thẻ Hội Viên Thư Viện",
      "heroSubtitle": "Đăng ký nâng cấp tài khoản hội viên để được hưởng đặc quyền mượn sách không giới hạn thời gian, số lượng lớn và dịch vụ ưu tiên tại Thư viện ĐH Cần Thơ.",
      "qrTitle": "QUÉT MÃ QR THANH TOÁN",
      "qrInstruction": "Sau khi chọn gói đăng ký mong muốn, vui lòng quét mã QR bên cạnh để thanh toán phí duy trì dịch vụ. Hệ thống sẽ tự động kích hoạt tài khoản ngay khi nhận được giao dịch thành công."
    }
  },
  {
    "key": "contactpage",
    "value": {
      "title": "Liên hệ với chúng tôi",
      "subtitle": "Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ mọi nhu cầu học tập, mượn trả tài liệu của bạn.",
      "mapUrl": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3928.7933190848834!2d105.76757657591605!3d10.033905572428514!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a088194488383f%3A0xc07cfdb1ef3900f0!2zVGjGsCB2aeG7h24gVHJ1bmcgdMOibSAtIMSQ4bqhaSBo4buNYyBD4bqnbiBUaMah!5e0!3m2!1svi!2s!4v1714495570000!5m2!1svi!2s",
      "libraryName": "Thư viện Trung tâm ĐH Cần Thơ",
      "address": "Khu II, Đường 3/2, Phường Xuân Khánh, Quận Ninh Kiều, TP. Cần Thơ",
      "hotline": "0292 3832 663",
      "email": "support@ctu.edu.vn",
      "moreTitle": "Thông Tin Thêm",
      "moreHours": "Giờ làm việc: 7:30 – 21:00 (Tất cả các ngày trong tuần, kể cả Thứ Bảy, Chủ Nhật, trừ các ngày nghỉ lễ Tết theo quy định).",
      "moreNote": "Độc giả vui lòng xuất trình thẻ độc giả (hoặc mã QR thẻ hội viên trên ứng dụng di động) khi thực hiện giao dịch mượn trả tại quầy thủ thư."
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
  const reader = await seedReader();
  await seedMembershipPlans();
  await seedSystemSettings();

  // Tạo đăng ký (Subscription) gói Tiêu chuẩn hoạt động cho reader mẫu
  const standardPlan = await MembershipPlan.findOne({ tenGoi: 'Tiêu chuẩn' });
  if (standardPlan && reader) {
    const ngayBatDau = new Date();
    const ngayKetThuc = new Date(ngayBatDau.getTime() + standardPlan.soNgayHieuLuc * 24 * 60 * 60 * 1000);
    await Subscription.create({
      docGia: reader._id,
      goiDocGia: standardPlan._id,
      ngayBatDau,
      ngayKetThuc,
      tongTien: 0,
      trangThai: 'DANG_HIEU_LUC',
      phuongThucThanhToan: 'VIETQR'
    });
  }

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
