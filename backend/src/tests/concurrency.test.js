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
const { Counter, Publisher, Author, Category, BookTitle, BookCopy, Reader, BorrowReceipt, MembershipPlan, Subscription, PenaltyTicket, Staff } = require('../models');

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
      BookCopy.deleteMany({}),
      Reader.deleteMany({}),
      BorrowReceipt.deleteMany({}),
      MembershipPlan.deleteMany({}),
      Subscription.deleteMany({}),
      PenaltyTicket.deleteMany({}),
      Staff.deleteMany({})
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

  test('4. Trigger tự động sinh mã khóa chính trước khi save (pre-save hook)', async () => {
    // Tạo mới Reader không điền maDocGia để trigger tự động gán mã
    const reader = new Reader({
      hoLot: 'Trần Thị',
      ten: 'Kiểm Thử',
      email: 'trigger_test@library.local',
      matKhau: 'reader123',
      ngaySinh: new Date('1999-05-05'),
      diachi: 'Hồ Chí Minh',
      dienThoai: '0987654321'
    });

    await reader.save();
    
    assert.ok(reader.maDocGia, 'Trigger phải tự động sinh maDocGia sau khi save');
    assert.match(reader.maDocGia, /^DG\d{5}$/, 'maDocGia phải đúng định dạng DGxxxxx');
  });

  test('5. Trigger tự động cập nhật trạng thái sách và tồn kho đầu sách khi mượn/trả sách', async () => {
    // 1. Lấy thông tin đầu sách và cuốn sách vật lý từ test case 3
    const bookTitle = await BookTitle.findOne({ tenSach: 'Kính Vạn Hoa' });
    const copies = await BookCopy.find({ dauSach: bookTitle._id });
    const reader = await Reader.findOne({ email: 'trigger_test@library.local' });

    // Lấy cuốn sách đầu tiên đang ở trạng thái CHO_MUON
    const copyToBorrow = copies[0];
    assert.strictEqual(copyToBorrow.tinhTrang, 'CHO_MUON');

    // Tạo gói membership mặc định cho reader để vượt qua trigger hội viên
    const defaultPlan = await MembershipPlan.create({
      maGoi: await nextCode('membershipPlan'),
      tenGoi: 'Default Member',
      giaTien: 0,
      soNgayHieuLuc: 30,
      soSachToiDa: 5,
      soNgayMuonToiDa: 7,
      mienTienCoc: true
    });
    await Subscription.create({
      maDangKy: await nextCode('subscription'),
      docGia: reader._id,
      goiDocGia: defaultPlan._id,
      ngayBatDau: new Date(),
      ngayKetThuc: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      tongTien: 0,
      trangThai: 'DANG_HIEU_LUC'
    });

    // 2. Tạo phiếu mượn sách mới (DANG_MUON)
    const borrowReceipt = new BorrowReceipt({
      docGia: reader._id,
      chiTietMuon: [{
        sach: copyToBorrow._id,
        tinhTrangLucMuon: 'Tốt'
      }],
      ngayHenTra: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    await borrowReceipt.save();

    // 3. Xác thực: Cuốn sách vật lý tự động chuyển sang DA_MUON
    const updatedCopy = await BookCopy.findById(copyToBorrow._id);
    assert.strictEqual(updatedCopy.tinhTrang, 'DA_MUON', 'Trạng thái sách vật lý phải tự động đổi thành DA_MUON');

    // 4. Xác thực: Tồn kho khả dụng của đầu sách giảm đi 1 (từ 5 xuống 4)
    const updatedTitle = await BookTitle.findById(bookTitle._id);
    assert.strictEqual(updatedTitle.soLuongKhaDung, 4, 'soLuongKhaDung của đầu sách phải tự động giảm từ 5 xuống 4');

    // 5. Cập nhật phiếu mượn sang trạng thái DA_TRA để trả sách
    borrowReceipt.trangThai = 'DA_TRA';
    borrowReceipt.ngayTraThucTe = new Date();
    await borrowReceipt.save();

    // 6. Xác thực: Cuốn sách vật lý tự động chuyển về CHO_MUON
    const returnedCopy = await BookCopy.findById(copyToBorrow._id);
    assert.strictEqual(returnedCopy.tinhTrang, 'CHO_MUON', 'Trạng thái sách vật lý phải tự động đổi về CHO_MUON sau khi trả');

    // 7. Xác thực: Tồn kho khả dụng của đầu sách tăng lại lên 5
    const reUpdatedTitle = await BookTitle.findById(bookTitle._id);
    assert.strictEqual(reUpdatedTitle.soLuongKhaDung, 5, 'soLuongKhaDung của đầu sách phải tự động tăng lại từ 4 lên 5');
  });

  test('6. Kiểm tra tranh chấp (Race Condition) - Hai độc giả mượn cùng một cuốn sách vật lý', async () => {
    const bookTitle = await BookTitle.findOne({ tenSach: 'Kính Vạn Hoa' });
    const copies = await BookCopy.find({ dauSach: bookTitle._id, tinhTrang: 'CHO_MUON' });
    
    // Lấy cuốn sách vật lý đang rảnh rỗi thứ hai
    const targetCopy = copies[1];
    assert.ok(targetCopy, 'Phải có cuốn sách vật lý thứ hai đang CHO_MUON');

    // Tạo hai tài khoản độc giả giả lập khác nhau
    const readerA = await Reader.create({
      hoLot: 'Nguyễn Văn',
      ten: 'A',
      email: 'readera@library.local',
      matKhau: 'reader123',
      ngaySinh: new Date('2000-01-01'),
      diachi: 'Cần Thơ',
      dienThoai: '0933333333'
    });

    const readerB = await Reader.create({
      hoLot: 'Trần Văn',
      ten: 'B',
      email: 'readerb@library.local',
      matKhau: 'reader123',
      ngaySinh: new Date('2000-01-01'),
      diachi: 'Hậu Giang',
      dienThoai: '0944444444'
    });

    const defaultPlan = await MembershipPlan.findOne({ tenGoi: 'Default Member' });
    await Subscription.create({
      maDangKy: await nextCode('subscription'),
      docGia: readerA._id,
      goiDocGia: defaultPlan._id,
      ngayBatDau: new Date(),
      ngayKetThuc: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      tongTien: 0,
      trangThai: 'DANG_HIEU_LUC'
    });
    await Subscription.create({
      maDangKy: await nextCode('subscription'),
      docGia: readerB._id,
      goiDocGia: defaultPlan._id,
      ngayBatDau: new Date(),
      ngayKetThuc: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      tongTien: 0,
      trangThai: 'DANG_HIEU_LUC'
    });

    // Tạo hai phiếu mượn song song yêu cầu mượn CÙNG MỘT CUỐN SÁCH vật lý targetCopy
    const borrowA = new BorrowReceipt({
      docGia: readerA._id,
      chiTietMuon: [{ sach: targetCopy._id, tinhTrangLucMuon: 'Mới' }],
      ngayHenTra: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    const borrowB = new BorrowReceipt({
      docGia: readerB._id,
      chiTietMuon: [{ sach: targetCopy._id, tinhTrangLucMuon: 'Mới' }],
      ngayHenTra: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    // Gửi yêu cầu lưu đồng thời và bắt kết quả
    const results = await Promise.allSettled([
      borrowA.save(),
      borrowB.save()
    ]);

    const fulfilled = results.filter(r => r.status === 'fulfilled');
    const rejected = results.filter(r => r.status === 'rejected');

    // Xác thực: Chỉ có DUY NHẤT 1 request thành công, request còn lại bắt buộc phải thất bại (tránh mượn chồng chéo)
    assert.strictEqual(fulfilled.length, 1, 'Chỉ được phép có duy nhất 1 phiếu mượn được lưu thành công');
    assert.strictEqual(rejected.length, 1, 'Request mượn cùng lúc còn lại bắt buộc phải bị từ chối');

    // Xác thực lỗi trả về của request bị từ chối
    const rejectError = rejected[0].reason;
    assert.ok(rejectError.message.includes('không khả dụng') || rejectError.message.includes('validation failed'), 
      'Lỗi trả về phải chỉ rõ cuốn sách không khả dụng để mượn');

    // Xác thực tồn kho của đầu sách: Kính Vạn Hoa ban đầu có 5, mượn 1 cuốn ở test case 5 (và đã trả nên về 5), mượn thêm 1 cuốn ở đây -> phải còn 4
    const finalTitle = await BookTitle.findById(bookTitle._id);
    assert.strictEqual(finalTitle.soLuongKhaDung, 4, 'soLuongKhaDung cuối cùng của đầu sách phải là 4');

    // Xác thực trạng thái cuốn sách vật lý: phải chuyển sang DA_MUON
    const finalCopy = await BookCopy.findById(targetCopy._id);
    assert.strictEqual(finalCopy.tinhTrang, 'DA_MUON', 'Trạng thái cuốn sách vật lý cuối cùng phải là DA_MUON');
  });

  test('7. Kiểm tra hạn thẻ thành viên khi mượn sách', async () => {
    // Tạo độc giả mới không có gói subscription
    const readerNoSub = await Reader.create({
      hoLot: 'Nguyễn Văn',
      ten: 'Không Thẻ',
      email: 'nosub@library.local',
      matKhau: 'reader123',
      ngaySinh: new Date('2000-01-01'),
      diachi: 'Đà Nẵng',
      dienThoai: '0977777777'
    });

    const bookTitle = await BookTitle.findOne({ tenSach: 'Kính Vạn Hoa' });
    const copies = await BookCopy.find({ dauSach: bookTitle._id, tinhTrang: 'CHO_MUON' });

    const borrow = new BorrowReceipt({
      docGia: readerNoSub._id,
      chiTietMuon: [{ sach: copies[0]._id, tinhTrangLucMuon: 'Tốt' }],
      ngayHenTra: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    // Mong đợi: Việc lưu phiếu mượn phải THẤT BẠI vì độc giả không có thẻ thành viên còn hạn
    await assert.rejects(
      borrow.save(),
      /hội viên/i,
      'Phải ném ra lỗi yêu cầu độc giả phải có gói hội viên còn hiệu lực'
    );
  });

  test('8. Kiểm tra hạn mức mượn tối đa của gói thẻ và tự động tính tiền cọc', async () => {
    // 1. Tạo gói thành viên VIP: giới hạn 2 cuốn, miễn tiền cọc
    const vipPlan = await MembershipPlan.create({
      maGoi: await nextCode('membershipPlan'),
      tenGoi: 'VIP Member',
      giaTien: 100000,
      soNgayHieuLuc: 30,
      soSachToiDa: 2,
      soNgayMuonToiDa: 14,
      mienTienCoc: true
    });

    // Tạo gói thành viên Normal: giới hạn 5 cuốn, KHÔNG miễn tiền cọc
    const normalPlan = await MembershipPlan.create({
      maGoi: await nextCode('membershipPlan'),
      tenGoi: 'Normal Member',
      giaTien: 50000,
      soNgayHieuLuc: 30,
      soSachToiDa: 5,
      soNgayMuonToiDa: 7,
      mienTienCoc: false
    });

    // 2. Tạo độc giả A (gói VIP)
    const readerVIP = await Reader.create({
      hoLot: 'Lê Hoàng',
      ten: 'VIP',
      email: 'vip@library.local',
      matKhau: 'reader123',
      ngaySinh: new Date('1998-01-01'),
      diachi: 'Hải Phòng',
      dienThoai: '0966666666'
    });

    await Subscription.create({
      maDangKy: await nextCode('subscription'),
      docGia: readerVIP._id,
      goiDocGia: vipPlan._id,
      ngayBatDau: new Date(),
      ngayKetThuc: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      tongTien: 100000,
      trangThai: 'DANG_HIEU_LUC'
    });

    // Tạo độc giả B (gói Normal)
    const readerNormal = await Reader.create({
      hoLot: 'Lê Hoàng',
      ten: 'Normal',
      email: 'normal@library.local',
      matKhau: 'reader123',
      ngaySinh: new Date('1998-01-01'),
      diachi: 'Quảng Ninh',
      dienThoai: '0955555555'
    });

    await Subscription.create({
      maDangKy: await nextCode('subscription'),
      docGia: readerNormal._id,
      goiDocGia: normalPlan._id,
      ngayBatDau: new Date(),
      ngayKetThuc: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      tongTien: 50000,
      trangThai: 'DANG_HIEU_LUC'
    });

    // 3. Test hạn mức mượn tối đa của độc giả VIP (chỉ cho phép mượn tối đa 2 cuốn)
    const bookTitle = await BookTitle.findOne({ tenSach: 'Kính Vạn Hoa' });
    const copies = await BookCopy.find({ dauSach: bookTitle._id, tinhTrang: 'CHO_MUON' });

    // Tạo phiếu mượn 3 cuốn cùng lúc cho độc giả VIP
    const borrowOverLimit = new BorrowReceipt({
      docGia: readerVIP._id,
      chiTietMuon: [
        { sach: copies[0]._id, tinhTrangLucMuon: 'Tốt' },
        { sach: copies[1]._id, tinhTrangLucMuon: 'Tốt' },
        { sach: copies[2]._id, tinhTrangLucMuon: 'Tốt' }
      ],
      ngayHenTra: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    await assert.rejects(
      borrowOverLimit.save(),
      /vượt quá giới hạn/i,
      'Phải ném ra lỗi vượt quá giới hạn số sách tối đa của gói thẻ'
    );

    // 4. Test tự động tính tiền cọc cho độc giả VIP (được miễn cọc -> cọc = 0)
    const borrowVIP = new BorrowReceipt({
      docGia: readerVIP._id,
      chiTietMuon: [
        { sach: copies[0]._id, tinhTrangLucMuon: 'Tốt' },
        { sach: copies[1]._id, tinhTrangLucMuon: 'Tốt' }
      ],
      ngayHenTra: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    
    // Gán tiền cọc linh tinh để xem backend có tự động ghi đè về 0 không
    borrowVIP.tienCoc = 999999;
    await borrowVIP.save();
    assert.strictEqual(borrowVIP.tienCoc, 0, 'Tiền cọc của hội viên VIP được miễn cọc phải tự động gán về 0');

    // 5. Test tự động tính tiền cọc cho độc giả Normal (không được miễn cọc -> cọc = tổng giá bìa)
    const borrowNormal = new BorrowReceipt({
      docGia: readerNormal._id,
      chiTietMuon: [
        { sach: copies[2]._id, tinhTrangLucMuon: 'Tốt' },
        { sach: copies[3]._id, tinhTrangLucMuon: 'Tốt' }
      ],
      ngayHenTra: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    borrowNormal.tienCoc = 0; // Gán bằng 0 để xem backend có tự động ghi đè thành giá bìa không
    await borrowNormal.save();
    
    const expectedDeposit = bookTitle.giaBia * 2; // vì mượn 2 cuốn cùng đầu sách Kính Vạn Hoa
    assert.strictEqual(borrowNormal.tienCoc, expectedDeposit, `Tiền cọc của hội viên Normal phải tự động tính bằng tổng giá bìa (${expectedDeposit})`);
  });

  test('9. Kiểm tra Cascade Soft-delete/Discontinue đầu sách ảnh hưởng đến sách vật lý', async () => {
    // 1. Tạo một đầu sách mới đặc biệt để test cascade
    const author = await Author.findOne();
    const category = await Category.findOne();
    const publisher = await Publisher.findOne();

    const specialTitle = await createBookTitle({
      tenSach: 'Đầu Sách Test Cascade',
      tacGia: [author._id],
      nhaXuatBan: publisher._id,
      theLoai: category._id,
      namSanXuat: 2024,
      tongSoLuong: 3,
      giaBia: 150000
    });

    // Xác nhận đã có 3 cuốn sách vật lý ở trạng thái CHO_MUON
    const copiesBefore = await BookCopy.find({ dauSach: specialTitle._id });
    assert.strictEqual(copiesBefore.length, 3);
    copiesBefore.forEach(c => {
      assert.strictEqual(c.tinhTrang, 'CHO_MUON');
      assert.strictEqual(c.isDeleted, false);
    });

    // 2. Chuyển trạng thái đầu sách thành DISCONTINUED để ngừng phục vụ
    specialTitle.trangThai = 'DISCONTINUED';
    await specialTitle.save();

    // 3. Xác thực: Toàn bộ sách vật lý tự động chuyển sang BAO_TRI và isDeleted = true
    const copiesAfter = await BookCopy.find({ dauSach: specialTitle._id });
    assert.strictEqual(copiesAfter.length, 3);
    copiesAfter.forEach(c => {
      assert.strictEqual(c.tinhTrang, 'BAO_TRI', 'Tất cả các bản sao vật lý phải chuyển trạng thái thành BAO_TRI');
      assert.strictEqual(c.isDeleted, true, 'Tất cả các bản sao vật lý phải bị đánh dấu isDeleted = true');
    });

    // Xác thực: soLuongKhaDung của đầu sách phải bị gán về 0
    assert.strictEqual(specialTitle.soLuongKhaDung, 0, 'soLuongKhaDung của đầu sách bị ngừng phục vụ phải bằng 0');
  });

  test('10. Kiểm tra chặn hủy phiếu sau khi sách đã được giao', async () => {
    const bookTitle = await BookTitle.findOne({ tenSach: 'Kính Vạn Hoa' });
    // Reset trạng thái sách vật lý và tồn kho để chạy test độc lập
    await BookCopy.updateMany({ dauSach: bookTitle._id }, { $set: { tinhTrang: 'CHO_MUON' } });
    await BookTitle.findByIdAndUpdate(bookTitle._id, { $set: { soLuongKhaDung: 5 } });
    bookTitle.soLuongKhaDung = 5;

    const copies = await BookCopy.find({ dauSach: bookTitle._id, tinhTrang: 'CHO_MUON' });
    
    // Tạo độc giả mới để tránh bị trùng hạn mức mượn từ test case trước
    const readerCancel = await Reader.create({
      hoLot: 'Nguyễn Văn',
      ten: 'Hủy Phiếu',
      email: 'cancel_test@library.local',
      matKhau: 'reader123',
      ngaySinh: new Date('2000-01-01'),
      diachi: 'Đà Nẵng',
      dienThoai: '0911222333'
    });
    const defaultPlan = await MembershipPlan.findOne({ tenGoi: 'Default Member' });
    await Subscription.create({
      maDangKy: await nextCode('subscription'),
      docGia: readerCancel._id,
      goiDocGia: defaultPlan._id,
      ngayBatDau: new Date(),
      ngayKetThuc: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      tongTien: 0,
      trangThai: 'DANG_HIEU_LUC'
    });

    const copyToBorrow = copies[0];
    const initialAvailableCount = 5;

    // 1. Tạo phiếu mượn mới (DANG_MUON)
    const borrow = new BorrowReceipt({
      docGia: readerCancel._id,
      chiTietMuon: [{ sach: copyToBorrow._id, tinhTrangLucMuon: 'Mới' }],
      ngayHenTra: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    await borrow.save();

    // Xác nhận đã trừ tồn kho và đổi trạng thái cuốn sách
    const copyBorrowed = await BookCopy.findById(copyToBorrow._id);
    assert.strictEqual(copyBorrowed.tinhTrang, 'DA_MUON');
    const titleBorrowed = await BookTitle.findById(bookTitle._id);
    assert.strictEqual(titleBorrowed.soLuongKhaDung, initialAvailableCount - 1);

    // 2. Cập nhật phiếu mượn sang trạng thái HUY sau khi sách đã giao phải bị chặn
    borrow.trangThai = 'HUY';
    await assert.rejects(
      borrow.save(),
      /không được hủy phiếu mượn/i,
      'Không được hủy phiếu đã phát sinh sách đang mượn'
    );

    // 3. Xác thực: Cuốn sách vật lý vẫn đang được mượn, không tự hoàn kho bằng thao tác hủy
    const copyCancelled = await BookCopy.findById(copyToBorrow._id);
    assert.strictEqual(copyCancelled.tinhTrang, 'DA_MUON', 'Trạng thái cuốn sách vật lý vẫn phải là DA_MUON');

    // 4. Xác thực: Tồn kho không bị hoàn lại sai nghiệp vụ
    const titleCancelled = await BookTitle.findById(bookTitle._id);
    assert.strictEqual(titleCancelled.soLuongKhaDung, initialAvailableCount - 1, 'Tồn kho đầu sách không được hoàn lại khi hủy bị chặn');
  });

  test('11. Kiểm tra chặn chỉnh sửa chi tiết mượn sách sau khi đã lưu', async () => {
    const bookTitle = await BookTitle.findOne({ tenSach: 'Kính Vạn Hoa' });
    // Reset trạng thái sách vật lý để chạy test độc lập
    await BookCopy.updateMany({ dauSach: bookTitle._id }, { $set: { tinhTrang: 'CHO_MUON' } });
    await BookTitle.findByIdAndUpdate(bookTitle._id, { $set: { soLuongKhaDung: 5 } });

    const copies = await BookCopy.find({ dauSach: bookTitle._id, tinhTrang: 'CHO_MUON' });

    // Tạo độc giả mới để tránh bị trùng hạn mức mượn từ test case trước
    const readerNoEdit = await Reader.create({
      hoLot: 'Trần Văn',
      ten: 'Chặn Sửa',
      email: 'noedit_test@library.local',
      matKhau: 'reader123',
      ngaySinh: new Date('2000-01-01'),
      diachi: 'Huế',
      dienThoai: '0922333444'
    });
    const defaultPlan = await MembershipPlan.findOne({ tenGoi: 'Default Member' });
    await Subscription.create({
      maDangKy: await nextCode('subscription'),
      docGia: readerNoEdit._id,
      goiDocGia: defaultPlan._id,
      ngayBatDau: new Date(),
      ngayKetThuc: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      tongTien: 0,
      trangThai: 'DANG_HIEU_LUC'
    });

    const borrow = new BorrowReceipt({
      docGia: readerNoEdit._id,
      chiTietMuon: [{ sach: copies[0]._id, tinhTrangLucMuon: 'Tốt' }],
      ngayHenTra: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    await borrow.save();

    // Cố tình chỉnh sửa chi tiết sách mượn
    borrow.chiTietMuon.push({ sach: copies[1]._id, tinhTrangLucMuon: 'Tốt' });

    // Mong đợi: Việc lưu lại phải báo lỗi
    await assert.rejects(
      borrow.save(),
      /không được phép thêm\/xóa/i,
      'Phải ném lỗi ngăn cản thêm/xóa sách trong phiếu mượn đã tạo'
    );
  });

  test('12. Kiểm tra tự động băm mật khẩu PBKDF2 có salt trước khi lưu Reader', async () => {
    const rawPassword = 'mySecurePassword123';
    const reader = new Reader({
      hoLot: 'Nguyễn',
      ten: 'Mã Hóa',
      email: 'hash_test@library.local',
      matKhau: rawPassword,
      ngaySinh: new Date('1995-01-01'),
      diachi: 'Bình Dương',
      dienThoai: '0912111222'
    });

    await reader.save();

    assert.notStrictEqual(reader.matKhau, rawPassword, 'Mật khẩu lưu trong DB không được lưu ở dạng plain text');
    
    assert.match(reader.matKhau, /^pbkdf2\$100000\$[a-f0-9]{32}\$[a-f0-9]{128}$/, 'Mật khẩu phải được băm bằng PBKDF2 có salt');
  });

  test('13. Kiểm tra tự động tính ngày trễ và tạo phiếu phạt PenaltyTicket khi trả sách muộn', async () => {
    const bookTitle = await BookTitle.findOne({ tenSach: 'Kính Vạn Hoa' });
    const copies = await BookCopy.find({ dauSach: bookTitle._id, tinhTrang: 'CHO_MUON' });
    
    const staff = await Staff.create({
      hoTenNV: 'Thủ Thư Phạt',
      email: 'fine_staff@library.local',
      matKhau: 'staff123',
      diachi: 'Huế',
      soDienThoai: '0944333222'
    });

    const reader = await Reader.create({
      hoLot: 'Lê',
      ten: 'Trễ Hạn',
      email: 'late@library.local',
      matKhau: 'reader123',
      ngaySinh: new Date('1990-01-01'),
      diachi: 'Đồng Nai',
      dienThoai: '0901234567'
    });

    const defaultPlan = await MembershipPlan.findOne({ tenGoi: 'Default Member' });
    await Subscription.create({
      maDangKy: await nextCode('subscription'),
      docGia: reader._id,
      goiDocGia: defaultPlan._id,
      ngayBatDau: new Date(),
      ngayKetThuc: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      tongTien: 0,
      trangThai: 'DANG_HIEU_LUC'
    });

    // 1. Tạo phiếu mượn nhưng gán ngayHenTra lùi lại 3 ngày so với hôm nay
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const borrow = new BorrowReceipt({
      docGia: reader._id,
      nhanVien: staff._id,
      chiTietMuon: [{ sach: copies[0]._id, tinhTrangLucMuon: 'Tốt' }],
      ngayMuon: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      ngayHenTra: threeDaysAgo
    });
    await borrow.save();

    // 2. Cập nhật phiếu mượn sang trạng thái DA_TRA để trả sách hôm nay
    borrow.trangThai = 'DA_TRA';
    borrow.ngayTraThucTe = new Date();
    await borrow.save();

    // 3. Xác thực: Tự động sinh ra phiếu phạt PenaltyTicket trong DB
    const penalty = await PenaltyTicket.findOne({ phieuMuon: borrow._id });
    assert.ok(penalty, 'Hệ thống phải tự động tạo phiếu phạt PenaltyTicket trong DB');
    // Trễ hạn từ Wed Jul 22 đến Sat Jul 25 là 4 ngày, mức phạt 5.000đ/ngày -> 20.000đ
    assert.strictEqual(penalty.soTienPhat, 20000, `Số tiền phạt phải là 20.000đ (thực tế: ${penalty.soTienPhat})`);
    assert.strictEqual(penalty.daThanhToan, false, 'Phiếu phạt mới tạo phải ở trạng thái chưa thanh toán');
  });

  test('14. Kiểm tra tự động đồng bộ tồn kho khả dụng đầu sách khi sách vật lý bị hỏng/mất hoặc bị xóa', async () => {
    const bookTitle = await BookTitle.findOne({ tenSach: 'Kính Vạn Hoa' });
    // Reset tồn kho và trạng thái về CHO_MUON
    await BookCopy.updateMany({ dauSach: bookTitle._id }, { $set: { tinhTrang: 'CHO_MUON', isDeleted: false } });
    await BookTitle.findByIdAndUpdate(bookTitle._id, { $set: { soLuongKhaDung: 5 } });
    bookTitle.soLuongKhaDung = 5;

    const copies = await BookCopy.find({ dauSach: bookTitle._id });
    const targetCopy = copies[0];

    // 1. Chuyển cuốn sách sang trạng thái BAO_TRI
    targetCopy.tinhTrang = 'BAO_TRI';
    await targetCopy.save();

    // Xác thực: Tồn kho khả dụng giảm từ 5 xuống 4
    let titleAfterUpdate = await BookTitle.findById(bookTitle._id);
    assert.strictEqual(titleAfterUpdate.soLuongKhaDung, 4, 'Tồn kho khả dụng phải giảm đi 1 khi sách bị bảo trì');

    // 2. Chuyển cuốn sách sang trạng thái MAT
    targetCopy.tinhTrang = 'MAT';
    await targetCopy.save();

    // Xác thực: Tồn kho khả dụng vẫn phải giữ là 4
    titleAfterUpdate = await BookTitle.findById(bookTitle._id);
    assert.strictEqual(titleAfterUpdate.soLuongKhaDung, 4, 'Tồn kho khả dụng phải giữ nguyên khi chuyển từ bảo trì sang mất');

    // 3. Chuyển cuốn sách quay trở lại CHO_MUON
    targetCopy.tinhTrang = 'CHO_MUON';
    await targetCopy.save();

    // Xác thực: Tồn kho khả dụng tăng lại lên 5
    titleAfterUpdate = await BookTitle.findById(bookTitle._id);
    assert.strictEqual(titleAfterUpdate.soLuongKhaDung, 5, 'Tồn kho khả dụng phải tăng lại 1 khi sách sửa xong');

    // 4. Xóa mềm cuốn sách
    targetCopy.isDeleted = true;
    targetCopy.deletedAt = new Date();
    await targetCopy.save();

    // Xác thực: Tồn kho khả dụng giảm về 4
    titleAfterUpdate = await BookTitle.findById(bookTitle._id);
    assert.strictEqual(titleAfterUpdate.soLuongKhaDung, 4, 'Tồn kho khả dụng phải giảm đi 1 khi sách bị xóa mềm');
  });

  test('15. Kiểm tra tự động hủy gói cũ khi độc giả mua gói thành viên mới', async () => {
    const reader = await Reader.create({
      hoLot: 'Lê',
      ten: 'Trùng Gói',
      email: 'double_sub@library.local',
      matKhau: 'reader123',
      ngaySinh: new Date('1990-01-01'),
      diachi: 'Đồng Nai',
      dienThoai: '0901234999'
    });

    const vipPlan = await MembershipPlan.findOne({ tenGoi: 'VIP Member' });
    const normalPlan = await MembershipPlan.findOne({ tenGoi: 'Normal Member' });

    // 1. Tạo gói VIP đang hiệu lực
    const firstSub = await Subscription.create({
      maDangKy: await nextCode('subscription'),
      docGia: reader._id,
      goiDocGia: vipPlan._id,
      ngayBatDau: new Date(),
      ngayKetThuc: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      tongTien: 100000,
      trangThai: 'DANG_HIEU_LUC'
    });

    // 2. Đăng ký tiếp gói Normal
    const secondSub = await Subscription.create({
      maDangKy: await nextCode('subscription'),
      docGia: reader._id,
      goiDocGia: normalPlan._id,
      ngayBatDau: new Date(),
      ngayKetThuc: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      tongTien: 50000,
      trangThai: 'DANG_HIEU_LUC'
    });

    // 3. Xác thực: Gói VIP cũ tự động chuyển thành HUY
    const updatedFirstSub = await Subscription.findById(firstSub._id);
    assert.strictEqual(updatedFirstSub.trangThai, 'HUY', 'Gói subscription cũ phải tự động chuyển thành HUY khi đăng ký gói mới');
    assert.strictEqual(secondSub.trangThai, 'DANG_HIEU_LUC');
  });

  test('16. Kiểm tra chặn xóa độc giả đang nợ sách hoặc nợ tiền phạt chưa thanh toán', async () => {
    const readerDebt = await Reader.create({
      hoLot: 'Lê',
      ten: 'Nợ Nần',
      email: 'debt@library.local',
      matKhau: 'reader123',
      ngaySinh: new Date('1990-01-01'),
      diachi: 'Đồng Nai',
      dienThoai: '0901234888'
    });

    const staff = await Staff.create({
      hoTenNV: 'Thủ Thư Nợ',
      email: 'debt_staff@library.local',
      matKhau: 'staff123',
      diachi: 'Huế',
      soDienThoai: '0944333221'
    });

    const bookTitle = await BookTitle.findOne({ tenSach: 'Kính Vạn Hoa' });
    // Reset BookCopy
    await BookCopy.updateMany({ dauSach: bookTitle._id }, { $set: { tinhTrang: 'CHO_MUON', isDeleted: false } });
    const copies = await BookCopy.find({ dauSach: bookTitle._id, tinhTrang: 'CHO_MUON' });
    const defaultPlan = await MembershipPlan.findOne({ tenGoi: 'Default Member' });
    
    await Subscription.create({
      maDangKy: await nextCode('subscription'),
      docGia: readerDebt._id,
      goiDocGia: defaultPlan._id,
      ngayBatDau: new Date(),
      ngayKetThuc: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      tongTien: 0,
      trangThai: 'DANG_HIEU_LUC'
    });

    // 1. Độc giả mượn sách, gán ngày mượn là 10 ngày trước, hẹn trả là 5 ngày trước
    const borrow = new BorrowReceipt({
      docGia: readerDebt._id,
      nhanVien: staff._id,
      chiTietMuon: [{ sach: copies[0]._id, tinhTrangLucMuon: 'Tốt' }],
      ngayMuon: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      ngayHenTra: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    });
    await borrow.save();

    // Thử xóa độc giả
    readerDebt.isDeleted = true;
    readerDebt.deletedAt = new Date();
    await assert.rejects(
      readerDebt.save(),
      /nợ sách/i,
      'Phải ném lỗi ngăn cản xóa độc giả đang nợ sách chưa trả'
    );

    // 2. Trả sách để chuyển sang trạng thái nợ tiền phạt do trễ hạn
    borrow.trangThai = 'DA_TRA';
    borrow.ngayTraThucTe = new Date();
    await borrow.save();

    // Xác nhận đã có phiếu phạt
    const penalty = await PenaltyTicket.findOne({ phieuMuon: borrow._id });
    assert.ok(penalty);
    assert.strictEqual(penalty.daThanhToan, false);

    // Thử xóa độc giả
    readerDebt.isDeleted = true;
    readerDebt.deletedAt = new Date();
    await assert.rejects(
      readerDebt.save(),
      /tiền phạt/i,
      'Phải ném lỗi ngăn cản xóa độc giả đang nợ tiền phạt chưa thanh toán'
    );

    // 3. Thanh toán tiền phạt và thử xóa lại
    penalty.daThanhToan = true;
    await penalty.save();

    readerDebt.isDeleted = true;
    readerDebt.deletedAt = new Date();
    await readerDebt.save(); // Phải xóa thành công!

    assert.strictEqual(readerDebt.isDeleted, true);
    
    // Gói subscription cũ của độc giả cũng phải tự động chuyển thành HUY
    const sub = await Subscription.findOne({ docGia: readerDebt._id });
    assert.strictEqual(sub.trangThai, 'HUY', 'Gói thẻ của độc giả phải bị hủy khi xóa tài khoản');
  });

  test('17. Kiểm tra chặn xóa/cập nhật cuốn sách vật lý khi đang được mượn', async () => {
    const bookTitle = await BookTitle.findOne({ tenSach: 'Kính Vạn Hoa' });
    // Reset BookCopy
    await BookCopy.updateMany({ dauSach: bookTitle._id }, { $set: { tinhTrang: 'CHO_MUON', isDeleted: false } });
    const copies = await BookCopy.find({ dauSach: bookTitle._id, tinhTrang: 'CHO_MUON' });
    const targetCopy = copies[0];

    const reader = await Reader.create({
      hoLot: 'Lê',
      ten: 'Mượn Sách Tranh Chấp',
      email: 'borrow_dispute@library.local',
      matKhau: 'reader123',
      ngaySinh: new Date('1990-01-01'),
      diachi: 'Đồng Nai',
      dienThoai: '0901234777'
    });

    const defaultPlan = await MembershipPlan.findOne({ tenGoi: 'Default Member' });
    await Subscription.create({
      maDangKy: await nextCode('subscription'),
      docGia: reader._id,
      goiDocGia: defaultPlan._id,
      ngayBatDau: new Date(),
      ngayKetThuc: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      tongTien: 0,
      trangThai: 'DANG_HIEU_LUC'
    });

    // 1. Mượn cuốn sách
    const borrow = new BorrowReceipt({
      docGia: reader._id,
      chiTietMuon: [{ sach: targetCopy._id, tinhTrangLucMuon: 'Tốt' }],
      ngayHenTra: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    await borrow.save();

    // 2. Thử xóa mềm cuốn sách vật lý này khi nó đang ở trạng thái DA_MUON
    const copyInDB = await BookCopy.findById(targetCopy._id);
    assert.strictEqual(copyInDB.tinhTrang, 'DA_MUON');

    copyInDB.isDeleted = true;
    copyInDB.deletedAt = new Date();
    await assert.rejects(
      copyInDB.save(),
      /đang được độc giả mượn/i,
      'Phải ném lỗi ngăn cản xóa cuốn sách vật lý đang được mượn'
    );

    // 3. Thử chuyển trạng thái sang BAO_TRI trực tiếp
    copyInDB.isDeleted = false;
    copyInDB.tinhTrang = 'BAO_TRI';
    await assert.rejects(
      copyInDB.save(),
      /đang được độc giả mượn/i,
      'Phải ném lỗi ngăn cản cập nhật cuốn sách vật lý đang được mượn sang bảo trì'
    );
  });

  test('18. Kiểm tra chặn ngừng phục vụ/xóa đầu sách khi có bản sao vật lý đang được mượn', async () => {
    const bookTitle = await BookTitle.findOne({ tenSach: 'Kính Vạn Hoa' });
    // Reset BookCopy
    await BookCopy.updateMany({ dauSach: bookTitle._id }, { $set: { tinhTrang: 'CHO_MUON', isDeleted: false } });
    const copies = await BookCopy.find({ dauSach: bookTitle._id, tinhTrang: 'CHO_MUON' });
    const targetCopy = copies[0];

    const reader = await Reader.create({
      hoLot: 'Lê',
      ten: 'Mượn Đầu Sách Tranh Chấp',
      email: 'title_dispute@library.local',
      matKhau: 'reader123',
      ngaySinh: new Date('1990-01-01'),
      diachi: 'Đồng Nai',
      dienThoai: '0901234666'
    });

    const defaultPlan = await MembershipPlan.findOne({ tenGoi: 'Default Member' });
    await Subscription.create({
      maDangKy: await nextCode('subscription'),
      docGia: reader._id,
      goiDocGia: defaultPlan._id,
      ngayBatDau: new Date(),
      ngayKetThuc: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      tongTien: 0,
      trangThai: 'DANG_HIEU_LUC'
    });

    // 1. Mượn cuốn sách của đầu sách này
    const borrow = new BorrowReceipt({
      docGia: reader._id,
      chiTietMuon: [{ sach: targetCopy._id, tinhTrangLucMuon: 'Tốt' }],
      ngayHenTra: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    await borrow.save();

    // 2. Thử ngừng phục vụ đầu sách (DISCONTINUED) khi có sách vật lý đang được mượn -> Phải thành công (Drain Strategy)
    bookTitle.trangThai = 'DISCONTINUED';
    await bookTitle.save();
    
    // Bản sao đang mượn vẫn được giữ nguyên
    const borrowedCopy = await BookCopy.findById(targetCopy._id);
    assert.strictEqual(borrowedCopy.tinhTrang, 'DA_MUON');
    assert.strictEqual(borrowedCopy.isDeleted, false);

    // Bản sao rảnh rỗi khác tự động chuyển sang BAO_TRI và bị xóa mềm
    const freeCopy = await BookCopy.findById(copies[1]._id);
    assert.strictEqual(freeCopy.tinhTrang, 'BAO_TRI');
    assert.strictEqual(freeCopy.isDeleted, true);

    // 3. Thử xóa mềm đầu sách khi vẫn còn bản sao đang mượn -> Phải bị chặn và ném lỗi
    bookTitle.isDeleted = true;
    bookTitle.deletedAt = new Date();
    await assert.rejects(
      bookTitle.save(),
      /đang được mượn/i,
      'Phải ném lỗi ngăn cản xóa mềm đầu sách khi có sách đang được mượn'
    );
  });

  test('19. Kiểm tra trả sách từng cuốn riêng lẻ (Partial Return) với phiếu phạt theo từng cuốn', async () => {
    const bookTitle = await BookTitle.findOne({ tenSach: 'Kính Vạn Hoa' });
    // Reset trạng thái sách vật lý
    await BookCopy.updateMany({ dauSach: bookTitle._id }, { $set: { tinhTrang: 'CHO_MUON', isDeleted: false } });
    await BookTitle.findByIdAndUpdate(bookTitle._id, { $set: { soLuongKhaDung: 5, trangThai: 'ACTIVE', isDeleted: false } });

    const copies = await BookCopy.find({ dauSach: bookTitle._id, tinhTrang: 'CHO_MUON' }).limit(3);
    const staff = await Staff.findOne({});

    // Tạo độc giả mới
    const readerPartial = await Reader.create({
      hoLot: 'Phạm Văn',
      ten: 'Trả Lẻ',
      email: 'partial_return@library.local',
      matKhau: 'reader123',
      ngaySinh: new Date('1995-01-01'),
      diachi: 'Cần Thơ',
      dienThoai: '0908765432'
    });
    const defaultPlan = await MembershipPlan.findOne({ tenGoi: 'Default Member' });
    await Subscription.create({
      maDangKy: await nextCode('subscription'),
      docGia: readerPartial._id,
      goiDocGia: defaultPlan._id,
      ngayBatDau: new Date(),
      ngayKetThuc: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      tongTien: 0,
      trangThai: 'DANG_HIEU_LUC'
    });

    // 1. Mượn 3 cuốn, hẹn trả 3 ngày trước (để mô phỏng trễ hạn)
    const ngayHenTra = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const borrow = new BorrowReceipt({
      docGia: readerPartial._id,
      nhanVien: staff._id,
      chiTietMuon: [
        { sach: copies[0]._id, tinhTrangLucMuon: 'Tốt' },
        { sach: copies[1]._id, tinhTrangLucMuon: 'Tốt' },
        { sach: copies[2]._id, tinhTrangLucMuon: 'Tốt' }
      ],
      ngayMuon: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      ngayHenTra: ngayHenTra
    });
    await borrow.save();

    // Xác nhận tồn kho giảm 3
    let titleAfter = await BookTitle.findById(bookTitle._id);
    assert.strictEqual(titleAfter.soLuongKhaDung, 2, 'Tồn kho phải giảm 3 khi mượn 3 cuốn');
    assert.strictEqual(borrow.trangThai, 'DANG_MUON');

    // 2. Trả cuốn 1 đúng hạn (ngày trả TRƯỚC hẹn trả - không phạt)
    const ngayTraDungHan = new Date(ngayHenTra.getTime() - 1 * 24 * 60 * 60 * 1000);
    borrow.chiTietMuon[0].daTraChua = true;
    borrow.chiTietMuon[0].ngayTraThucTe = ngayTraDungHan;
    await borrow.save();

    // Xác nhận: Cuốn 1 đã giải phóng, phiếu vẫn DANG_MUON
    const copy0After = await BookCopy.findById(copies[0]._id);
    assert.strictEqual(copy0After.tinhTrang, 'CHO_MUON', 'Cuốn 1 phải trở về CHO_MUON sau khi trả');
    titleAfter = await BookTitle.findById(bookTitle._id);
    assert.strictEqual(titleAfter.soLuongKhaDung, 3, 'Tồn kho phải tăng 1 sau khi trả cuốn 1');
    assert.strictEqual(borrow.trangThai, 'DANG_MUON', 'Phiếu vẫn phải ở trạng thái DANG_MUON vì chưa trả hết');

    // Không có phiếu phạt vì trả đúng hạn
    const penaltiesSoFar = await PenaltyTicket.find({ phieuMuon: borrow._id });
    assert.strictEqual(penaltiesSoFar.length, 0, 'Không được tạo phiếu phạt khi trả đúng hạn');

    // 3. Trả cuốn 2 trễ 4 ngày (phạt 20.000đ)
    borrow.chiTietMuon[1].daTraChua = true;
    borrow.chiTietMuon[1].ngayTraThucTe = new Date(); // Hôm nay - trễ ~3-4 ngày
    await borrow.save();

    const copy1After = await BookCopy.findById(copies[1]._id);
    assert.strictEqual(copy1After.tinhTrang, 'CHO_MUON', 'Cuốn 2 phải trở về CHO_MUON sau khi trả');
    titleAfter = await BookTitle.findById(bookTitle._id);
    assert.strictEqual(titleAfter.soLuongKhaDung, 4, 'Tồn kho phải tăng thêm 1 sau khi trả cuốn 2');
    assert.strictEqual(borrow.trangThai, 'DANG_MUON', 'Phiếu vẫn DANG_MUON vì còn cuốn 3 chưa trả');

    // Phải có đúng 1 phiếu phạt cho cuốn 2 trả trễ
    const penaltiesAfter2 = await PenaltyTicket.find({ phieuMuon: borrow._id });
    assert.strictEqual(penaltiesAfter2.length, 1, 'Phải có đúng 1 phiếu phạt cho cuốn trả trễ');

    // 4. Trả cuốn 3 (cuốn cuối) → Auto-complete: phiếu tự chuyển sang DA_TRA
    borrow.chiTietMuon[2].daTraChua = true;
    borrow.chiTietMuon[2].ngayTraThucTe = new Date();
    await borrow.save();

    const copy2After = await BookCopy.findById(copies[2]._id);
    assert.strictEqual(copy2After.tinhTrang, 'CHO_MUON', 'Cuốn 3 phải trở về CHO_MUON sau khi trả');
    titleAfter = await BookTitle.findById(bookTitle._id);
    assert.strictEqual(titleAfter.soLuongKhaDung, 5, 'Tồn kho phải hoàn nguyên về 5 sau khi trả hết');
    assert.strictEqual(borrow.trangThai, 'DA_TRA', 'Phiếu phải tự động chuyển sang DA_TRA khi trả hết tất cả sách');

    // Phải có 2 phiếu phạt tổng cộng (cuốn 2 trễ + cuốn 3 trễ)
    const penaltiesFinal = await PenaltyTicket.find({ phieuMuon: borrow._id });
    assert.strictEqual(penaltiesFinal.length, 2, 'Phải có đúng 2 phiếu phạt (cuốn 2 + cuốn 3 trả trễ hạn)');
  });

});
