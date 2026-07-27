/**
 * Chức năng: Kịch bản kiểm thử TDD cho Module Memberships
 * Lý do tạo: Thực hiện nguyên lý Test-First (TDD) bằng HTTP Server thật trước khi xây dựng API Memberships
 * Link trích dẫn: https://nodejs.org/api/test.html
 */

const test = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const http = require('http');
const { connectDatabase } = require('../config/database');
const { Reader, Staff, MembershipPlan, Subscription } = require('../models');
const app = require('../app');
const jwtHelper = require('../utils/jwtHelper');

let server;
let baseUrl;
let readerCookie = '';
let staffCookie = '';
let testPlanId;

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

test.describe('Memberships API Tests', () => {

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
      MembershipPlan.deleteMany({}),
      Subscription.deleteMany({})
    ]);

    // 1. Tạo gói độc giả mặc định
    const plan = await MembershipPlan.create({
      tenGoi: 'Đọc Tiêu Chuẩn',
      giaTien: 0,
      soNgayHieuLuc: 365,
      soSachToiDa: 3,
      soNgayMuonToiDa: 14,
      mienTienCoc: false
    });
    testPlanId = plan._id;

    // 2. Tạo độc giả
    const reader = await Reader.create({
      hoLot: 'Nguyễn',
      ten: 'Membership Reader',
      email: 'tdd.member@library.local',
      matKhau: 'reader123',
      ngaySinh: new Date('1998-08-08'),
      diachi: 'Đà Lạt',
      dienThoai: '0944555555'
    });

    const readerToken = jwtHelper.signToken({ id: reader._id, role: 'READER' });
    readerCookie = `token=${readerToken}`;

    // 3. Tạo Staff có quyền QUAN_LY
    const staff = await Staff.create({
      hoTenNV: 'Quản lý Hội viên',
      matKhau: 'admin123',
      chucVu: 'QUAN_LY',
      diachi: 'Hà Nội',
      soDienThoai: '0933333333'
    });

    const staffToken = jwtHelper.signToken({ id: staff._id, role: 'STAFF', chucVu: 'QUAN_LY' });
    staffCookie = `token=${staffToken}`;
  });

  test.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.close();
  });

  test.describe('1. Membership Plans & Subscribing Tests', () => {
    test('Nên lấy danh sách gói hội viên thành công', async () => {
      const res = await makeRequest('/api/memberships/plans');
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.body.data));
      assert.strictEqual(res.body.data[0].tenGoi, 'Đọc Tiêu Chuẩn');
    });

    test('Độc giả nên đăng ký gói hội viên thành công', async () => {
      const payload = {
        goiId: testPlanId
      };

      const res = await makeRequest('/api/memberships/subscribe', {
        method: 'POST',
        headers: { Cookie: readerCookie },
        body: payload
      });

      assert.strictEqual(res.status, 201, 'Đăng ký gói thành công phải trả về 201');
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.maDangKy);
      assert.strictEqual(res.body.data.trangThai, 'DANG_HIEU_LUC');
    });
  });

});
