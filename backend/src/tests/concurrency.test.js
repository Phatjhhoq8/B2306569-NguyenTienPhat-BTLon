/**
 * Chức năng: Kịch bản kiểm thử tự động (Unit/Integration Test) cho Backend Core
 * Lý do tạo: Thực hiện quy trình Test-First/TDD, xác minh tính đúng đắn của cơ chế sinh mã tự tăng và an toàn đồng thời (concurrency-safe).
 * Link trích dẫn: https://nodejs.org/api/test.html
 */

const test = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');

// Mock connection string cho môi trường kiểm thử (hoặc dùng DB thật nếu chạy cục bộ)
const { connectDatabase } = require('../config/database');
const { nextCode } = require('../services/codeService');
const { createBookTitle } = require('../services/bookService');
const { Counter, Publisher, Author, Category, BookTitle, BookCopy } = require('../models');

test.describe('Backend Core & Concurrency Safety Tests', () => {
  
  // Thiết lập trước khi chạy tất cả test cases
  test.before(async () => {
    await connectDatabase();
    // Clear dữ liệu test trong các collections liên quan
    await Promise.all([
      Counter.deleteMany({}),
      Publisher.deleteMany({}),
      Author.deleteMany({}),
      Category.deleteMany({}),
      BookTitle.deleteMany({}),
      BookCopy.deleteMany({})
    ]);
  });

  // Dọn dẹp sau khi tất cả test cases hoàn tất
  test.after(async () => {
    await mongoose.connection.close();
  });

  test('1. Sinh mã đơn lẻ đúng định dạng quy chuẩn', async () => {
    const codeNXB1 = await nextCode('publisher');
    const codeNXB2 = await nextCode('publisher');
    const codeTG = await nextCode('author');
    const codeDG = await nextCode('reader');

    assert.strictEqual(codeNXB1, 'NXB001', 'Mã nhà xuất bản đầu tiên phải là NXB001');
    assert.strictEqual(codeNXB2, 'NXB002', 'Mã nhà xuất bản tiếp theo phải là NXB002');
    assert.strictEqual(codeTG, 'TG0001', 'Mã tác giả đầu tiên phải là TG0001');
    assert.strictEqual(codeDG, 'DG00001', 'Mã độc giả đầu tiên phải là DG00001');
  });

  test('2. Kiểm tra an toàn đồng thời (Concurrency Safety) - 100 Request cùng lúc', async () => {
    // Giả lập 100 request sinh mã độc giả (reader) đồng thời
    const requestCount = 100;
    const promises = Array.from({ length: requestCount }, () => nextCode('reader'));
    
    const codes = await Promise.all(promises);

    // 1. Kiểm tra tính duy nhất: Toàn bộ 100 mã phải khác nhau hoàn toàn
    const uniqueCodes = new Set(codes);
    assert.strictEqual(uniqueCodes.size, requestCount, 'Toàn bộ 100 mã sinh ra đồng thời phải duy nhất');

    // 2. Kiểm tra tính liên tục và giá trị cuối cùng của sequence trong DB
    const counterDoc = await Counter.findOne({ _id: 'reader' });
    assert.ok(counterDoc, 'Phải tồn tại bản ghi counter cho reader');
    // Vì trước đó test 1 đã gọi nextCode('reader') 1 lần -> seq hiện tại phải là 1 + 100 = 101
    assert.strictEqual(counterDoc.seq, 101, 'Sequence cuối cùng trong DB phải là 101');

    // 3. Kiểm tra định dạng mã cuối cùng được tạo ra
    assert.ok(codes.includes('DG00101'), 'Phải chứa mã DG00101');
  });

  test('3. Tạo Đầu Sách & tự sinh bản sao vật lý an toàn', async () => {
    // Tạo Publisher, Author, Category mẫu trước
    const nxb = await Publisher.create({
      maNXB: await nextCode('publisher'),
      tenNXB: 'NXB Trẻ',
      soDienThoai: '0912345678'
    });

    const tacGia = await Author.create({
      maTacGia: await nextCode('author'),
      tenTacGia: 'Nguyễn Nhật Ánh'
    });

    const theLoai = await Category.create({
      maTheLoai: await nextCode('category'),
      tenTheLoai: 'Truyện dài'
    });

    // Tạo đầu sách mới với tổng số lượng ban đầu là 5 bản sao
    const bookTitleData = {
      tenSach: 'Kính Vạn Hoa',
      tacGia: [tacGia._id],
      nhaXuatBan: nxb._id,
      theLoai: theLoai._id,
      namSanXuat: 2024,
      tongSoLuong: 5,
      giaBia: 120000,
      tuKhoa: ['kinh van hoa', 'truyen thieu nhi']
    };

    const bookTitle = await createBookTitle(bookTitleData);

    // Xác thực đầu sách được lưu thành công
    assert.ok(bookTitle.maDauSach, 'Đầu sách phải có mã đầu sách maDauSach');
    assert.strictEqual(bookTitle.tenSach, 'Kính Vạn Hoa');
    assert.strictEqual(bookTitle.soLuongKhaDung, 5, 'Số lượng khả dụng ban đầu phải bằng tổng số lượng');

    // Xác thực số lượng bản sao vật lý (BookCopy) được tự động tạo ra
    const copies = await BookCopy.find({ dauSach: bookTitle._id });
    assert.strictEqual(copies.length, 5, 'Phải tự động tạo ra 5 bản sao vật lý BookCopy');

    // Kiểm tra định dạng mã của các bản sao vật lý
    copies.forEach((copy, index) => {
      assert.match(copy.maSach, /^BS\d{6}$/, 'Mã sách vật lý phải đúng định dạng BSxxxxxx');
      assert.strictEqual(copy.viTriKe, 'KE-A1', 'Vị trí kệ mặc định phải được phân bổ');
      assert.strictEqual(copy.tinhTrang, 'CHO_MUON', 'Tình trạng ban đầu phải là CHO_MUON');
    });
  });

});
