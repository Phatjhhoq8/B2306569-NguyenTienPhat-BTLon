/**
 * Chức năng: Kịch bản kiểm thử TDD cho Module Books & Catalog
 * Lý do tạo: Thực hiện nguyên lý Test-First (TDD) bằng HTTP Server thật trước khi xây dựng API Books
 * Link trích dẫn: https://nodejs.org/api/test.html
 */

const test = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const http = require('http');
const { connectDatabase } = require('../config/database');
const { Publisher, Author, Category, BookTitle, BookCopy, Staff } = require('../models');
const app = require('../app');
const jwtHelper = require('../utils/jwtHelper');

let server;
let baseUrl;
let staffCookie = '';

// Helper thực hiện cuộc gọi API thực tế qua fetch
const makeRequest = async (path, options = {}) => {
  const url = `${baseUrl}${path}`;
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const headers = {};
  response.headers.forEach((value, name) => {
    headers[name] = value;
  });

  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch (e) {
    body = text;
  }

  return {
    status: response.status,
    headers,
    body
  };
};

test.describe('Books & Catalog API Tests', () => {

  test.before(async () => {
    await connectDatabase();
    
    // Khởi chạy HTTP Server trên cổng ngẫu nhiên (cổng 0)
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;

    // Clear dữ liệu test
    await Promise.all([
      Publisher.deleteMany({}),
      Author.deleteMany({}),
      Category.deleteMany({}),
      BookTitle.deleteMany({}),
      BookCopy.deleteMany({}),
      Staff.deleteMany({})
    ]);

    // Tạo tài khoản Staff quản lý để giả lập quyền admin
    const staff = await Staff.create({
      hoTenNV: 'Quản lý sách TDD',
      matKhau: 'admin123',
      chucVu: 'QUAN_LY',
      diachi: 'Hồ Chí Minh',
      soDienThoai: '0977777777'
    });

    const token = jwtHelper.signToken({ id: staff._id, role: 'STAFF', chucVu: 'QUAN_LY' });
    staffCookie = `token=${token}`;
  });

  test.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.close();
  });

  test.describe('1. CRUD Category Tests', () => {
    let createdCategory;

    test('Staff nên tạo Category mới thành công', async () => {
      const payload = {
        tenTheLoai: 'Văn học Việt Nam',
        moTa: 'Các tác phẩm văn học Việt Nam'
      };

      const res = await makeRequest('/api/categories', {
        method: 'POST',
        headers: { Cookie: staffCookie },
        body: payload
      });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.maTheLoai);
      assert.strictEqual(res.body.data.tenTheLoai, payload.tenTheLoai);
      createdCategory = res.body.data;
    });

    test('Khách không thể tạo Category mới', async () => {
      const res = await makeRequest('/api/categories', {
        method: 'POST',
        body: { tenTheLoai: 'Trộm cắp' }
      });
      assert.strictEqual(res.status, 401);
    });

    test('Nên lấy danh sách Categories thành công', async () => {
      const res = await makeRequest('/api/categories');
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.data.length > 0);
    });
  });

  test.describe('2. BookTitle & Search Catalog Tests', () => {
    let category;
    let author;
    let publisher;
    let createdBook;

    test.before(async () => {
      // Tạo dữ liệu nền bằng DB query
      category = await Category.create({ tenTheLoai: 'Kịch', moTa: 'Kịch nói' });
      author = await Author.create({ tenTacGia: 'Nguyễn Huy Tưởng' });
      publisher = await Publisher.create({ tenNXB: 'NXB Kim Đồng', soDienThoai: '0912345678' });
    });

    test('Staff nên tạo Đầu sách BookTitle và tự động sinh bản sao vật lý thành công', async () => {
      const payload = {
        tenSach: 'Vũ Như Tô',
        tacGia: [author._id],
        nhaXuatBan: publisher._id,
        theLoai: category._id,
        namSanXuat: 1941,
        giaBia: 50000,
        tongSoLuong: 3
      };

      const res = await makeRequest('/api/books', {
        method: 'POST',
        headers: { Cookie: staffCookie },
        body: payload
      });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.maDauSach);
      assert.strictEqual(res.body.data.tenSach, payload.tenSach);
      createdBook = res.body.data;

      // Kiểm tra trong DB xem 3 bản sao có được sinh tự động
      const copiesCount = await BookCopy.countDocuments({ dauSach: createdBook._id });
      assert.strictEqual(copiesCount, 3, 'Phải tự sinh 3 bản sao vật lý');
    });

    test('Nên tìm kiếm phân trang đầu sách thành công', async () => {
      const res = await makeRequest('/api/books?q=Vũ Như Tô');
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.body.data.books));
      assert.strictEqual(res.body.data.books[0].tenSach, 'Vũ Như Tô');
      assert.ok(res.body.data.totalCount >= 1);
    });

    test('Nên lấy chi tiết đầu sách thành công', async () => {
      const res = await makeRequest(`/api/books/${createdBook._id}`);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.book.tenSach, 'Vũ Như Tô');
      assert.ok(Array.isArray(res.body.data.copies));
    });
  });

});
