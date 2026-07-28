/**
 * Chức năng: Service quản lý Đầu Sách (BookTitle) và Cuốn Sách Vật Lý (BookCopy)
 * Lý do tạo: Tự động hóa việc map thông tin danh mục (tác giả, NXB, thể loại) và tự động tạo bản sao vật lý
 */

const mongoose = require('mongoose');
const config = require('../../config');
const BookTitle = require('./bookTitle.model');
const BookCopy = require('./bookCopy.model');
const Publisher = require('./publisher.model');
const Author = require('./author.model');
const Category = require('./category.model');
const { nextCode } = require('../../services/codeService');

const isTransactionUnsupportedError = (error) => {
  const message = String(error && error.message || '');
  return message.includes('Transaction numbers are only allowed') || message.includes('replica set member or mongos');
};

const withTransactionFallback = async (work) => {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return result;
  } catch (error) {
    if (!isTransactionUnsupportedError(error)) throw error;
    return work(null);
  } finally {
    await session.endSession();
  }
};

/**
 * Helper kiểm tra xem một đối tượng hoặc chuỗi có phải là mã ID hợp lệ không
 * @param {any} id
 * @returns {boolean}
 */
const isValidObjectId = (id) => {
  if (!id) return false;
  if (id instanceof mongoose.Types.ObjectId) return true;
  if (typeof id === 'string') {
    if (/^[0-9a-fA-F]{24}$/.test(id)) return true;
    return /^(NXB|TG|TL|DS|BS|DG|NV|GOI|DK|PM|PP|KM\d{6})\d+$/.test(id);
  }
  return false;
};

/**
 * Xử lý hoặc tạo mới Nhà Xuất Bản từ ID hoặc tên
 * @param {any} nxbInput
 * @returns {Promise<mongoose.Types.ObjectId>}
 */
const resolvePublisher = async (nxbInput, session = null) => {
  if (!nxbInput) throw new Error('Nhà xuất bản là bắt buộc');
  
  if (isValidObjectId(nxbInput)) {
    const publisher = await Publisher.findById(nxbInput).session(session);
    if (!publisher) throw new Error('Nhà xuất bản không tồn tại');
    return publisher._id;
  }

  // Tìm theo tên
  const name = String(nxbInput).trim();
  let publisher = await Publisher.findOne({ tenNXB: name }).session(session);
  if (!publisher) {
    const maNXB = await nextCode('publisher');
    [publisher] = await Publisher.create([{
      maNXB,
      tenNXB: name
    }], { session });
  }
  return publisher._id;
};

/**
 * Xử lý hoặc tạo mới Thể Loại từ ID hoặc tên
 * @param {any} categoryInput
 * @returns {Promise<mongoose.Types.ObjectId>}
 */
