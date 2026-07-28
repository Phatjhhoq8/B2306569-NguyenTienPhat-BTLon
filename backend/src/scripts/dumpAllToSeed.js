/**
 * Chức năng: Backup toàn bộ dữ liệu thật hiện tại (Sách, Thể loại, NXB, Tác giả, Gói hội viên, Cấu hình hệ thống) làm dữ liệu seed
 * Lý do tạo: Giúp khôi phục hệ thống về trạng thái thật hiện tại sau khi reset database hoặc chạy lệnh seed
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/library_management';

const dump = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected to dump database snapshot.');

    // Import Models động
    const MembershipPlan = mongoose.model('MembershipPlan', new mongoose.Schema({}, { strict: false }));
    const SystemSetting = mongoose.model('SystemSetting', new mongoose.Schema({}, { strict: false }));
    
    // Đăng ký Book models để populate hoạt động đúng
    const Author = mongoose.model('Author', new mongoose.Schema({ _id: String, tenTacGia: String }));
    const Publisher = mongoose.model('Publisher', new mongoose.Schema({ _id: String, tenNXB: String }));
    const Category = mongoose.model('Category', new mongoose.Schema({ _id: String, tenTheLoai: String }));
    
    const BookTitle = mongoose.model('BookTitle', new mongoose.Schema({
      _id: String,
      tenSach: String,
      tacGia: [{ type: String, ref: 'Author' }],
      nhaXuatBan: { type: String, ref: 'Publisher' },
      theLoai: { type: String, ref: 'Category' },
      giaBia: Number,
      moTa: String,
      isbn: String,
      namSanXuat: Number,
      hinhAnh: String
    }));

    // 1. Dump Gói Hội Viên (MembershipPlans)
    const plans = await MembershipPlan.find({}).lean();
    const cleanPlans = plans.map(p => {
      const { _id, createdAt, updatedAt, __v, maGoi, ...clean } = p;
      return clean;
    });

    // 2. Dump Cấu hình Hệ thống (SystemSettings)
    const settings = await SystemSetting.find({}).lean();
    const cleanSettings = settings.map(s => {
      const { _id, createdAt, updatedAt, __v, ...clean } = s;
      return clean;
    });

    // 3. Đọc file seed để chuẩn bị thay thế plans và defaultSettings
    const seedFilePath = path.join(__dirname, 'seedFromScrapedBooks.js');
    let seedContent = fs.readFileSync(seedFilePath, 'utf8');

    // Sửa mảng plans
    const plansStartMarker = 'const plans = [';
    const plansStartIndex = seedContent.indexOf(plansStartMarker);
    if (plansStartIndex !== -1) {
      let openBrackets = 1;
      let endIndex = -1;
      for (let i = plansStartIndex + plansStartMarker.length; i < seedContent.length; i++) {
        if (seedContent[i] === '[') openBrackets++;
        if (seedContent[i] === ']') {
          openBrackets--;
          if (openBrackets === 0) {
            endIndex = i + 1;
            break;
          }
        }
      }
      if (endIndex !== -1) {
        const plansJson = JSON.stringify(cleanPlans, null, 2);
        seedContent = seedContent.substring(0, plansStartIndex) + `const plans = ${plansJson}` + seedContent.substring(endIndex);
      }
    }

    // Sửa mảng defaultSettings
    const settingsStartMarker = 'const defaultSettings = [';
    const settingsStartIndex = seedContent.indexOf(settingsStartMarker);
    if (settingsStartIndex !== -1) {
      let openBrackets = 1;
      let endIndex = -1;
      for (let i = settingsStartIndex + settingsStartMarker.length; i < seedContent.length; i++) {
        if (seedContent[i] === '[') openBrackets++;
        if (seedContent[i] === ']') {
          openBrackets--;
          if (openBrackets === 0) {
            endIndex = i + 1;
            break;
          }
        }
      }
      if (endIndex !== -1) {
        const settingsJson = JSON.stringify(cleanSettings, null, 2);
        seedContent = seedContent.substring(0, settingsStartIndex) + `const defaultSettings = ${settingsJson}` + seedContent.substring(endIndex);
      }
    }

    // Ghi đè file seed
    fs.writeFileSync(seedFilePath, seedContent, 'utf8');
    console.log('- Đã lưu Gói hội viên và Cấu hình giao diện vào seedFromScrapedBooks.js');

    // 4. Dump Sách thật từ DB ra scraped_books.json
    const dbBooks = await BookTitle.find({})
      .populate('tacGia')
      .populate('nhaXuatBan')
      .populate('theLoai')
      .lean();

    if (dbBooks.length > 0) {
      const cleanBooks = dbBooks.map(b => {
        // Cắt bỏ phần prefix đường dẫn upload của local image nếu có
        let hinhAnhLocal = '';
        if (b.hinhAnh) {
          hinhAnhLocal = b.hinhAnh.replace('/uploads/books/', '');
        }

        return {
          tenSach: b.tenSach,
          tacGia: b.tacGia ? b.tacGia.map(t => t.tenTacGia || t) : [],
          nhaXuatBan: b.nhaXuatBan ? (b.nhaXuatBan.tenNXB || b.nhaXuatBan) : 'Chưa rõ',
          theLoai: b.theLoai ? (b.theLoai.tenTheLoai || b.theLoai) : 'Khác',
          giaBia: b.giaBia || 0,
          moTa: b.moTa || '',
          isbn: b.isbn || b._id,
          namSanXuat: b.namSanXuat || new Date().getFullYear(),
          hinhAnhLocal: hinhAnhLocal,
          hinhAnhUrl: b.hinhAnh || '',
          nguon: 'real_database'
        };
      });

      const outputDir = path.join(__dirname, 'output');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const scrapedBooksPath = path.join(outputDir, 'scraped_books.json');
      fs.writeFileSync(scrapedBooksPath, JSON.stringify(cleanBooks, null, 2), 'utf8');
      console.log(`- Đã dump thành công ${cleanBooks.length} sách thật vào: ${scrapedBooksPath}`);
    } else {
      console.log('- Không có sách nào trong DB để dump.');
    }

    console.log('🎉 Hoàn tất Snapshot Database làm seed thành công!');
    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi dump Snaphot Database:', error);
    process.exit(1);
  }
};

dump();
