/**
 * Chức năng: Kịch bản kiểm thử TDD cho Module System Settings
 * Lý do tạo: Thực hiện nguyên lý Test-First (TDD) bằng HTTP Server thật trước khi đưa API cài đặt vào tích hợp
 * Link trích dẫn: https://nodejs.org/api/test.html
 */

const test = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const http = require('http');
const { connectDatabase } = require('../config/database');
const { Reader, Staff, SystemSetting } = require('../models');
const app = require('../app');
const jwtHelper = require('../utils/jwtHelper');

let server;
let baseUrl;
let readerCookie = '';
let staffCookie = '';

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

test.before(async () => {
  await connectDatabase();
  
  // Khởi động server HTTP thử nghiệm ngẫu nhiên port
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  baseUrl = `http://localhost:${port}`;

  // Làm sạch bảng cấu hình
  await SystemSetting.deleteMany({});
  await Staff.deleteMany({ hoTenNV: 'Thủ thư test' });
  await Reader.deleteMany({ dienThoai: '0911223344' });

  // Tạo tài khoản mẫu để sinh token/cookie kiểm tra phân quyền
  const uniqueId = Date.now();
  
  const staff = await Staff.create({
    hoTenNV: 'Thủ thư test',
    matKhau: 'admin123',
    chucVu: 'THU_THU',
    diachi: 'Cần Thơ',
    soDienThoai: '0912345678'
  });
  const staffToken = jwtHelper.signToken({ id: staff._id, role: 'STAFF', chucVu: staff.chucVu });
  staffCookie = `token=${staffToken}`;

  const reader = await Reader.create({
    hoLot: 'Độc giả',
    ten: 'Test',
    email: `reader.${uniqueId}@library.local`,
    matKhau: 'reader123',
    ngaySinh: new Date('2000-01-01'),
    gioiTinh: 'NAM',
    diachi: 'Cần Thơ',
    dienThoai: '0911223344'
  });
  const readerToken = jwtHelper.signToken({ id: reader._id, role: 'READER' });
  readerCookie = `token=${readerToken}`;
});

test.after(async () => {
  await SystemSetting.deleteMany({});
  await new Promise((resolve) => server.close(resolve));
});

test('Settings Module: API Tests', async (t) => {
  await t.test('1. Lấy cấu hình mặc định (homepage) khi chưa có trong DB', async () => {
    const res = await makeRequest('/api/settings/homepage');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.heroTitle, "KHÁM PHÁ THẾ GIỚI TRI THỨC TẠI CTU");
  });

  await t.test('2. Cập nhật cấu hình thất bại nếu không có token xác thực', async () => {
    const res = await makeRequest('/api/settings/homepage', {
      method: 'PUT',
      body: {
        value: {
          heroTitle: "TIÊU ĐỀ MỚI TEST",
          heroSubtitle: "Mô tả mới"
        }
      }
    });
    assert.strictEqual(res.status, 401);
  });

  await t.test('3. Cập nhật cấu hình thất bại nếu là READER', async () => {
    const res = await makeRequest('/api/settings/homepage', {
      method: 'PUT',
      headers: {
        'Cookie': readerCookie
      },
      body: {
        value: {
          heroTitle: "TIÊU ĐỀ MỚI TEST",
          heroSubtitle: "Mô tả mới"
        }
      }
    });
    assert.strictEqual(res.status, 403);
  });

  await t.test('4. Cập nhật cấu hình THÀNH CÔNG nếu là STAFF', async () => {
    const newHeroTitle = "TIÊU ĐỀ ĐÃ ĐƯỢC CHỈNH SỬA";
    const res = await makeRequest('/api/settings/homepage', {
      method: 'PUT',
      headers: {
        'Cookie': staffCookie
      },
      body: {
        value: {
          heroTitle: newHeroTitle,
          heroSubtitle: "Mô tả mới tinh",
          heroBanner: "/new_banner.png",
          step1Title: "Bước 1",
          step1Desc: "Chi tiết 1",
          step2Title: "Bước 2",
          step2Desc: "Chi tiết 2",
          step3Title: "Bước 3",
          step3Desc: "Chi tiết 3",
          step4Title: "Bước 4",
          step4Desc: "Chi tiết 4"
        }
      }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.heroTitle, newHeroTitle);

    // Truy vấn lại để xác minh đã lưu DB
    const getRes = await makeRequest('/api/settings/homepage');
    assert.strictEqual(getRes.status, 200);
    assert.strictEqual(getRes.body.data.heroTitle, newHeroTitle);
  });
});
