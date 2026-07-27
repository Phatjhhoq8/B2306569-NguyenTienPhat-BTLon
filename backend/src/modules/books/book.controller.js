/**
 * Chức năng: Controller quản lý các request liên quan đến Sách và Danh mục
 * Lý do tạo: Tiếp nhận request từ router, gọi các Mongoose query hoặc book service nghiệp vụ và phản hồi JSON
 */

const BookTitle = require('./bookTitle.model');
const BookCopy = require('./bookCopy.model');
const Category = require('./category.model');
const Publisher = require('./publisher.model');
const Author = require('./author.model');
const bookService = require('./book.service');
const resultResponse = require('../../utils/resultResponse');

/**
 * Tạo mới Thể Loại Sách
 */
const createCategory = async (req, res, next) => {
  try {
    const { tenTheLoai, moTa } = req.body;
    if (!tenTheLoai) {
      return resultResponse.err(res, 'Tên thể loại là bắt buộc', 400);
    }

    const category = new Category({ tenTheLoai, moTa });
    await category.save();

    return resultResponse.ok(res, category, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy danh sách Thể Loại Sách
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({});
    return resultResponse.ok(res, categories);
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return resultResponse.err(res, 'Không tìm thấy thể loại', 404);
    if (req.body.tenTheLoai !== undefined) category.tenTheLoai = req.body.tenTheLoai;
    if (req.body.moTa !== undefined) category.moTa = req.body.moTa;
    await category.save();
    return resultResponse.ok(res, category);
  } catch (error) { next(error); }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return resultResponse.err(res, 'Không tìm thấy thể loại', 404);

    const usedCount = await BookTitle.countDocuments({ theLoai: category._id, isDeleted: false });
    if (usedCount > 0) {
      return resultResponse.err(res, 'Không thể xóa thể loại đang được sử dụng bởi đầu sách', 400);
    }

    await Category.deleteOne({ _id: category._id });
    return resultResponse.ok(res, { message: 'Đã xóa thể loại thành công' });
  } catch (error) { next(error); }
};

/**
 * Tạo mới Đầu Sách BookTitle (tự động tạo BookCopy)
 */
