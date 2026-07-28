/**
 * Chức năng: Định nghĩa cấu trúc Schema và Model Mongoose cho Cuốn Sách Vật Lý (BookCopy)
 * Lý do tạo: Đại diện cho từng bản sao vật lý cụ thể trên kệ sách
 */

const mongoose = require('mongoose');

const bookCopySchema = new mongoose.Schema({
  _id: {
    type: String,
    trim: true
  },
  maSach: {
    type: String,
    required: [true, 'Mã cuốn sách là bắt buộc'],
    unique: true,
    trim: true,
    uppercase: true
  },
  dauSach: {
    type: String,
    ref: 'BookTitle',
    required: [true, 'Đầu sách tham chiếu là bắt buộc'],
    index: true
  },
  viTriKe: {
    type: String,
    trim: true,
    default: ''
  },
  tinhTrang: {
    type: String,
    enum: {
      values: ['CHO_MUON', 'DA_MUON', 'BAO_TRI', 'MAT'],
      message: 'Trạng thái sách phải là: CHO_MUON, DA_MUON, BAO_TRI, MAT'
    },
    default: 'CHO_MUON',
    index: true
  },
  ngayNhap: {
    type: Date,
    default: Date.now
  },
  ghiChu: {
    type: String,
    default: ''
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

bookCopySchema.pre('validate', async function(next) {
  if (this.isNew && !this._id) {
    const { nextCode } = require('../../services/codeService');
    const code = await nextCode('bookCopy');
    this._id = code;
    this.maSach = code;
  }
  next();
});

bookCopySchema.path('dauSach').validate(async function(value) {
  if (!value) return true;
  const BookTitle = mongoose.model('BookTitle');
  const session = this.$session ? this.$session() : null;
  const title = await BookTitle.findById(value).session(session);
  return !!title && !title.isDeleted;
}, 'Đầu sách tham chiếu không tồn tại hoặc đã bị xóa');

// Trigger tự động đồng bộ tồn kho khả dụng đầu sách khi sách vật lý bị hỏng/mất/xóa mềm
bookCopySchema.pre('save', async function(next) {
  const BookTitle = mongoose.model('BookTitle');
  const session = this.$session();

  if (this.isNew) {
    const inc = { tongSoLuong: 1 };
    if (!this.isDeleted) {
      inc.soLuongDangQuanLy = 1;
    }
    // Khi tạo mới sách vật lý ở trạng thái CHO_MUON
    if (this.tinhTrang === 'CHO_MUON' && !this.isDeleted) {
      inc.soLuongKhaDung = 1;
    }
    if (Object.keys(inc).length > 0) {
      await BookTitle.findByIdAndUpdate(this.dauSach, { $inc: inc }).session(session);
    }
  } else {
    // Khi cập nhật sách vật lý - chỉ truy vấn oldDoc 1 lần duy nhất
    const BookCopy = mongoose.model('BookCopy');
    const oldDoc = await BookCopy.findById(this._id).session(session);
    if (oldDoc) {
      if (String(oldDoc.dauSach) !== String(this.dauSach)) {
        throw new Error('Không được phép thay đổi đầu sách của cuốn sách vật lý đã tạo');
      }

      // Chặn xóa mềm hoặc thay đổi trạng thái khi sách đang được mượn
      if (oldDoc.tinhTrang === 'DA_MUON') {
        if (this.tinhTrang !== 'DA_MUON' || this.isDeleted === true) {
          throw new Error('Không thể xóa hoặc chuyển trạng thái cuốn sách đang được độc giả mượn (DA_MUON)');
        }
        return next();
      }

      // Đồng bộ tồn kho khả dụng đầu sách
      const wasChoMuon = oldDoc.tinhTrang === 'CHO_MUON' && !oldDoc.isDeleted;
      const isNowChoMuon = this.tinhTrang === 'CHO_MUON' && !this.isDeleted;

      const inc = {};

      if (wasChoMuon && !isNowChoMuon) {
        // Mất quyền CHO_MUON (do đổi trạng thái sang BAO_TRI/MAT hoặc bị xóa)
        inc.soLuongKhaDung = -1;
      } else if (!wasChoMuon && isNowChoMuon) {
        // Được trả về CHO_MUON
        inc.soLuongKhaDung = 1;
      }

      if (!oldDoc.isDeleted && this.isDeleted) {
        inc.soLuongDangQuanLy = -1;
      } else if (oldDoc.isDeleted && !this.isDeleted) {
        inc.soLuongDangQuanLy = 1;
      }

      if (Object.keys(inc).length > 0) {
        await BookTitle.findByIdAndUpdate(this.dauSach, { $inc: inc }).session(session);
      }
    }
  }
  next();
});

module.exports = mongoose.model('BookCopy', bookCopySchema);