const resolveCategory = async (categoryInput, session = null) => {
  if (!categoryInput) throw new Error('Thể loại là bắt buộc');
  
  if (isValidObjectId(categoryInput)) {
    const category = await Category.findById(categoryInput).session(session);
    if (!category) throw new Error('Thể loại không tồn tại');
    return category._id;
  }

  // Tìm theo tên (không phân biệt chữ hoa chữ thường để tránh trùng lặp)
  const name = String(categoryInput).trim();
  let category = await Category.findOne({
    tenTheLoai: { $regex: new RegExp('^' + name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i') }
  }).session(session);

  if (!category) {
    const maTheLoai = await nextCode('category');
    [category] = await Category.create([{
      maTheLoai,
      tenTheLoai: name
    }], { session });
  }
  return category._id;
};

/**
 * Xử lý hoặc tạo mới danh sách Tác Giả từ ID hoặc tên
 * @param {any[]|any} authorsInput
 * @returns {Promise<mongoose.Types.ObjectId[]>}
 */
const resolveAuthors = async (authorsInput, session = null) => {
  if (!authorsInput || (Array.isArray(authorsInput) && authorsInput.length === 0)) {
    throw new Error('Đầu sách phải có ít nhất 1 tác giả');
  }

  const authors = Array.isArray(authorsInput) ? authorsInput : [authorsInput];

  const authorIds = await Promise.all(
    authors.map(async (authorNameOrId) => {
      if (isValidObjectId(authorNameOrId)) {
        const author = await Author.findById(authorNameOrId).session(session);
        if (!author) throw new Error('Tác giả không tồn tại');
        return author._id;
      }

      const name = String(authorNameOrId).trim();
      let author = await Author.findOne({ tenTacGia: name }).session(session);
      if (!author) {
        const maTacGia = await nextCode('author');
        [author] = await Author.create([{
          maTacGia,
          tenTacGia: name
        }], { session });
      }
      return author._id;
    })
  );

  return authorIds;
};

/**
 * Tạo mới Đầu Sách và tự sinh các bản sao vật lý BookCopy
 * @param {object} bookData - Thông tin đầu sách
 * @returns {Promise<object>} Đầu sách đã được lưu thành công
 */
const addBookCopies = async (bookTitleId, quantity, { viTriKe, ghiChu, session = null } = {}) => {
  if (!quantity || quantity <= 0) return [];

  const bookTitle = await BookTitle.findById(bookTitleId).session(session);
  if (!bookTitle || bookTitle.isDeleted || bookTitle.trangThai !== 'ACTIVE') {
    throw new Error('Không thể thêm bản sao cho đầu sách không tồn tại, đã xóa hoặc ngừng phục vụ');
  }

  const copies = [];
  for (let i = 0; i < quantity; i++) {
    copies.push(new BookCopy({
      maSach: await nextCode('bookCopy'),
      dauSach: bookTitle._id,
      viTriKe: viTriKe || config.app.defaultShelfLocation,
      tinhTrang: 'CHO_MUON',
      ghiChu: ghiChu || 'Khởi tạo tự động từ seeding đầu sách'
    }));
  }

  for (const copy of copies) {
    await copy.save({ session });
  }

  return copies;
};

const createBookTitle = async (bookData) => withTransactionFallback(async (session) => {
    // 1. Phân giải tác giả, nhà xuất bản, thể loại (lookup hoặc tạo mới)
    const [publisherId, categoryId, authorIds] = await Promise.all([
      resolvePublisher(bookData.nhaXuatBan, session),
      resolveCategory(bookData.theLoai, session),
      resolveAuthors(bookData.tacGia, session)
    ]);

    // 2. Sinh mã đầu sách tự động
    const maDauSach = await nextCode('bookTitle');

    // 3. Tạo đầu sách BookTitle
    const totalQty = bookData.tongSoLuong || 0;
    const bookTitle = new BookTitle({
      _id: maDauSach,
      maDauSach,
      tenSach: bookData.tenSach.trim(),
      tacGia: authorIds,
      nhaXuatBan: publisherId,
      theLoai: categoryId,
      namSanXuat: bookData.namSanXuat,
      tongSoLuong: 0,
      soLuongDangQuanLy: 0,
      soLuongKhaDung: 0,
      giaBia: bookData.giaBia || 0,
      hinhAnh: bookData.hinhAnh || '',
      viTriKe: bookData.viTriKe || 'KE-A1',
      soLuotMuon: bookData.soLuotMuon || 0,
      rating: bookData.rating !== undefined ? bookData.rating : 5.0,
      soLuotDanhGia: bookData.soLuotDanhGia || 0,
      moTa: bookData.moTa || '',
      trangThai: 'ACTIVE',
      isDeleted: false
    });

    await bookTitle.save({ session });

    // 4. Tự động sinh các bản sao vật lý BookCopy tương ứng
    if (totalQty > 0) {
      await addBookCopies(bookTitle._id, totalQty, {
        viTriKe: bookData.viTriKe,
        ghiChu: 'Khởi tạo tự động từ seeding đầu sách',
        session
      });
    }

    return BookTitle.findById(bookTitle._id).session(session);
});
/**
 * Xóa mềm / Ngừng phục vụ Đầu Sách theo Drain Strategy (guideline.md §3.1 điểm 5-6)
 * - Nếu còn sách đang mượn → chỉ chuyển trangThai sang DISCONTINUED (drain), thu hồi bản sao rảnh
 * - Nếu không còn sách đang mượn → xóa mềm isDeleted = true, thu hồi toàn bộ bản sao
 */
const softDeleteBookTitle = async (bookTitleId) => withTransactionFallback(async (session) => {
  const book = await BookTitle.findById(bookTitleId).session(session);
  if (!book || book.isDeleted) throw new Error('Đầu sách không tồn tại hoặc đã bị xóa');

  // Lấy danh sách ID các bản sao của đầu sách này (kể cả đã bị xóa mềm trước đó)
  const copies = await BookCopy.find({ dauSach: book._id }).session(session);
  const copyIds = copies.map(c => c._id);

  // Kiểm tra xem các bản sao này đã từng được mượn trong phiếu mượn nào chưa
  const BorrowReceipt = mongoose.model('BorrowReceipt');
  const hasBeenBorrowed = await BorrowReceipt.exists({
    'chiTietMuon.sach': { $in: copyIds }
  }).session(session);

  if (!hasBeenBorrowed) {
    // Chưa từng được mượn -> Xóa cứng đầu sách và toàn bộ bản sao của nó khỏi CSDL
    await BookTitle.deleteOne({ _id: book._id }).session(session);
    await BookCopy.deleteMany({ dauSach: book._id }).session(session);
    return { message: 'Đã xóa cứng đầu sách và tất cả các bản sao khỏi cơ sở dữ liệu (do chưa từng được mượn).', trangThai: 'DELETED' };
  }

  // Nếu đã từng được mượn -> Tiếp tục kiểm tra xem có bản sao nào đang được mượn tại thời điểm hiện tại không
  const borrowedCopies = await BookCopy.countDocuments({
    dauSach: book._id, tinhTrang: 'DA_MUON', isDeleted: false
  }).session(session);

  if (borrowedCopies > 0) {
    // Drain strategy: ngừng phục vụ, thu hồi bản sao rảnh ngay
    book.trangThai = 'DISCONTINUED';
    await book.save({ session });

    // Thu hồi bản sao rảnh (CHO_MUON → BAO_TRI + soft delete)
    await BookCopy.updateMany(
      { dauSach: book._id, tinhTrang: 'CHO_MUON', isDeleted: false },
      { $set: { tinhTrang: 'BAO_TRI', isDeleted: true, deletedAt: new Date() } }
    ).session(session);

    return { message: `Đã ngừng phục vụ đầu sách. Còn ${borrowedCopies} bản sao đang mượn sẽ thu hồi khi trả.`, trangThai: 'DISCONTINUED' };
  }

  // Không còn sách đang mượn -> xóa mềm hoàn toàn
  book.isDeleted = true;
  book.deletedAt = new Date();
  book.trangThai = 'DISCONTINUED';
  await book.save({ session });

  // Thu hồi toàn bộ bản sao
  await BookCopy.updateMany(
    { dauSach: book._id, isDeleted: false },
    { $set: { tinhTrang: 'BAO_TRI', isDeleted: true, deletedAt: new Date() } }
  ).session(session);

  return { message: 'Đã xóa mềm đầu sách và thu hồi toàn bộ bản sao.', trangThai: 'DELETED' };
});

module.exports = { createBookTitle, addBookCopies, softDeleteBookTitle };
