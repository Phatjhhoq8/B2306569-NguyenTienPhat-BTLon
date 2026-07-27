/**
 * Chức năng: Kịch bản kiểm thử TDD cho Core Utilities & Middlewares
 * Lý do tạo: Thực hiện nguyên lý Test-First (TDD) trước khi code các logic Core
 * Link trích dẫn: https://nodejs.org/api/test.html
 */

const test = require('node:test');
const assert = require('node:assert');

// Khai báo trước các module (sẽ được viết sau)
const jwtHelper = require('../utils/jwtHelper');
const cookieHelper = require('../utils/cookieHelper');
const resultResponse = require('../utils/resultResponse');
const authMiddleware = require('../middlewares/auth.middleware');
const errorMiddleware = require('../middlewares/error.middleware');
const validateMiddleware = require('../middlewares/validate.middleware');

test.describe('Core Utilities & Middlewares Tests', () => {

  test.describe('1. jwtHelper Tests', () => {
    test('Nên ký và giải mã JWT Token thành công', async () => {
      const payload = { id: 'DG00001', role: 'READER' };
      const token = jwtHelper.signToken(payload);
      assert.ok(token, 'Token phải được tạo ra');
      assert.strictEqual(typeof token, 'string', 'Token phải là một chuỗi');

      const decoded = jwtHelper.verifyToken(token);
      assert.strictEqual(decoded.id, payload.id, 'Payload ID phải trùng khớp');
      assert.strictEqual(decoded.role, payload.role, 'Payload Role phải trùng khớp');
    });

    test('Nên throw error khi verify token không hợp lệ', async () => {
      assert.throws(() => {
        jwtHelper.verifyToken('invalid-token-string');
      }, /jwt malformed|invalid token|invalid signature/i);
    });
  });

  test.describe('2. cookieHelper Tests', () => {
    test('Nên thiết lập header Set-Cookie đúng tham số', () => {
      const mockRes = {
        headers: {},
        setHeader(name, value) {
          this.headers[name] = value;
        }
      };

      cookieHelper.setCookieToken(mockRes, 'test-token-value');
      
      const setCookieHeader = mockRes.headers['Set-Cookie'];
      assert.ok(setCookieHeader, 'Phải thiết lập header Set-Cookie');
      assert.ok(setCookieHeader.includes('token=test-token-value'), 'Cookie phải chứa token value');
      assert.ok(setCookieHeader.includes('HttpOnly'), 'Cookie phải có HttpOnly');
      assert.ok(setCookieHeader.includes('SameSite=Lax'), 'Cookie phải có SameSite=Lax');
      assert.ok(setCookieHeader.includes('Path=/'), 'Cookie phải có Path=/');
    });

    test('Nên xóa cookie thành công', () => {
      const mockRes = {
        headers: {},
        setHeader(name, value) {
          this.headers[name] = value;
        }
      };

      cookieHelper.clearCookieToken(mockRes);
      
      const setCookieHeader = mockRes.headers['Set-Cookie'];
      assert.ok(setCookieHeader, 'Phải thiết lập header Set-Cookie để xóa');
      assert.ok(setCookieHeader.includes('Max-Age=0') || setCookieHeader.includes('Expires='), 'Cookie phải được đánh dấu hết hạn');
    });
  });

  test.describe('3. resultResponse Tests', () => {
    test('Nên trả response thành công dạng JSON chuẩn', () => {
      let responseStatus = 200;
      let responseJson = null;
      
      const mockRes = {
        status(code) {
          responseStatus = code;
          return this;
        },
        json(data) {
          responseJson = data;
          return this;
        }
      };

      resultResponse.ok(mockRes, { message: 'success' }, 200);

      assert.strictEqual(responseStatus, 200);
      assert.deepStrictEqual(responseJson, { success: true, data: { message: 'success' } });
    });

    test('Nên trả response thất bại dạng JSON chuẩn', () => {
      let responseStatus = 400;
      let responseJson = null;

      const mockRes = {
        status(code) {
          responseStatus = code;
          return this;
        },
        json(data) {
          responseJson = data;
          return this;
        }
      };

      resultResponse.err(mockRes, 'Có lỗi xảy ra', 400);

      assert.strictEqual(responseStatus, 400);
      assert.deepStrictEqual(responseJson, { success: false, error: { message: 'Có lỗi xảy ra' } });
    });
  });

  test.describe('4. auth.middleware Tests', () => {
    test('Nên từ chối nếu không gửi cookie token', async () => {
      const mockReq = { headers: {} };
      let statusCalled = null;
      let jsonCalled = null;
      
      const mockRes = {
        status(code) {
          statusCalled = code;
          return this;
        },
        json(data) {
          jsonCalled = data;
          return this;
        }
      };
      
      const mockNext = () => {};

      await authMiddleware.authenticate(mockReq, mockRes, mockNext);

      assert.strictEqual(statusCalled, 401, 'Không có token phải trả về 401');
      assert.strictEqual(jsonCalled.success, false);
      assert.strictEqual(jsonCalled.error.message, 'Không tìm thấy token xác thực');
    });
  });

  test.describe('5. error.middleware Tests', () => {
    test('Nên format lỗi chính xác về Result Pattern', () => {
      const err = new Error('Test error');
      err.status = 400;

      let responseStatus = null;
      let responseJson = null;

      const mockRes = {
        status(code) {
          responseStatus = code;
          return this;
        },
        json(data) {
          responseJson = data;
          return this;
        }
      };

      errorMiddleware(err, {}, mockRes, () => {});

      assert.strictEqual(responseStatus, 400);
      assert.strictEqual(responseJson.success, false);
      assert.strictEqual(responseJson.error.message, 'Test error');
    });
  });

  test.describe('6. validate.middleware Tests', () => {
    test('Nên validate thành công nếu đầy đủ trường bắt buộc', () => {
      const mockReq = {
        body: { tenSach: 'Sách A', tacGia: 'Tác giả A' }
      };
      let nextCalled = false;
      const mockRes = {};
      const mockNext = () => { nextCalled = true; };

      const middleware = validateMiddleware.requiredFields(['tenSach', 'tacGia']);
      middleware(mockReq, mockRes, mockNext);

      assert.strictEqual(nextCalled, true, 'Nên đi tiếp vào next()');
    });

    test('Nên trả lỗi 400 nếu thiếu trường bắt buộc', () => {
      const mockReq = {
        body: { tenSach: 'Sách A' }
      };
      let statusCalled = null;
      let jsonCalled = null;
      const mockRes = {
        status(code) {
          statusCalled = code;
          return this;
        },
        json(data) {
          jsonCalled = data;
          return this;
        }
      };
      const mockNext = () => {};

      const middleware = validateMiddleware.requiredFields(['tenSach', 'tacGia']);
      middleware(mockReq, mockRes, mockNext);

      assert.strictEqual(statusCalled, 400);
      assert.strictEqual(jsonCalled.success, false);
      assert.ok(jsonCalled.error.message.includes('Thiếu thông tin bắt buộc: tacGia'));
    });
  });

});
