<!--
Chuc nang: Bao cao bo sung cac API/nghiep vu con thieu cua backend he thong muon sach.
Ly do tao: Ghi nhan cac thay doi sau khi ra soat backend va hoan thien cac diem thieu quan trong.
-->

# Bo Sung Backend Missing APIs

## Mo ta
- Sua loi khoa/mo khoa doc gia dung enum `LOCKED` thay vi gia tri khong hop le.
- Bo sung API sua/xoa the loai sach.
- Bo sung trang thai phieu muon `CHO_DUYET` va API duyet phieu muon cho thu thu.
- Bo sung API gia han phieu muon co kiem tra quyen va gioi han goi hoi vien.
- Bo sung API tao phieu phat thu cong cho cac truong hop mat/hong sach.
- Cap nhat script test de chay toan bo test backend.

## Tep da thay doi
- `backend/src/modules/users/user.controller.js`
- `backend/src/modules/books/book.routes.js`
- `backend/src/modules/books/book.controller.js`
- `backend/src/modules/borrowing/borrowReceipt.model.js`
- `backend/src/modules/borrowing/borrow.service.js`
- `backend/src/modules/borrowing/borrow.routes.js`
- `backend/src/modules/borrowing/borrow.controller.js`
- `backend/package.json`

## API bo sung
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`
- `POST /api/borrowing/receipts/:id/approve`
- `POST /api/borrowing/receipts/:id/renew`
- `POST /api/borrowing/penalties`

## Kiem tra
- `npm run verify`
- `npm test`

Ket qua: 47/47 tests pass.
