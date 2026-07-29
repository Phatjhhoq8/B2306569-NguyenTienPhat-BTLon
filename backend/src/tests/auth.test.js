/**
 * Chức năng: Kịch bản kiểm thử TDD cho Module Auth & Users
 * Lý do tạo: Thực hiện nguyên lý Test-First (TDD) bằng HTTP Server thật trên cổng ngẫu nhiên
 * Link trích dẫn: https://nodejs.org/api/test.html
 */

const test = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const http = require('http');
const { connectDatabase } = require('../config/database');
const { Reader, Staff } = require('../models');
const app = require('../app');

let server;
let baseUrl;

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

test.describe('Auth & Users API Tests', () => {

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
      Staff.deleteMany({})
    ]);
  });

  test.after(async () => {
    // Đóng server và kết nối DB
    await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.close();
  });

  test.describe('1. Reader Auth Tests', () => {
    test('Nên đăng ký Độc giả mới thành công', async () => {
      const payload = {
        hoLot: 'Nguyễn Văn',
        ten: 'TDD Reader',
        email: 'tdd.reader@library.local',
        matKhau: 'reader123',
        ngaySinh: '2000-01-01',
        diachi: 'Hà Nội',
        dienThoai: '0988888888',
        gioiTinh: 'NAM'
      };

      const res = await makeRequest('/api/auth/reader/register', {
        method: 'POST',
        body: payload
      });

      assert.strictEqual(res.status, 201, 'Đăng ký thành công phải trả về 201');
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.maDocGia, 'Phải tự sinh maDocGia');
      assert.strictEqual(res.body.data.email, payload.email);
    });

    test('Không cho phép đăng ký trùng email', async () => {
      const payload = {
        hoLot: 'Nguyễn Văn',
        ten: 'TDD Reader 2',
        email: 'tdd.reader@library.local', // trùng email
        matKhau: 'reader123',
        ngaySinh: '2000-01-01',
        diachi: 'Hà Nội',
        dienThoai: '0977777777', // SĐT khác
        gioiTinh: 'NAM'
      };

      const res = await makeRequest('/api/auth/reader/register', {
        method: 'POST',
        body: payload
      });

      assert.strictEqual(res.status, 409, 'Trùng email phải trả về 409 (Conflict)');
      assert.strictEqual(res.body.success, false);
    });

    test('Nên đăng nhập Độc giả thành công và trả về cookie token', async () => {
      const res = await makeRequest('/api/auth/reader/login', {
        method: 'POST',
        body: {
          email: 'tdd.reader@library.local',
          matKhau: 'reader123'
        }
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.headers['set-cookie'], 'Phải gửi lại Set-Cookie');
      assert.ok(res.headers['set-cookie'].includes('token='), 'Cookie phải chứa token');
    });

    test('Nên đăng nhập Độc giả thành công bằng số điện thoại', async () => {
      const res = await makeRequest('/api/auth/reader/login', {
        method: 'POST',
        body: {
          email: '0988888888', // Nhập số điện thoại vào trường email/identifier
          matKhau: 'reader123'
        }
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.headers['set-cookie']);
    });

    test('Kiểm tra cơ chế Xóa mềm, Đăng ký trùng và Khôi phục tài khoản độc giả', async () => {
      // 1. Tạo Staff quản lý để lấy quyền gọi API admin
      const adminStaff = await Staff.create({
        hoTenNV: 'Quản lý test',
        matKhau: 'admin123',
        chucVu: 'QUAN_LY',
        diachi: 'Cần Thơ',
        soDienThoai: '0912345678'
      });

      const loginRes = await makeRequest('/api/auth/staff/login', {
        method: 'POST',
        body: {
          maSoNV: adminStaff.maSoNV,
          matKhau: 'admin123'
        }
      });
      const adminCookie = loginRes.headers['set-cookie'];

      // 2. Đăng ký độc giả A
      const regARes = await makeRequest('/api/auth/reader/register', {
        method: 'POST',
        body: {
          hoLot: 'Lê',
          ten: 'Độc Giả A',
          email: 'readera@library.local',
          matKhau: 'pass123',
          ngaySinh: '1999-01-01',
          diachi: 'Đà Nẵng',
          dienThoai: '0911111111',
          gioiTinh: 'NAM'
        }
      });
      const readerAId = regARes.body.data.maDocGia;

      // 3. Xóa mềm độc giả A
      const delARes = await makeRequest(`/api/admin/readers/${readerAId}`, {
        method: 'DELETE',
        headers: { 'Cookie': adminCookie }
      });
      assert.strictEqual(delARes.status, 200);

      // 4. Đăng ký độc giả B mới sử dụng đúng email và SĐT của A. Phải thành công vì A đã bị xóa mềm giải phóng tài nguyên.
      const regBRes = await makeRequest('/api/auth/reader/register', {
        method: 'POST',
        body: {
          hoLot: 'Trần',
          ten: 'Độc Giả B',
          email: 'readera@library.local', // trùng email của A
          matKhau: 'pass123',
          ngaySinh: '1999-02-02',
          diachi: 'Nha Trang',
          dienThoai: '0911111111', // trùng SĐT của A
          gioiTinh: 'NAM'
        }
      });
      assert.strictEqual(regBRes.status, 201, 'Phải cho phép đăng ký mới khi email/SĐT cũ đã bị xóa mềm');
      const readerBId = regBRes.body.data.maDocGia;

      // 5. Thử khôi phục lại độc giả A. Phải thất bại 409 do trùng lặp với B đang hoạt động.
      const restoreARes1 = await makeRequest(`/api/admin/readers/${readerAId}/restore`, {
        method: 'POST',
        headers: { 'Cookie': adminCookie }
      });
      assert.strictEqual(restoreARes1.status, 409, 'Khôi phục trùng lặp phải báo Conflict 409');

      // 6. Xóa mềm độc giả B
      const delBRes = await makeRequest(`/api/admin/readers/${readerBId}`, {
        method: 'DELETE',
        headers: { 'Cookie': adminCookie }
      });
      assert.strictEqual(delBRes.status, 200);

      // 7. Khôi phục lại độc giả A. Lúc này phải thành công vì B đã bị xóa mềm.
      const restoreARes2 = await makeRequest(`/api/admin/readers/${readerAId}/restore`, {
        method: 'POST',
        headers: { 'Cookie': adminCookie }
      });
      assert.strictEqual(restoreARes2.status, 200, 'Khôi phục phải thành công khi email/SĐT trùng không còn tài khoản nào hoạt động');
      assert.strictEqual(restoreARes2.body.data.reader.email, 'readera@library.local');
      assert.strictEqual(restoreARes2.body.data.reader.dienThoai, '0911111111');
    });

    test('Độc giả nên đổi mật khẩu thành công bằng API reset-password', async () => {
      const res = await makeRequest('/api/auth/reader/reset-password', {
        method: 'POST',
        body: {
          email: 'tdd.reader@library.local',
          matKhauMoi: 'newpassword123'
        }
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);

      const loginOldRes = await makeRequest('/api/auth/reader/login', {
        method: 'POST',
        body: {
          email: 'tdd.reader@library.local',
          matKhau: 'reader123'
        }
      });
      assert.strictEqual(loginOldRes.status, 401);

      const loginNewRes = await makeRequest('/api/auth/reader/login', {
        method: 'POST',
        body: {
          email: 'tdd.reader@library.local',
          matKhau: 'newpassword123'
        }
      });
      assert.strictEqual(loginNewRes.status, 200);
      assert.strictEqual(loginNewRes.body.success, true);
    });
  });

  test.describe('2. Staff Auth Tests', () => {
    test('Nên đăng nhập Staff thành công bằng maSoNV và mật khẩu', async () => {
      // Tạo Staff trước bằng DB query
      const staff = await Staff.create({
        hoTenNV: 'Thủ thư TDD',
        matKhau: 'staff123',
        chucVu: 'THU_THU',
        diachi: 'Thư viện',
        soDienThoai: '0966666666'
      });

      const res = await makeRequest('/api/auth/staff/login', {
        method: 'POST',
        body: {
          maSoNV: staff.maSoNV,
          matKhau: 'staff123'
        }
      });

      assert.strictEqual(res.status, 200, 'Đăng nhập nhân viên thành công phải trả về 200');
      assert.strictEqual(res.body.success, true);
      assert.ok(res.headers['set-cookie'], 'Phải gửi lại cookie xác thực');
    });

    test('Không cho phép Staff đăng nhập với mã nhân viên không tồn tại', async () => {
      const res = await makeRequest('/api/auth/staff/login', {
        method: 'POST',
        body: {
          maSoNV: 'NV999',
          matKhau: 'any-password'
        }
      });

      assert.strictEqual(res.status, 401, 'Mã không tồn tại phải trả về 401');
      assert.strictEqual(res.body.success, false);
    });
  });

});
