/**
 * Chức năng: Kịch bản kiểm thử TDD cho Module Borrowing & Penalties
 * Lý do tạo: Thực hiện nguyên lý Test-First (TDD) bằng HTTP Server thật trước khi xây dựng API Borrowing
 * Link trích dẫn: https://nodejs.org/api/test.html
 */

const test = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const http = require('http');
const { connectDatabase } = require('../config/database');
const { Publisher, Author, Category, BookTitle, BookCopy, Reader, Staff, MembershipPlan, Subscription, BorrowReceipt } = require('../models');
const app = require('../app');
const jwtHelper = require('../utils/jwtHelper');

let server;
let baseUrl;
let readerCookie = '';
let staffCookie = '';
let testReaderId;
let testBookCopyId;

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

test.describe('Borrowing & Penalties API Tests', () => {

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
      Reader.deleteMany({}),
      Staff.deleteMany({}),
      MembershipPlan.deleteMany({}),
      Subscription.deleteMany({}),
      BorrowReceipt.deleteMany({})
    ]);

    // 1. Tạo dữ liệu nền: Thể loại, Tác giả, Nhà xuất bản, Đầu sách
    const category = await Category.create({ tenTheLoai: 'Văn học', moTa: 'Văn học' });
    const author = await Author.create({ tenTacGia: 'Tô Hoài' });
    const publisher = await Publisher.create({ tenNXB: 'NXB Kim Đồng', soDienThoai: '0912345678' });
    const bookTitle = await BookTitle.create({
      tenSach: 'Dế Mèn Phiêu Lưu Ký',
      tacGia: [author._id],
      nhaXuatBan: publisher._id,
      theLoai: category._id,
      namSanXuat: 1941,
      giaBia: 60000,
      tongSoLuong: 1,
      soLuongDangQuanLy: 1,
      soLuongKhaDung: 1
    });

    const bookCopy = await BookCopy.create({
      dauSach: bookTitle._id,
      viTriKe: 'KE-A1',
      tinhTrang: 'CHO_MUON'
    });
    testBookCopyId = bookCopy._id;

    // 2. Tạo gói Membership và độc giả có Subscription đang hoạt động
    const plan = await MembershipPlan.create({
      tenGoi: 'Gói VIP',
      giaTien: 50000,
      soNgayHieuLuc: 30,
      soSachToiDa: 5,
      soNgayMuonToiDa: 14,
      mienTienCoc: true,
      choPhepGiaHanOnline: true,
      phiMuonSachGiay: 2000
    });

    const reader = await Reader.create({
      hoLot: 'Trần Văn',
      ten: 'TDD Borrow Reader',
      email: 'tdd.borrow@library.local',
      matKhau: 'reader123',
      ngaySinh: new Date('1995-05-05'),
      diachi: 'Đà Nẵng',
      dienThoai: '0955555555'
    });
    testReaderId = reader._id;

    await Subscription.create({
      docGia: reader._id,
      goiDocGia: plan._id,
      ngayBatDau: new Date(),
      ngayKetThuc: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      tongTien: 50000,
      trangThai: 'DANG_HIEU_LUC'
    });

    // 3. Đăng ký Staff
    const staff = await Staff.create({
      hoTenNV: 'Thủ thư mượn trả',
      matKhau: 'admin123',
      chucVu: 'THU_THU',
      diachi: 'Thư viện trung tâm',
      soDienThoai: '0944444444'
    });

    // 4. Tạo token và cookies
    const readerToken = jwtHelper.signToken({ id: reader._id, role: 'READER' });
    readerCookie = `token=${readerToken}`;

    const staffToken = jwtHelper.signToken({ id: staff._id, role: 'STAFF', chucVu: 'THU_THU' });
    staffCookie = `token=${staffToken}`;
  });

  test.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.close();
  });

  test.describe('1. Borrow book flow Tests', () => {
    let createdReceiptId;

    test('Độc giả nên đăng ký mượn sách thành công', async () => {
      const payload = {
        chiTietMuon: [
          { sach: testBookCopyId, tinhTrangLucMuon: 'Mới' }
        ],
        ngayHenTra: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      const res = await makeRequest('/api/borrowing/receipts', {
        method: 'POST',
        headers: { Cookie: readerCookie },
        body: payload
      });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.maPhieu);
      assert.strictEqual(res.body.data.trangThai, 'SAN_SANG');
      createdReceiptId = res.body.data._id;

      // Kiểm tra sách đã đổi trạng thái sang DA_MUON trong DB
      const copy = await BookCopy.findById(testBookCopyId);
      assert.strictEqual(copy.tinhTrang, 'DA_MUON', 'Cuốn sách phải chuyển sang DA_MUON');
    });

    test('Thủ thư nên giao sách và chuyển phiếu sang đang mượn', async () => {
      const res = await makeRequest(`/api/borrowing/receipts/${createdReceiptId}/pickup`, {
        method: 'POST',
        headers: { Cookie: staffCookie }
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.trangThai, 'DANG_MUON');
    });

    test('Độc giả nên lấy danh sách phiếu mượn cá nhân thành công', async () => {
      const res = await makeRequest('/api/borrowing/my-receipts', {
        headers: { Cookie: readerCookie }
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.data.length > 0);
    });

    test('Độc giả nên gia hạn phiếu mượn thành công và tính thêm phí mượn', async () => {
      const ngayHenTraMoi = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000); // Gia hạn thành 10 ngày (thêm 3 ngày)
      const res = await makeRequest(`/api/borrowing/receipts/${createdReceiptId}/renew`, {
        method: 'POST',
        headers: { Cookie: readerCookie },
        body: { ngayHenTraMoi }
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      
      const updatedDate = new Date(res.body.data.ngayHenTra);
      assert.strictEqual(updatedDate.getDate(), ngayHenTraMoi.getDate());

      // Phí mượn gốc: 2,000 * 7 ngày = 14,000. Phí gia hạn thêm: 2,000 * 3 ngày = 6,000. Tổng: 20,000.
      assert.strictEqual(res.body.data.phiMuon, 20000);
      assert.strictEqual(res.body.data.tongTienThanhToan, 20000);
    });

    test('Nhân viên (Staff) không được phép gia hạn phiếu mượn (403)', async () => {
      const ngayHenTraMoi = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
      const res = await makeRequest(`/api/borrowing/receipts/${createdReceiptId}/renew`, {
        method: 'POST',
        headers: { Cookie: staffCookie },
        body: { ngayHenTraMoi }
      });

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
    });

    test('Thủ thư nên ghi nhận trả sách thành công, chuyển sang CHO_THANH_TOAN', async () => {
      const res = await makeRequest(`/api/borrowing/receipts/${createdReceiptId}/return`, {
        method: 'POST',
        headers: { Cookie: staffCookie }
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.trangThai, 'CHO_THANH_TOAN');

      // Sách phải được giải phóng về CHO_MUON
      const copy = await BookCopy.findById(testBookCopyId);
      assert.strictEqual(copy.tinhTrang, 'CHO_MUON', 'Sách phải được giải phóng về CHO_MUON');
    });

    test('Độc giả thanh toán hóa đơn mượn sách thành công, chuyển sang DA_TRA', async () => {
      const res = await makeRequest(`/api/borrowing/receipts/${createdReceiptId}/pay`, {
        method: 'POST',
        headers: { Cookie: readerCookie },
        body: { phuongThucThanhToan: 'VIETQR' }
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.trangThai, 'DA_TRA');
      assert.strictEqual(res.body.data.phuongThucThanhToan, 'VIETQR');
    });

    test('Độc giả nên xem thống kê tài chính cá nhân thành công', async () => {
      const res = await makeRequest('/api/borrowing/my-financial-stats', {
        headers: { Cookie: readerCookie }
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.tongPhiMuon, 20000);
      assert.strictEqual(res.body.data.soPhieuDaTra, 1);
      assert.strictEqual(res.body.data.phiMuonDangXuLy, 0);
      assert.strictEqual(res.body.data.soPhieuDangXuLyPhi, 0);
      assert.strictEqual(res.body.data.soSachDaMuon, 1);
      assert.strictEqual(res.body.data.borrowRank, 1);
      assert.strictEqual(res.body.data.totalRankedReaders, 1);
    });

    test('Nhân viên nên xem thống kê tài chính hệ thống thành công', async () => {
      const res = await makeRequest('/api/borrowing/financial-stats', {
        headers: { Cookie: staffCookie }
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.tongPhiMuon, 20000);
      assert.strictEqual(res.body.data.soPhieuDaTra, 1);
      assert.strictEqual(res.body.data.phiMuonDangXuLy, 0);
      assert.strictEqual(res.body.data.soPhieuDangXuLyPhi, 0);
      assert.strictEqual(res.body.data.tongDoanhThu, res.body.data.tongPhiMuon + res.body.data.tienPhatDaThu + res.body.data.doanhThuHoiVien);
    });
  });

});
