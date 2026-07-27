/**
 * Chức năng: Kịch bản kiểm thử TDD cho Module Discounts
 * Lý do tạo: Thực hiện nguyên lý Test-First (TDD) bằng HTTP Server thật trước khi xây dựng API Discounts
 * Link trích dẫn: https://nodejs.org/api/test.html
 */

const test = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const http = require('http');
const { connectDatabase } = require('../config/database');
const { Reader, Staff, DiscountCode } = require('../models');
const app = require('../app');
const jwtHelper = require('../utils/jwtHelper');

let server;
let baseUrl;
let readerCookie = '';
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

test.describe('Discounts API Tests', () => {

  test.before(async () => {
    await connectDatabase();
    
    // Khởi chạy HTTP Server trên cổng ngẫu nhiên (cổng 0)
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;

    // Clear dữ liệu test
    await Promise.all([
      Reader.deleteMany({}),
      Staff.deleteMany({}),
      DiscountCode.deleteMany({})
    ]);

    // 1. Tạo độc giả và cookie
    const reader = await Reader.create({
      hoLot: 'Lê',
      ten: 'Discount Reader',
      email: 'tdd.discount@library.local',
      matKhau: 'reader123',
      ngaySinh: new Date('1997-07-07'),
      diachi: 'Nha Trang',
      dienThoai: '0933444555'
    });

    const readerToken = jwtHelper.signToken({ id: reader._id, role: 'READER' });
    readerCookie = `token=${readerToken}`;

    // 2. Tạo Staff quản lý và cookie
    const staff = await Staff.create({
      hoTenNV: 'Quản lý Khuyến mãi',
      matKhau: 'admin123',
      chucVu: 'QUAN_LY',
      diachi: 'Đà Nẵng',
      soDienThoai: '0922222222'
    });

    const staffToken = jwtHelper.signToken({ id: staff._id, role: 'STAFF', chucVu: 'QUAN_LY' });
    staffCookie = `token=${staffToken}`;
  });

  test.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.close();
  });

  test.describe('1. CRUD Discount Codes Tests', () => {
    let createdDiscount;

    test('Staff nên tạo mã giảm giá mới thành công', async () => {
      const payload = {
        tenKhuyenMai: 'Khuyến mãi hè 2026',
        giaTriGiam: 20000,
        giaTriDonToiThieu: 50000,
        ngayBatDau: new Date(Date.now() - 24 * 60 * 60 * 1000), // ngày hôm qua (đã bắt đầu)
        ngayKetThuc: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 ngày tới
        soLuongMaToiDa: 100
      };

      const res = await makeRequest('/api/discounts', {
        method: 'POST',
        headers: { Cookie: staffCookie },
        body: payload
      });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.maCode);
      assert.strictEqual(res.body.data.tenKhuyenMai, payload.tenKhuyenMai);
      createdDiscount = res.body.data;
    });

    test('Độc giả nên kiểm tra mã giảm giá hợp lệ thành công', async () => {
      const res = await makeRequest('/api/discounts/validate', {
        method: 'POST',
        headers: { Cookie: readerCookie },
        body: {
          code: createdDiscount.maCode,
          orderAmount: 60000
        }
      });

      assert.strictEqual(res.status, 200, 'Kiểm tra mã thành công phải trả về 200');
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.discountAmount, 20000);
      assert.strictEqual(res.body.data.finalAmount, 40000);
    });
  });

});
