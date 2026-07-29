/**
 * Chức năng: Định nghĩa cấu trúc Schema và Model Mongoose cho Phiếu Mượn & Chi Tiết Mượn Sách (BorrowReceipt)
 * Lý do tạo: Quản lý giao dịch mượn trả sách giấy và theo dõi hạn trả
 */

const mongoose = require('mongoose');

const borrowDetailSchema = new mongoose.Schema({
  sach: {
    type: String,
    ref: 'BookCopy',
    required: [true, 'Cuốn sách được mượn là bắt buộc']
  },
  tinhTrangLucMuon: {
    type: String,
    required: [true, 'Tình trạng lúc mượn là bắt buộc'],
    trim: true
  },
  tinhTrangSauMuon: {
    type: String,
    trim: true,
    default: ''
  },
  daTraChua: {
    type: Boolean,
    default: false
  },
  ngayTraThucTe: {
    type: Date,
    default: null
  }
}, { _id: false });

const borrowReceiptSchema = new mongoose.Schema({
  _id: {
    type: String,
    trim: true
  },
  maPhieu: {
    type: String,
    required: [true, 'Mã phiếu mượn là bắt buộc'],
    unique: true,
    trim: true,
    uppercase: true
  },
  docGia: {
    type: String,
    ref: 'Reader',
    required: [true, 'Độc giả mượn sách là bắt buộc'],
    index: true
  },
  nhanVien: {
    type: String,
    ref: 'Staff',
    default: null
  },
  chiTietMuon: [borrowDetailSchema],
  ngayMuon: {
    type: Date,
    default: Date.now
  },
  ngayHenTra: {
    type: Date,
    required: [true, 'Ngày hẹn trả là bắt buộc']
  },
  ngayTraThucTe: {
    type: Date,
    default: null
  },
  tienCoc: {
    type: Number,
    min: [0, 'Tiền cọc không được âm'],
    default: 0
  },
  phiMuon: {
    type: Number,
    min: [0, 'Phí mượn không được âm'],
    default: 0
  },
  soTienGiam: {
    type: Number,
    min: [0, 'Số tiền giảm không được âm'],
    default: 0
  },
  tongTienThanhToan: {
    type: Number,
    min: [0, 'Tổng tiền thanh toán không được âm'],
    default: 0
  },
  trangThai: {
    type: String,
    enum: ['CHO_DUYET', 'SAN_SANG', 'DANG_MUON', 'DA_TRA', 'QUA_HAN', 'HUY'],
    default: 'DANG_MUON',
    index: true
  }
}, { timestamps: true });

borrowReceiptSchema.path('chiTietMuon').validate(function (value) {
  return value && value.length > 0;
}, 'Phiếu mượn phải chứa ít nhất 1 cuốn sách');

borrowReceiptSchema.path('chiTietMuon').validate(function (value) {
  if (!value || value.length === 0) return true;
  const bookCopyIds = value.map(item => String(item.sach));
  return new Set(bookCopyIds).size === bookCopyIds.length;
}, 'Phiếu mượn không được chứa trùng cuốn sách vật lý');

borrowReceiptSchema.path('ngayHenTra').validate(function (value) {
  return value >= this.ngayMuon;
}, 'Ngày hẹn trả không được trước ngày mượn');

borrowReceiptSchema.path('docGia').validate(async function (value) {
  if (!value) return true;
  const Reader = mongoose.model('Reader');
  const session = this.$session ? this.$session() : null;
  const reader = await Reader.findById(value).session(session);
  return !!reader && !reader.isDeleted && reader.trangThai === 'ACTIVE';
}, 'Độc giả tham chiếu không tồn tại hoặc không còn hoạt động');

borrowReceiptSchema.path('nhanVien').validate(async function (value) {
  if (!value) return true;
  const Staff = mongoose.model('Staff');
  const session = this.$session ? this.$session() : null;
  const staff = await Staff.findById(value).session(session);
  return !!staff && !staff.isDeleted;
}, 'Nhân viên tham chiếu không tồn tại hoặc đã bị xóa');

borrowReceiptSchema.path('chiTietMuon').validate(async function (value) {
  if (!value || value.length === 0) return true;
  const BookCopy = mongoose.model('BookCopy');
  const ids = value.map(item => item.sach);
  const session = this.$session ? this.$session() : null;
  const count = await BookCopy.countDocuments({ _id: { $in: ids } }).session(session);
  return count === new Set(ids.map(id => String(id))).size;
}, 'Một hoặc nhiều mã cuốn sách đăng ký mượn không tồn tại trong hệ thống thư viện');

