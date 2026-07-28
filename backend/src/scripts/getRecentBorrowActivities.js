/**
 * Chức năng: Truy vấn và hiển thị 5 hoạt động mượn sách mới nhất trong CSDL
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/library_management';

const run = async () => {
  try {
    await mongoose.connect(mongoUri);
    
    // Đăng ký các model cần thiết để populate hoạt động đúng
    const Reader = mongoose.model('Reader', new mongoose.Schema({ hoLot: String, ten: String, email: String }));
    const Author = mongoose.model('Author', new mongoose.Schema({ tenTacGia: String }));
    const Category = mongoose.model('Category', new mongoose.Schema({ tenTheLoai: String }));
    const Publisher = mongoose.model('Publisher', new mongoose.Schema({ tenNXB: String }));
    const BookTitle = mongoose.model('BookTitle', new mongoose.Schema({
      tenSach: String,
      tacGia: [{ type: String, ref: 'Author' }],
      theLoai: { type: String, ref: 'Category' },
      nhaXuatBan: { type: String, ref: 'Publisher' }
    }));
    
    const BookCopy = mongoose.model('BookCopy', new mongoose.Schema({
      maVach: String,
      dauSach: { type: String, ref: 'BookTitle' }
    }));

    const BorrowReceipt = mongoose.model('BorrowReceipt', new mongoose.Schema({
      maPhieu: String,
      docGia: { type: String, ref: 'Reader' },
      ngayMuon: Date,
      ngayHenTra: Date,
      trangThai: String,
      chiTietMuon: [{
        sach: { type: String, ref: 'BookCopy' }
      }]
    }));

    const receipts = await BorrowReceipt.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('docGia')
      .populate({
        path: 'chiTietMuon.sach',
        populate: {
          path: 'dauSach',
          populate: ['tacGia', 'theLoai', 'nhaXuatBan']
        }
      })
      .lean();

    console.log(JSON.stringify(receipts, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Lỗi khi truy vấn:', err);
    process.exit(1);
  }
};

run();
