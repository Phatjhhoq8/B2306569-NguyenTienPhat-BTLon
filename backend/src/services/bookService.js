/**
 * Chức năng: Service quản lý Đầu Sách (BookTitle) và Cuốn Sách Vật Lý (BookCopy)
 * Lý do tạo: Tự động hóa việc map thông tin danh mục (tác giả, NXB, thể loại) và tự động tạo bản sao vật lý
 */

const mongoose = require('mongoose');
const config = require('../config');
const { BookTitle, BookCopy, Publisher, Author, Category } = require('../models');
const { nextCode } = require('./codeService');

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

  // Tìm theo tên
  const name = String(categoryInput).trim();
  let category = await Category.findOne({ tenTheLoai: name }).session(session);
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
      soLuotMuon: bookData.soLuotMuon || 0,
      rating: bookData.rating !== undefined ? bookData.rating : 5.0,
      soLuotDanhGia: bookData.soLuotDanhGia || 0,
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

module.exports = { createBookTitle, addBookCopies };
