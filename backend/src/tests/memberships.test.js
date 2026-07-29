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
const { getBestPlan, getEffectiveMembershipPlan } = require('../modules/memberships/membershipPrivileges');

let server;
let baseUrl;
let readerCookie = '';
let staffCookie = '';
let testPlanId;
let testReaderId;

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
    testReaderId = reader._id;

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

    test('Độc giả nên đăng ký gói hội viên qua Thẻ tín dụng thành công với tự động gia hạn', async () => {
      const vipPlan = await MembershipPlan.create({
        tenGoi: 'Đọc VIP TDD',
        giaTien: 99000,
        soNgayHieuLuc: 30,
        soSachToiDa: 5,
        soNgayMuonToiDa: 21,
        mienTienCoc: true
      });

      const payload = {
        goiId: vipPlan._id,
        phuongThucThanhToan: 'THE_TIN_DUNG',
        thongTinThe: {
          soThe: '1234567812345678',
          tenTrenThe: 'TDD READER',
          ngayHetHan: '12/29',
          maCVC: '123'
        }
      };

      const res = await makeRequest('/api/memberships/subscribe', {
        method: 'POST',
        headers: { Cookie: readerCookie },
        body: payload
      });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.phuongThucThanhToan, 'THE_TIN_DUNG');
      assert.strictEqual(res.body.data.tuDongGiaHan, true);
      assert.strictEqual(res.body.data.thongTinThe.soThe, '1234567812345678');
    });

    test('Độc giả nên hủy gia hạn gói tự động thành công', async () => {
      const res = await makeRequest('/api/memberships/cancel-auto-renew', {
        method: 'POST',
        headers: { Cookie: readerCookie }
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.subscription.tuDongGiaHan, false);
    });

    test('Đăng ký gói mới nên giữ gói cũ và ghi nhận thêm gói mới', async () => {
      const activeBefore = await Subscription.findOne({
        docGia: testReaderId,
        trangThai: 'DANG_HIEU_LUC'
      });
      assert.ok(activeBefore, 'Cần có gói đang hiệu lực trước khi đăng ký gói mới');

      const upgradePlan = await MembershipPlan.create({
        tenGoi: 'Đọc Plus TDD',
        giaTien: 50000,
        soNgayHieuLuc: 45,
        soSachToiDa: 4,
        soNgayMuonToiDa: 18,
        mienTienCoc: false
      });

      const res = await makeRequest('/api/memberships/subscribe', {
        method: 'POST',
        headers: { Cookie: readerCookie },
        body: { goiId: upgradePlan._id }
      });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.trangThai, 'DANG_HIEU_LUC');
      assert.strictEqual(res.body.data.tongTien, upgradePlan.giaTien);

      const stillActiveOldSub = await Subscription.findById(activeBefore._id);
      assert.strictEqual(stillActiveOldSub.trangThai, 'DANG_HIEU_LUC');

      const activeCount = await Subscription.countDocuments({
        docGia: testReaderId,
        trangThai: 'DANG_HIEU_LUC'
      });
      assert.ok(activeCount >= 2);
    });

    test('Quyền hội viên hiệu lực nên chọn gói xịn nhất từ nhiều gói', () => {
      const effectivePlan = getBestPlan([
        {
          tenGoi: 'Basic',
          giaTien: 50000,
          soSachToiDa: 3,
          soNgayMuonToiDa: 14,
          mienTienCoc: false,
          choPhepGiaHanOnline: false,
          phiMuonSachGiay: 3000,
          phiPhatTreHan: 5000,
          tienDatCoc: 50000
        },
        {
          tenGoi: 'Premium',
          giaTien: 99000,
          soSachToiDa: 8,
          soNgayMuonToiDa: 30,
          mienTienCoc: true,
          choPhepGiaHanOnline: true,
          phiMuonSachGiay: 1000,
          phiPhatTreHan: 2000,
          tienDatCoc: 100000
        }
      ]);

      assert.strictEqual(effectivePlan.soSachToiDa, 8);
      assert.strictEqual(effectivePlan.soNgayMuonToiDa, 30);
      assert.strictEqual(effectivePlan.mienTienCoc, true);
      assert.strictEqual(effectivePlan.choPhepGiaHanOnline, true);
      assert.strictEqual(effectivePlan.phiMuonSachGiay, 1000);
      assert.strictEqual(effectivePlan.phiPhatTreHan, 2000);
      assert.strictEqual(effectivePlan.tienDatCoc, 0);
    });

    test('Mua lại đúng gói đang hiệu lực nên gia hạn thêm một kỳ', async () => {
      const activeBefore = await Subscription.findOne({
        docGia: testReaderId,
        trangThai: 'DANG_HIEU_LUC'
      }).populate('goiDocGia');
      assert.ok(activeBefore?.goiDocGia, 'Cần có gói đang hiệu lực để kiểm thử gia hạn');

      const oldEnd = new Date(activeBefore.ngayKetThuc);
      const oldTotal = activeBefore.tongTien;
      const activeCountBefore = await Subscription.countDocuments({
        docGia: testReaderId,
        trangThai: 'DANG_HIEU_LUC'
      });

      const res = await makeRequest('/api/memberships/subscribe', {
        method: 'POST',
        headers: { Cookie: readerCookie },
        body: { goiId: activeBefore.goiDocGia._id }
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data._id, activeBefore._id);
      assert.strictEqual(res.body.data.tongTien, oldTotal + activeBefore.goiDocGia.giaTien);

      const renewedSub = await Subscription.findById(activeBefore._id);
      const expectedEnd = oldEnd.getTime() + activeBefore.goiDocGia.soNgayHieuLuc * 24 * 60 * 60 * 1000;
      assert.strictEqual(new Date(renewedSub.ngayKetThuc).getTime(), expectedEnd);

      const activeCountAfter = await Subscription.countDocuments({
        docGia: testReaderId,
        trangThai: 'DANG_HIEU_LUC'
      });
      assert.strictEqual(activeCountAfter, activeCountBefore);
    });

    test('Nhân viên nên lấy được toàn bộ danh sách đăng ký gói', async () => {
      const res = await makeRequest('/api/memberships/subscriptions', {
        headers: { Cookie: staffCookie }
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
    });

    test('Độc giả thường không được phép xem toàn bộ đăng ký', async () => {
      const res = await makeRequest('/api/memberships/subscriptions', {
        headers: { Cookie: readerCookie }
      });

      assert.strictEqual(res.status, 403);
    });

    test('Thành viên được mời vào Family nên thấy gói chia sẻ và được áp quyền khi mượn', async () => {
      const familyPlan = await MembershipPlan.create({
        tenGoi: 'Family TDD',
        giaTien: 150000,
        soNgayHieuLuc: 30,
        soSachToiDa: 9,
        soNgayMuonToiDa: 30,
        mienTienCoc: true,
        choPhepGiaHanOnline: true,
        chiaSeNhomGiaDinh: true,
        loaiGoi: 'TEAM',
        phiMuonSachGiay: 1000,
        phiPhatTreHan: 2000,
        tienDatCoc: 0
      });

      await makeRequest('/api/memberships/subscribe', {
        method: 'POST',
        headers: { Cookie: readerCookie },
        body: { goiId: familyPlan._id }
      });

      const invitedReader = await Reader.create({
        hoLot: 'Lê',
        ten: 'Family Member',
        email: 'family.member@library.local',
        matKhau: 'reader123',
        ngaySinh: new Date('2000-01-01'),
        diachi: 'Cần Thơ',
        dienThoai: '0900000001'
      });
      const invitedToken = jwtHelper.signToken({ id: invitedReader._id, role: 'READER' });
      const invitedCookie = `token=${invitedToken}`;

      const joinRes = await makeRequest('/api/memberships/join-family', {
        method: 'POST',
        headers: { Cookie: readerCookie },
        body: { maDocGiaMoi: invitedReader._id }
      });

      assert.strictEqual(joinRes.status, 200);
      assert.strictEqual(joinRes.body.success, true);
      assert.ok(joinRes.body.data.subscription.nguoiDuocMoi.includes(invitedReader._id));

      const invitedSubsRes = await makeRequest('/api/memberships/my-subscriptions', {
        headers: { Cookie: invitedCookie }
      });

      assert.strictEqual(invitedSubsRes.status, 200);
      assert.strictEqual(invitedSubsRes.body.success, true);
      assert.ok(invitedSubsRes.body.data.some(sub => sub.goiDocGia?._id === familyPlan._id));

      const effectivePlan = await getEffectiveMembershipPlan(invitedReader._id);
      assert.strictEqual(effectivePlan._id, familyPlan._id);
      assert.strictEqual(effectivePlan.soSachToiDa, 9);
      assert.strictEqual(effectivePlan.tienDatCoc, 0);
    });

    test('Gói tự động gia hạn hết hạn nên tự động sinh gói mới khi gọi lấy gói cá nhân', async () => {
      await Subscription.deleteMany({});
      
      const vipPlan = await MembershipPlan.findOne({ giaTien: { $gt: 0 } });
      const now = new Date();
      
      const expiredSub = await Subscription.create({
        docGia: testReaderId, // mã độc giả trong test.before liên quan
        goiDocGia: vipPlan._id,
        ngayBatDau: new Date(now.getTime() - 32 * 24 * 60 * 60 * 1000),
        ngayKetThuc: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        tongTien: vipPlan.giaTien,
        trangThai: 'DANG_HIEU_LUC',
        phuongThucThanhToan: 'THE_TIN_DUNG',
        tuDongGiaHan: true,
        thongTinThe: { soThe: '1111222233334444' }
      });

      // Gọi API lấy gói cá nhân của Độc giả
      const res = await makeRequest('/api/memberships/my-subscriptions', {
        headers: { Cookie: readerCookie }
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      
      const updatedExpiredSub = await Subscription.findById(expiredSub._id);
      assert.strictEqual(updatedExpiredSub.trangThai, 'HET_HAN');
      
      const newSub = await Subscription.findOne({
        docGia: testReaderId,
        trangThai: 'DANG_HIEU_LUC'
      });
      assert.ok(newSub, 'Subscription tự động gia hạn mới phải được tạo');
      assert.strictEqual(newSub.phuongThucThanhToan, 'THE_TIN_DUNG');
      assert.strictEqual(newSub.tuDongGiaHan, true);
    });
  });

});
