<!--
Chức năng: Hướng dẫn sử dụng Tool Cào Dữ Liệu Sách cho các agent khác
Lý do tạo: Tài liệu kỹ thuật để agent/developer khác có thể vận hành tool cào dữ liệu
-->

# 📚 Hướng Dẫn Sử Dụng Tool Cào Dữ Liệu Sách

## Mục đích

Tool cào dữ liệu sách (tên, tác giả, NXB, giá, ảnh bìa, mô tả, ISBN...) từ **Fahasa.com** và **nhasachphuongnam.com** để seed vào database Hệ thống Mượn Sách Online.

---

## Yêu cầu hệ thống

- **Node.js** >= 18
- **Chrome/Chromium** (Puppeteer tự cài khi `npm install`)
- Kết nối Internet ổn định

---

## Cài đặt

```bash
cd backend
npm install
```

Dependencies đã khai báo trong `package.json`:
- `axios` — HTTP client
- `cheerio` — HTML parser
- `puppeteer` + `puppeteer-extra` + `puppeteer-extra-plugin-stealth` — Headless browser (cho Fahasa)

---

## Cách chạy

### Cào cả 2 nguồn (mặc định 100 sách: 50 Fahasa + 50 Phương Nam)

```bash
cd backend
npm run scrape
```

### Chỉ cào 1 nguồn

```bash
npm run scrape:fahasa      # Chỉ Fahasa (50 sách)
npm run scrape:phuongnam   # Chỉ Phương Nam (50 sách)
```

### Tuỳ chỉnh số lượng

```bash
node src/scripts/scrapeBooks.js --max=20              # Cào 20 sách tổng
node src/scripts/scrapeBooks.js --source=fahasa --max=10  # 10 sách từ Fahasa
```

### Tham số CLI

| Tham số | Giá trị | Mặc định | Mô tả |
|:---|:---|:---|:---|
| `--source` | `fahasa`, `phuongnam`, `all` | `all` | Chọn nguồn cào |
| `--max` | Số nguyên | `100` | Tổng số sách tối đa |

---

## Output

Sau khi chạy, kết quả được lưu tại:

```
backend/src/scripts/output/
├── scraped_books.json       # Toàn bộ dữ liệu (cả 2 nguồn)
├── fahasa_books.json        # Riêng Fahasa
├── phuongnam_books.json     # Riêng Phương Nam
├── scrape_stats.json        # Thống kê kết quả
└── images/
    ├── fahasa/              # Ảnh bìa từ Fahasa
    └── phuongnam/           # Ảnh bìa từ Phương Nam
```

### Format JSON mỗi cuốn sách

```json
{
  "tenSach": "Nhà Giả Kim",
  "tacGia": ["Paulo Coelho"],
  "nhaXuatBan": "NXB Hội Nhà Văn",
  "theLoai": "Văn Học",
  "giaBia": 79000,
  "giaGoc": 89000,
  "hinhAnhUrl": "https://cdn1.fahasa.com/media/catalog/product/...",
  "hinhAnhLocal": "images/fahasa/nha-gia-kim.jpg",
  "moTa": "Tóm tắt nội dung sách...",
  "isbn": "9786043651027",
  "namSanXuat": 2024,
  "url": "https://www.fahasa.com/nha-gia-kim.html",
  "nguon": "fahasa"
}
```

### Mapping sang BookTitle Schema

| Field JSON | Field BookTitle Schema | Ghi chú |
|:---|:---|:---|
| `tenSach` | `tenSach` | Tên đầu sách |
| `tacGia` | Lookup/Create `Author` | Mảng tên tác giả |
| `nhaXuatBan` | Lookup/Create `Publisher` | Tên NXB |
| `theLoai` | Lookup/Create `Category` | Thể loại sách |
| `giaBia` | `giaBia` | Giá bán (VNĐ) |
| `hinhAnhLocal` | `hinhAnh` | Đường dẫn ảnh local |
| `hinhAnhUrl` | `hinhAnhUrl` | URL ảnh gốc (backup) |
| `moTa` | `moTa` | Mô tả sách (max 1000 ký tự) |
| `isbn` | `isbn` | Mã ISBN |
| `namSanXuat` | `namSanXuat` | Năm xuất bản |

---

## Kiến trúc code

```
backend/src/scripts/
├── scrapeBooks.js              # Entry point - điều phối cào 2 nguồn
└── scrapers/
    ├── utils.js                # Pure functions: HTTP, parse, download
    ├── fahasaScraper.js        # Scraper Fahasa (Puppeteer + Cheerio)
    └── phuongnamScraper.js     # Scraper Phương Nam (JSON API + Cheerio)
```

### Chiến lược theo nguồn

| Nguồn | Phương pháp | Lý do |
|:---|:---|:---|
| **Fahasa** | Puppeteer (headless browser) | Cloudflare chặn HTTP request thường → cần browser thật |
| **Phương Nam** | Axios + JSON API | Haravan có API tại `/products/{handle}.json` → nhanh, dữ liệu sạch |

---

## Xử lý lỗi

- **Fahasa 403**: Puppeteer + Stealth plugin tự bypass. Nếu vẫn lỗi → tăng delay hoặc chạy lại
- **Timeout**: Script tự retry 3 lần với backoff tăng dần
- **Crash giữa chừng**: Dữ liệu đã cào sẽ tự lưu vào `scraped_books_partial.json`
- **Rate limit**: Delay ngẫu nhiên 1-4s giữa các request

---

## Thời gian ước tính

| Nguồn | Số sách | Thời gian |
|:---|:---|:---|
| Phương Nam | 50 | ~2-3 phút |
| Fahasa | 50 | ~5-8 phút |
| **Cả 2** | **100** | **~8-12 phút** |

---

## Mở rộng

### Thêm nguồn mới

1. Tạo file `scrapers/newSourceScraper.js`
2. Export function `scrapeNewSource({ maxBooks, imageDir })`
3. Import và gọi trong `scrapeBooks.js`

### Seed vào MongoDB

Đọc file `scraped_books.json` và dùng Mongoose để tạo documents:

```javascript
const books = require('./output/scraped_books.json');
const BookTitle = require('../models/BookTitle');

// Seed từng cuốn
for (const book of books) {
  await BookTitle.create({
    tenSach: book.tenSach,
    tacGia: book.tacGia,
    // ... map các field khác
  });
}
```

---

## Lưu ý quan trọng

> ⚠️ Tool chỉ dùng cho mục đích **học tập và seed dữ liệu demo**.
> Không sử dụng cho mục đích thương mại hoặc cào dữ liệu quy mô lớn.