// Trigger tự sinh mã maPhieu trước khi validate
borrowReceiptSchema.pre('validate', async function (next) {
  if (this.isNew && !this._id) {
    const { nextCode } = require('../../services/codeService');
    const code = await nextCode('borrowReceipt');
    this._id = code;
    this.maPhieu = code;
  }
  next();
});

borrowReceiptSchema.statics.markOverdueReceipts = function (referenceDate = new Date(), session = null) {
  const query = this.updateMany(
    {
      trangThai: 'DANG_MUON',
      ngayHenTra: { $lt: referenceDate },
      'chiTietMuon.daTraChua': false
    },
    { $set: { trangThai: 'QUA_HAN' } }
  );
  return session ? query.session(session) : query;
};

// Trigger tự động cập nhật mượn/trả sách, tồn kho
borrowReceiptSchema.pre('save', async function (next) {
  const BookCopy = mongoose.model('BookCopy');
  const BookTitle = mongoose.model('BookTitle');
  const Subscription = mongoose.model('Subscription');
  const PenaltyTicket = mongoose.model('PenaltyTicket');
  const Reader = mongoose.model('Reader');
  const session = this.$session();

  // === Helper: Giải phóng 1 cuốn sách vật lý và tạo phiếu phạt nếu trễ hạn ===
  const releaseCopy = async (item, isCancel = false) => {
    const copy = await BookCopy.findById(item.sach).session(session);
    if (!copy || copy.tinhTrang !== 'DA_MUON') return;

    const title = await BookTitle.findById(copy.dauSach).session(session);
    let newStatus = 'CHO_MUON';

    // Drain Strategy: nếu đầu sách đã bị ngừng phục vụ/xóa
    if (title && (title.trangThai === 'DISCONTINUED' || title.isDeleted)) {
      newStatus = 'BAO_TRI';
    }

    // Báo mất sách
    if (item.tinhTrangSauMuon === 'MAT') {
      newStatus = 'MAT';
    }

    // Cập nhật bằng findByIdAndUpdate (tránh kích hoạt pre-save hook của BookCopy)
    await BookCopy.findByIdAndUpdate(item.sach, {
      $set: {
        tinhTrang: newStatus,
        isDeleted: newStatus === 'BAO_TRI' ? true : copy.isDeleted,
        deletedAt: newStatus === 'BAO_TRI' ? new Date() : copy.deletedAt,
        ghiChu: newStatus === 'BAO_TRI' ? 'Thu hồi do ngừng phục vụ đầu sách' : (newStatus === 'MAT' ? 'Độc giả làm mất sách' : copy.ghiChu)
      }
    }).session(session);

    // Cộng lại tồn kho khả dụng nếu đầu sách hoạt động bình thường
    if (title && title.trangThai !== 'DISCONTINUED' && !title.isDeleted && newStatus === 'CHO_MUON') {
      await BookTitle.findByIdAndUpdate(copy.dauSach, { $inc: { soLuongKhaDung: 1 } }).session(session);
    } else if (newStatus === 'BAO_TRI' && !copy.isDeleted) {
      await BookTitle.findByIdAndUpdate(copy.dauSach, { $inc: { soLuongDangQuanLy: -1 } }).session(session);
    } else if (newStatus === 'MAT' && !copy.isDeleted) {
      // Giảm số lượng quản lý khi bị mất sách
      await BookTitle.findByIdAndUpdate(copy.dauSach, { $inc: { soLuongDangQuanLy: -1 } }).session(session);
    }

    // Tạo phiếu phạt nếu cuốn sách này bị mất hoặc trả trễ hạn (chỉ khi xử lý thực tế, không hủy)
    if (!isCancel) {
      if (newStatus === 'MAT') {
        const Staff = mongoose.model('Staff');
        const defaultStaff = await Staff.findOne({}).session(session);
        const staffId = this.nhanVien || (defaultStaff ? defaultStaff._id : null);
        if (!staffId) {
          throw new Error('Hệ thống yêu cầu phải có ít nhất một nhân viên trong CSDL để lập phiếu phạt');
        }
        // Phạt đền nguyên cuốn + 30.000đ phí xử lý
        const phiXuLy = 30000;
        await PenaltyTicket.create([{
          phieuMuon: this._id,
          nhanVien: staffId,
          lyDoPhat: `Làm mất sách: ${title ? title.tenSach : 'Sách'} (${copy.maSach}) (Bồi thường: giá sách + 30.000đ phí xử lý)`,
          soTienPhat: (title ? title.giaBia : 50000) + phiXuLy,
          daThanhToan: false
        }], { session });
      } else if (item.ngayTraThucTe && this.ngayHenTra) {
        // Chỉ phạt trễ hạn khi sách không bị mất
        const ngayTra = new Date(item.ngayTraThucTe).getTime();
        const ngayHen = new Date(this.ngayHenTra).getTime();
        if (ngayTra > ngayHen) {
            const diffDays = Math.ceil((ngayTra - ngayHen) / (1000 * 60 * 60 * 24));
            if (diffDays > 0) {
              const Staff = mongoose.model('Staff');
              const defaultStaff = await Staff.findOne({}).session(session);
              const staffId = this.nhanVien || (defaultStaff ? defaultStaff._id : null);
              if (!staffId) {
                throw new Error('Hệ thống yêu cầu phải có ít nhất một nhân viên trong CSDL để lập phiếu phạt');
              }
              // Tìm gói hội viên của độc giả để xác định mức phạt trễ hạn
              const activeSub = await Subscription.findOne({
                docGia: this.docGia,
                trangThai: 'DANG_HIEU_LUC'
              }).populate('goiDocGia').session(session);

              let dailyFine = 5000; // Mặc định
              if (activeSub && activeSub.goiDocGia) {
                dailyFine = activeSub.goiDocGia.phiPhatTreHan !== undefined ? activeSub.goiDocGia.phiPhatTreHan : 5000;
              }

              await PenaltyTicket.create([{
                phieuMuon: this._id,
                nhanVien: staffId,
                lyDoPhat: `Trả sách trễ hạn (${diffDays} ngày)`,
                soTienPhat: diffDays * dailyFine,
                daThanhToan: false
              }], { session });
            }
        }
      }
    }
  };

  // === PHẦN 0: Validate & check gói hội viên (dùng chung cho CHO_DUYET/SAN_SANG/DANG_MUON mới) ===
  const isNewBorrow = this.isNew && ['CHO_DUYET', 'DANG_MUON'].includes(this.trangThai);
  const isApproving = !this.isNew && this.isModified('trangThai') && this.trangThai === 'SAN_SANG';
  const isPickingUp = !this.isNew && this.isModified('trangThai') && this.trangThai === 'DANG_MUON';

  // === PHẦN 1A: Tạo phiếu mượn mới — validate + khóa sách ===
  if (isNewBorrow) {
    const reader = await Reader.findById(this.docGia).session(session);
    if (!reader || reader.isDeleted || reader.trangThai !== 'ACTIVE') {
      throw new Error('Độc giả không còn hoạt động hoặc đã bị khóa/xóa, không thể mượn sách');
    }

    const activeSub = await Subscription.findOne({
      docGia: this.docGia,
      trangThai: 'DANG_HIEU_LUC',
      ngayBatDau: { $lte: new Date() },
      ngayKetThuc: { $gte: new Date() }
    }).populate('goiDocGia').session(session);

    if (!activeSub || !activeSub.goiDocGia) {
      throw new Error('Độc giả không có gói hội viên còn hiệu lực để mượn sách');
    }

    const membershipPlan = activeSub.goiDocGia;

    const readerReceipts = await mongoose.model('BorrowReceipt').find({ docGia: this.docGia }).select('_id').session(session);
    const unpaidTickets = await PenaltyTicket.countDocuments({
      phieuMuon: { $in: readerReceipts.map(receipt => receipt._id) },
      daThanhToan: false
    }).session(session);
    if (unpaidTickets > 0) {
      throw new Error('Độc giả còn tiền phạt chưa thanh toán, không thể mượn sách mới');
    }

    const fifteenDaysAgo = new Date(new Date().getTime() - 15 * 24 * 60 * 60 * 1000);
    const hasLongOverdue = await mongoose.model('BorrowReceipt').exists({
      docGia: this.docGia,
      trangThai: 'QUA_HAN',
      ngayHenTra: { $lt: fifteenDaysAgo }
    }).session(session);
    if (hasLongOverdue) {
      throw new Error('Độc giả có sách trễ hạn quá 15 ngày chưa trả, tài khoản bị tạm khóa quyền mượn sách mới');
    }

    const activeReceipts = await mongoose.model('BorrowReceipt').find({
      docGia: this.docGia,
      trangThai: { $in: ['DANG_MUON', 'QUA_HAN', 'SAN_SANG'] }
    }).session(session);

    let currentBorrowedCount = 0;
    for (const r of activeReceipts) {
      currentBorrowedCount += r.chiTietMuon.filter(d => !d.daTraChua).length;
    }

    if (currentBorrowedCount + this.chiTietMuon.length > membershipPlan.soSachToiDa) {
      throw new Error(`Mượn sách vượt quá giới hạn tối đa cho phép của gói thẻ (Đã mượn: ${currentBorrowedCount}, Mượn thêm: ${this.chiTietMuon.length}, Giới hạn: ${membershipPlan.soSachToiDa})`);
    }

    // Khóa sách vật lý & Cập nhật tồn kho
    for (const item of this.chiTietMuon) {
      const copyCheck = await BookCopy.findById(item.sach).populate('dauSach').session(session);
      if (copyCheck && copyCheck.dauSach && (copyCheck.dauSach.trangThai === 'DISCONTINUED' || copyCheck.dauSach.isDeleted)) {
        throw new Error(`Đầu sách "${copyCheck.dauSach.tenSach}" đã ngừng phục vụ, không thể mượn thêm`);
      }

      const copy = await BookCopy.findOneAndUpdate(
        { _id: item.sach, tinhTrang: 'CHO_MUON', isDeleted: false },
        { $set: { tinhTrang: 'DA_MUON' } },
        { new: true }
      ).session(session);

      if (!copy) {
        throw new Error(`Cuốn sách với ID ${item.sach} hiện không khả dụng để mượn (đã bị mượn hoặc đang bảo trì)`);
      }

      await BookTitle.findByIdAndUpdate(copy.dauSach, { $inc: { soLuongKhaDung: -1 } }).session(session);
    }
  }

  // === PHẦN 1B: Duyệt phiếu (CHO_DUYET → SAN_SANG) — khóa sách nếu tạo bằng CHO_DUYET ===
  if (isApproving) {
    // Sách đã được khóa khi tạo phiếu, không cần khóa lại
    // Chỉ ghi nhận nhân viên duyệt
  }

  // === PHẦN 1C: Giao sách (SAN_SANG → DANG_MUON) — BẮT ĐẦU TÍNH THỜI HẠN & PHÍ ===
  if (isPickingUp) {
    const oldBorrow = await mongoose.model('BorrowReceipt').findById(this._id).session(session);
    if (oldBorrow && oldBorrow.trangThai === 'SAN_SANG') {
      const activeSub = await Subscription.findOne({
        docGia: this.docGia,
        trangThai: 'DANG_HIEU_LUC',
        ngayBatDau: { $lte: new Date() },
        ngayKetThuc: { $gte: new Date() }
      }).populate('goiDocGia').session(session);

      if (!activeSub || !activeSub.goiDocGia) {
        throw new Error('Độc giả không có gói hội viên còn hiệu lực');
      }
      const membershipPlan = activeSub.goiDocGia;

      // Cập nhật ngày mượn = thời điểm giao sách, tính lại hạn trả
      const now = new Date();
      const originalBorrowDays = Math.ceil(
        (new Date(oldBorrow.ngayHenTra).getTime() - new Date(oldBorrow.ngayMuon).getTime()) / (1000 * 60 * 60 * 24)
      );
      const borrowDays = Math.min(originalBorrowDays, membershipPlan.soNgayMuonToiDa);
      this.ngayMuon = now;
      this.ngayHenTra = new Date(now.getTime() + borrowDays * 24 * 60 * 60 * 1000);

      // Tính phí mượn & tiền cọc
      const basePhiMuonPerBook = membershipPlan.phiMuonSachGiay !== undefined ? membershipPlan.phiMuonSachGiay : 0;
      const baseTienCoc = membershipPlan.tienDatCoc !== undefined ? membershipPlan.tienDatCoc : 0;
      this.tienCoc = baseTienCoc;

      let totalPhiMuon = 0;
      for (const item of this.chiTietMuon) {
        const copyCheck = await BookCopy.findById(item.sach).populate('dauSach').session(session);
        if (copyCheck && copyCheck.dauSach) {
          const title = copyCheck.dauSach;
          const isGiaoTrinh = (title.tenSach || '').toLowerCase().includes('giáo trình') ||
                               (title.tenSach || '').toLowerCase().includes('bài tập') ||
                               (title.tenSach || '').toLowerCase().includes('sách giáo khoa') ||
                               (title.theLoai || '').toString().toLowerCase().includes('giáo dục') ||
                               (title.theLoai || '').toString().toLowerCase().includes('ngoại ngữ') ||
                               (title.theLoai || '').toString().toLowerCase().includes('khoa học');
          if (!isGiaoTrinh) {
            totalPhiMuon += basePhiMuonPerBook;
          }
          // Tăng lượt mượn thực tế
          await BookTitle.findByIdAndUpdate(title._id, { $inc: { soLuotMuon: 1 } }).session(session);
        }
      }

      this.phiMuon = totalPhiMuon;
      this.tongTienThanhToan = totalPhiMuon;
    }
  }

  // === PHẦN 2: Cập nhật phiếu mượn đã tồn tại ===
  if (!this.isNew) {
    if (this.isModified('trangThai') && this.trangThai === 'HUY') {
      const oldBorrow = await mongoose.model('BorrowReceipt').findById(this._id).session(session);
      const hasBorrowedBooks = oldBorrow && oldBorrow.chiTietMuon.some(item => !item.daTraChua);
      // Cho phép hủy từ CHO_DUYET hoặc SAN_SANG (chưa giao sách)
      if (hasBorrowedBooks && !['CHO_DUYET', 'SAN_SANG'].includes(oldBorrow.trangThai)) {
        throw new Error('Không được hủy phiếu mượn sau khi sách đã được giao; hãy xử lý trả sách bằng DA_TRA');
      }
    }

    // A. Xử lý trả sách từng cuốn (khi chiTietMuon được cập nhật)
    if (this.isModified('chiTietMuon')) {
      const OldBorrow = await mongoose.model('BorrowReceipt').findById(this._id).session(session);
      if (OldBorrow) {
        // Chặn thêm/xóa hoặc thay đổi cuốn sách
        if (OldBorrow.chiTietMuon.length !== this.chiTietMuon.length) {
          throw new Error('Không được phép thêm/xóa sách trong phiếu mượn đã tạo');
        }
        for (let i = 0; i < this.chiTietMuon.length; i++) {
          if (String(OldBorrow.chiTietMuon[i].sach) !== String(this.chiTietMuon[i].sach)) {
            throw new Error('Không được phép thay đổi cuốn sách trong phiếu mượn đã tạo');
          }
        }

        // Phát hiện cuốn sách vừa được trả (daTraChua: false → true)
        for (let i = 0; i < this.chiTietMuon.length; i++) {
          const oldItem = OldBorrow.chiTietMuon[i];
          const newItem = this.chiTietMuon[i];

          if (!oldItem.daTraChua && newItem.daTraChua) {
            // Gán ngày trả nếu chưa có
            if (!newItem.ngayTraThucTe) {
              this.chiTietMuon[i].ngayTraThucTe = new Date();
            }
            await releaseCopy(this.chiTietMuon[i], false);
          }
        }

        // Auto-complete: Tất cả sách đã trả → tự động chuyển trạng thái phiếu sang DA_TRA
        const allReturned = this.chiTietMuon.every(item => item.daTraChua);
        if (allReturned && ['DANG_MUON', 'QUA_HAN'].includes(this.trangThai)) {
          this.trangThai = 'DA_TRA';
        }
      }
    }

    // B. Trả toàn bộ (DA_TRA) hoặc Hủy phiếu (HUY) - chỉ xử lý sách chưa trả
    if (this.isModified('trangThai') && (this.trangThai === 'DA_TRA' || this.trangThai === 'HUY')) {
      const isCancel = this.trangThai === 'HUY';
      const defaultReturnDate = this.ngayTraThucTe || new Date();

      for (const item of this.chiTietMuon) {
        if (!item.daTraChua) {
          item.daTraChua = true;
          if (!isCancel) {
            item.ngayTraThucTe = item.ngayTraThucTe || defaultReturnDate;
          }
          await releaseCopy(item, isCancel);
        }
      }
    }
  }

  next();
});

module.exports = mongoose.model('BorrowReceipt', borrowReceiptSchema);