const createBookTitle = async (req, res, next) => {
  try {
    const { tenSach, tacGia, nhaXuatBan, theLoai, namSanXuat, giaBia, tongSoLuong, hinhAnh, viTriKe } = req.body;

    if (!tenSach || !tacGia || !nhaXuatBan || !theLoai) {
      return resultResponse.err(res, 'Thiếu thông tin bắt buộc để tạo đầu sách', 400);
    }

    const bookTitle = await bookService.createBookTitle({
      tenSach,
      tacGia,
      nhaXuatBan,
      theLoai,
      namSanXuat,
      giaBia,
      tongSoLuong,
      hinhAnh,
      viTriKe
    });

    return resultResponse.ok(res, bookTitle, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Tra cứu danh sách đầu sách (phân trang, tìm kiếm)
 */
/**
 * Tra cứu danh sách đầu sách (phân trang, tìm kiếm) — có totalCount
 */
const getBooks = async (req, res, next) => {
  try {
    const { q, category, page = 1, limit = 10 } = req.query;
    const filter = { isDeleted: false };
    if (q) filter.tenSach = { $regex: String(q), $options: 'i' };
    if (category) filter.theLoai = category;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [books, totalCount] = await Promise.all([
      BookTitle.find(filter).populate('tacGia').populate('nhaXuatBan').populate('theLoai').skip(skip).limit(parseInt(limit, 10)),
      BookTitle.countDocuments(filter)
    ]);

    return resultResponse.ok(res, { books, totalCount, page: parseInt(page, 10), limit: parseInt(limit, 10) });
  } catch (error) { next(error); }
};

/**
 * Lấy chi tiết đầu sách
 */
const getBookById = async (req, res, next) => {
  try {
    const book = await BookTitle.findById(req.params.id).populate('tacGia').populate('nhaXuatBan').populate('theLoai');
    if (!book || book.isDeleted) return resultResponse.err(res, 'Đầu sách không tồn tại hoặc đã bị xóa', 404);
    // Lấy bản sao vật lý của đầu sách
    const copies = await BookCopy.find({ dauSach: book._id, isDeleted: false });
    return resultResponse.ok(res, { book, copies });
  } catch (error) { next(error); }
};

/**
 * Cập nhật thông tin đầu sách (Staff only)
 */
const updateBookTitle = async (req, res, next) => {
  try {
    const book = await BookTitle.findById(req.params.id);
    if (!book || book.isDeleted) return resultResponse.err(res, 'Đầu sách không tồn tại', 404);
    const allowedUpdates = ['tenSach', 'namSanXuat', 'giaBia', 'hinhAnh', 'moTa', 'tuKhoa'];
    allowedUpdates.forEach((f) => { if (req.body[f] !== undefined) book[f] = req.body[f]; });
    await book.save();
    return resultResponse.ok(res, book);
  } catch (error) { next(error); }
};

/**
 * Xóa mềm / Ngừng phục vụ đầu sách (Staff only) — sử dụng drain strategy qua service
 */
const softDeleteBookTitle = async (req, res, next) => {
  try {
    const result = await bookService.softDeleteBookTitle(req.params.id);
    return resultResponse.ok(res, result);
  } catch (error) { next(error); }
};

// ==================== BookCopy CRUD ====================

/**
 * Lấy danh sách bản sao của 1 đầu sách (Staff only)
 */
const getBookCopies = async (req, res, next) => {
  try {
    const copies = await BookCopy.find({ dauSach: req.params.bookId, isDeleted: false }).populate('dauSach');
    return resultResponse.ok(res, copies);
  } catch (error) { next(error); }
};

/**
 * Cập nhật tình trạng / vị trí kệ của bản sao (Staff only)
 */
const updateBookCopy = async (req, res, next) => {
  try {
    const copy = await BookCopy.findById(req.params.id);
    if (!copy || copy.isDeleted) return resultResponse.err(res, 'Bản sao không tồn tại', 404);
    if (copy.tinhTrang === 'DA_MUON') return resultResponse.err(res, 'Không thể cập nhật bản sao đang được mượn', 400);
    const allowedUpdates = ['viTriKe', 'tinhTrang'];
    allowedUpdates.forEach((f) => { if (req.body[f] !== undefined) copy[f] = req.body[f]; });
    await copy.save();
    return resultResponse.ok(res, copy);
  } catch (error) { next(error); }
};

/**
 * Xóa mềm bản sao sách (Staff only)
 */
const softDeleteBookCopy = async (req, res, next) => {
  try {
    const copy = await BookCopy.findById(req.params.id);
    if (!copy || copy.isDeleted) return resultResponse.err(res, 'Bản sao không tồn tại', 404);
    if (copy.tinhTrang === 'DA_MUON') return resultResponse.err(res, 'Không thể xóa bản sao đang được mượn', 400);
    copy.isDeleted = true;
    copy.deletedAt = new Date();
    await copy.save();
    return resultResponse.ok(res, { message: 'Đã xóa mềm bản sao thành công' });
  } catch (error) { next(error); }
};

// ==================== Author CRUD ====================

const getAuthors = async (req, res, next) => {
  try {
    const authors = await Author.find({}).sort({ tenTacGia: 1 });
    return resultResponse.ok(res, authors);
  } catch (error) { next(error); }
};

const createAuthor = async (req, res, next) => {
  try {
    if (!req.body.tenTacGia) return resultResponse.err(res, 'Tên tác giả là bắt buộc', 400);
    const author = await Author.create(req.body);
    return resultResponse.ok(res, author, 201);
  } catch (error) { next(error); }
};

const updateAuthor = async (req, res, next) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) return resultResponse.err(res, 'Không tìm thấy tác giả', 404);
    if (req.body.tenTacGia) author.tenTacGia = req.body.tenTacGia;
    if (req.body.moTa !== undefined) author.moTa = req.body.moTa;
    await author.save();
    return resultResponse.ok(res, author);
  } catch (error) { next(error); }
};

// ==================== Publisher CRUD ====================

const getPublishers = async (req, res, next) => {
  try {
    const publishers = await Publisher.find({}).sort({ tenNXB: 1 });
    return resultResponse.ok(res, publishers);
  } catch (error) { next(error); }
};

const createPublisher = async (req, res, next) => {
  try {
    if (!req.body.tenNXB || !req.body.soDienThoai) return resultResponse.err(res, 'Tên NXB và SĐT là bắt buộc', 400);
    const publisher = await Publisher.create(req.body);
    return resultResponse.ok(res, publisher, 201);
  } catch (error) { next(error); }
};

const updatePublisher = async (req, res, next) => {
  try {
    const publisher = await Publisher.findById(req.params.id);
    if (!publisher) return resultResponse.err(res, 'Không tìm thấy nhà xuất bản', 404);
    const allowedUpdates = ['tenNXB', 'soDienThoai', 'diaChi'];
    allowedUpdates.forEach((f) => { if (req.body[f] !== undefined) publisher[f] = req.body[f]; });
    await publisher.save();
    return resultResponse.ok(res, publisher);
  } catch (error) { next(error); }
};

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  createBookTitle,
  getBooks,
  getBookById,
  updateBookTitle,
  softDeleteBookTitle,
  // BookCopy
  getBookCopies,
  updateBookCopy,
  softDeleteBookCopy,
  // Author
  getAuthors,
  createAuthor,
  updateAuthor,
  // Publisher
  getPublishers,
  createPublisher,
  updatePublisher
};
