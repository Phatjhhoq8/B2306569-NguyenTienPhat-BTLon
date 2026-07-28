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
 * Lấy danh sách Thể Loại Sách (Chỉ lấy các thể loại thực sự có đầu sách đang hoạt động)
 */
const getCategories = async (req, res, next) => {
  try {
    const usedCategoryIds = await BookTitle.distinct('theLoai', { isDeleted: false });
    const categories = await Category.find({ _id: { $in: usedCategoryIds } });
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
    const { q, category, author, publisher, status, page = 1, limit = 10 } = req.query;
    const filter = { isDeleted: false };
    if (q) {
      filter.$or = [
        { tenSach: { $regex: String(q), $options: 'i' } },
        { maDauSach: { $regex: String(q), $options: 'i' } }
      ];
    }
    if (category) filter.theLoai = category;
    if (author) filter.tacGia = author;
    if (publisher) filter.nhaXuatBan = publisher;
    if (status) filter.trangThai = status;

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

    // Tính toán số lượt mượn thực tế từ các phiếu mượn đã được duyệt (không tính CHO_DUYET và HUY)
    const mongoose = require('mongoose');
    const copiesIds = copies.map(c => c._id);
    const actualBorrowCount = await mongoose.model('BorrowReceipt').countDocuments({
      'chiTietMuon.sach': { $in: copiesIds },
      trangThai: { $nin: ['CHO_DUYET', 'HUY'] }
    });

    if (book.soLuotMuon !== actualBorrowCount) {
      book.soLuotMuon = actualBorrowCount;
      await book.save();
    }

    const authorIds = book.tacGia ? book.tacGia.map(t => t._id || t) : [];
    let relatedBooks = [];
    
    // 1. Ưu tiên sách của cùng tác giả (loại trừ sách hiện tại, giới hạn 10 cuốn)
    if (authorIds.length > 0) {
      relatedBooks = await BookTitle.find({
        tacGia: { $in: authorIds },
        _id: { $ne: book._id },
        isDeleted: false,
        trangThai: 'ACTIVE'
      }).populate('tacGia').limit(10);
    }

    // 2. Nếu không đủ 10 cuốn, lấy thêm sách cùng thể loại
    if (relatedBooks.length < 10) {
      const excludedIds = [book._id, ...relatedBooks.map(b => b._id)];
      const categoryRelated = await BookTitle.find({
        theLoai: book.theLoai?._id || book.theLoai,
        _id: { $nin: excludedIds },
        isDeleted: false,
        trangThai: 'ACTIVE'
      }).populate('tacGia').limit(10 - relatedBooks.length);
      relatedBooks = [...relatedBooks, ...categoryRelated];
    }

    // 3. Nếu vẫn không đủ 10 cuốn, lấy thêm các sách nổi bật khác
    if (relatedBooks.length < 10) {
      const excludedIds = [book._id, ...relatedBooks.map(b => b._id)];
      const extraBooks = await BookTitle.find({
        _id: { $nin: excludedIds },
        isDeleted: false,
        trangThai: 'ACTIVE'
      }).populate('tacGia').limit(10 - relatedBooks.length);
      relatedBooks = [...relatedBooks, ...extraBooks];
    }

    return resultResponse.ok(res, { book, copies, relatedBooks });
  } catch (error) { next(error); }
};

/**
 * Cập nhật thông tin đầu sách (Staff only)
 */
const updateBookTitle = async (req, res, next) => {
  try {
    const book = await BookTitle.findById(req.params.id);
    if (!book || book.isDeleted) return resultResponse.err(res, 'Đầu sách không tồn tại', 404);

    const oldStatus = book.trangThai;
    const allowedUpdates = ['tenSach', 'namSanXuat', 'giaBia', 'hinhAnh', 'moTa', 'tuKhoa', 'trangThai'];
    allowedUpdates.forEach((f) => { if (req.body[f] !== undefined) book[f] = req.body[f]; });

    // Nếu khôi phục trạng thái từ DISCONTINUED -> ACTIVE (Mở lại phục vụ)
    if (oldStatus === 'DISCONTINUED' && book.trangThai === 'ACTIVE') {
      // Khôi phục các bản sao trước đó bị thu hồi (BAO_TRI / isDeleted)
      await BookCopy.updateMany(
        { dauSach: book._id, tinhTrang: 'BAO_TRI', isDeleted: true },
        { $set: { tinhTrang: 'CHO_MUON', isDeleted: false, deletedAt: null } }
      );
    }

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

    // Kiểm tra xem bản sao này đã từng được mượn trong phiếu mượn nào chưa
    const mongoose = require('mongoose');
    const BorrowReceipt = mongoose.model('BorrowReceipt');
    const hasBeenBorrowed = await BorrowReceipt.exists({
      'chiTietMuon.sach': copy._id
    });

    if (!hasBeenBorrowed) {
      // Chưa từng được mượn -> Xóa cứng bản sao khỏi CSDL
      await BookCopy.deleteOne({ _id: copy._id });
      return resultResponse.ok(res, { message: 'Đã xóa cứng bản sao thành công (do chưa từng được mượn)' });
    }

    // Đã từng được mượn -> Xóa mềm bản sao
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

/**
 * Thêm / cập nhật đánh giá và bình luận cho đầu sách
 */
const addBookReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { soSao, noiDung } = req.body;

    if (soSao === undefined || soSao === null) {
      return resultResponse.err(res, 'Số sao đánh giá là bắt buộc', 400);
    }

    const ratingNum = parseInt(soSao, 10);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return resultResponse.err(res, 'Số sao phải từ 1 đến 5', 400);
    }

    const book = await BookTitle.findById(id);
    if (!book || book.isDeleted) {
      return resultResponse.err(res, 'Đầu sách không tồn tại hoặc đã bị xóa', 404);
    }

    if (!book.binhLuan) {
      book.binhLuan = [];
    }

    const readerFullName = `${req.user.hoLot || ''} ${req.user.ten || ''}`.trim() || 'Độc giả';
    const existingReviewIdx = book.binhLuan.findIndex(r => r.docGia?.toString() === req.user._id?.toString());

    if (existingReviewIdx > -1) {
      // Cập nhật đánh giá cũ
      book.binhLuan[existingReviewIdx].soSao = ratingNum;
      book.binhLuan[existingReviewIdx].noiDung = noiDung || '';
      book.binhLuan[existingReviewIdx].hoTen = readerFullName; // Cập nhật luôn họ tên chính xác
      book.binhLuan[existingReviewIdx].ngayTao = new Date();
    } else {
      // Thêm đánh giá mới
      book.binhLuan.push({
        docGia: req.user._id,
        hoTen: readerFullName,
        soSao: ratingNum,
        noiDung: noiDung || ''
      });
    }

    // Tính toán lại rating trung bình và tổng số lượt đánh giá
    const totalReviews = book.binhLuan.length;
    const sumStars = book.binhLuan.reduce((sum, r) => sum + r.soSao, 0);
    book.rating = parseFloat((sumStars / totalReviews).toFixed(1));
    book.soLuotDanhGia = totalReviews;

    await book.save();

    return resultResponse.ok(res, {
      rating: book.rating,
      soLuotDanhGia: book.soLuotDanhGia,
      binhLuan: book.binhLuan
    }, 200, 'Đánh giá sách thành công');
  } catch (error) {
    next(error);
  }
};

const deleteBookReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const book = await BookTitle.findById(id);
    if (!book || book.isDeleted) {
      return resultResponse.err(res, 'Đầu sách không tồn tại hoặc đã bị xóa', 404);
    }

    if (!book.binhLuan) {
      book.binhLuan = [];
    }

    const reviewIdx = book.binhLuan.findIndex(r => r.docGia?.toString() === req.user._id?.toString());
    if (reviewIdx === -1) {
      return resultResponse.err(res, 'Bạn chưa đánh giá cuốn sách này', 400);
    }

    // Xóa đánh giá khỏi mảng
    book.binhLuan.splice(reviewIdx, 1);

    // Tính toán lại rating trung bình và tổng số lượt đánh giá
    const totalReviews = book.binhLuan.length;
    if (totalReviews === 0) {
      book.rating = 0;
      book.soLuotDanhGia = 0;
    } else {
      const sumStars = book.binhLuan.reduce((sum, r) => sum + r.soSao, 0);
      book.rating = parseFloat((sumStars / totalReviews).toFixed(1));
      book.soLuotDanhGia = totalReviews;
    }

    await book.save();

    return resultResponse.ok(res, {
      rating: book.rating,
      soLuotDanhGia: book.soLuotDanhGia,
      binhLuan: book.binhLuan
    }, 200, 'Xóa đánh giá thành công');
  } catch (error) {
    next(error);
  }
};


const toggleLikeBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const book = await BookTitle.findById(id);
    if (!book || book.isDeleted) {
      return resultResponse.err(res, 'Đầu sách không tồn tại hoặc đã bị xóa', 404);
    }

    if (!book.yeuThich) {
      book.yeuThich = [];
    }

    const readerId = req.user._id;
    const idx = book.yeuThich.indexOf(readerId);
    let isLiked = false;

    if (idx > -1) {
      // Đã thích -> Bỏ thích
      book.yeuThich.splice(idx, 1);
    } else {
      // Chưa thích -> Thích
      book.yeuThich.push(readerId);
      isLiked = true;
    }

    await book.save();

    return resultResponse.ok(res, {
      isLiked,
      likesCount: book.yeuThich.length,
      yeuThich: book.yeuThich
    }, 200, isLiked ? 'Đã thích sách thành công' : 'Đã bỏ thích sách thành công');
  } catch (error) {
    next(error);
  }
};

const getSearchSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return resultResponse.ok(res, []);
    }
    const keyword = q.trim();
    const regex = new RegExp(keyword, 'i');

    const [books, authors, publishers] = await Promise.all([
      BookTitle.find({ tenSach: regex, isDeleted: false }).limit(5).select('tenSach maDauSach'),
      Author.find({ tenTacGia: regex }).limit(3).select('tenTacGia'),
      Publisher.find({ tenNXB: regex }).limit(3).select('tenNXB')
    ]);

    const suggestions = [];
    books.forEach(b => suggestions.push({ type: 'book', text: b.tenSach, id: b._id, code: b.maDauSach }));
    authors.forEach(a => suggestions.push({ type: 'author', text: a.tenTacGia, id: a._id }));
    publishers.forEach(p => suggestions.push({ type: 'publisher', text: p.tenNXB, id: p._id }));

    return resultResponse.ok(res, suggestions.slice(0, 10));
  } catch (error) {
    next(error);
  }
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
  addBookReview,
  deleteBookReview,
  toggleLikeBook,
  getSearchSuggestions,
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
