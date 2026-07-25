<!--
Chức năng: Báo cáo tính năng Tool Cào Dữ Liệu Sách
Lý do tạo: Ghi nhận chi tiết kết quả phát triển tool scraper theo quy tắc Reporting Requirement
-->

# Báo Cáo: Tool Cào Dữ Liệu Sách

## 1. Tổng Quan

Tool cào dữ liệu sách từ **Fahasa.com** và **nhasachphuongnam.com**, phục vụ seed dữ liệu cho Hệ thống Mượn Sách Online.

| Thông tin | Chi tiết |
|:---|:---|
| **Mục tiêu** | Cào ~100 đầu sách (50/nguồn) |
| **Nguồn** | Fahasa.com, nhasachphuongnam.com |
| **Tech stack** | Node.js, Puppeteer (Fahasa), Axios + Cheerio (Phương Nam) |
| **Output** | JSON files + ảnh bìa download local |

---

## 2. Files Đã Tạo / Thay Đổi

### Tạo mới

| File | Chức năng |
|:---|:---|
| `backend/src/scripts/scrapeBooks.js` | Script chính điều phối cào 2 nguồn |
| `backend/src/scripts/scrapers/fahasaScraper.js` | Scraper Fahasa (Puppeteer + Cheerio) |
| `backend/src/scripts/scrapers/phuongnamScraper.js` | Scraper Phương Nam (JSON API + Cheerio) |
| `backend/src/scripts/scrapers/utils.js` | Pure functions tiện ích (HTTP, parse, download) |
| `backend/src/scripts/output/` | Thư mục output (JSON + ảnh) |

### Thay đổi

| File | Thay đổi |
|:---|:---|
| `backend/package.json` | Thêm scripts: `scrape`, `scrape:fahasa`, `scrape:phuongnam` |

### Dependencies

```
axios@^1.18.1
cheerio@^1.2.0
puppeteer@latest
puppeteer-extra@latest
puppeteer-extra-plugin-stealth@latest
```

---

## 3. Kiến Trúc & Thiết Kế

### Chiến lược scrape theo từng nguồn

| Nguồn | Vấn đề | Giải pháp |
|:---|:---|:---|
| **Fahasa** | Cloudflare 403 block bot | Puppeteer + Stealth Plugin (headless browser) |
| **Phương Nam** | HTML metadata render bằng JS | Dùng Haravan JSON API (`/products/{handle}.json`) |

### Flow xử lý

```
List page → Lấy product URLs/handles
    ↓
Detail page / JSON API → Parse metadata (tên, tác giả, NXB, giá, ISBN...)
    ↓
Download ảnh bìa → Lưu local
    ↓
Xuất JSON files
```

### Output JSON Schema

```json
{
  "tenSach": "Nhà Giả Kim",
  "tacGia": ["Paulo Coelho"],
  "nhaXuatBan": "NXB Hội Nhà Văn",
  "theLoai": "Văn Học",
  "giaBia": 79000,
  "giaGoc": 89000,
  "hinhAnhUrl": "https://cdn1.fahasa.com/...",
  "hinhAnhLocal": "images/fahasa/nha-gia-kim.jpg",
  "moTa": "Tóm tắt nội dung...",
  "isbn": "9786043651027",
  "namSanXuat": 2024,
  "url": "https://www.fahasa.com/nha-gia-kim.html",
  "nguon": "fahasa"
}
```

---

## 4. Kết Quả Test

### Test Phương Nam (10 sách)
- ✅ Tên sách: 10/10
- ✅ Tác giả: 10/10
- ✅ Ảnh bìa: 10/10
- ✅ Mô tả: 10/10
- ⏱️ Thời gian: 21s

### Test Fahasa (3 sách)
- ✅ Tên sách: 3/3
- ✅ Tác giả: 3/3 (Dan Brown, Nguyễn Nhật Ánh)
- ✅ Ảnh bìa: 3/3
- ✅ Mô tả: 3/3
- ✅ ISBN: 3/3
- ⏱️ Thời gian: 33s

---

## 5. Lưu Ý & Rủi Ro

- Fahasa có Cloudflare → cần Puppeteer, chạy chậm hơn (2-4s/sách)
- NXB trên Fahasa có thể thiếu nếu trang không hiển thị
- Rate limiting: script có delay 1-4s giữa các request
- Chỉ dùng cho mục đích học tập / seed demo

---

## 6. Lệnh Verify

```bash
cd backend
npm run scrape                          # Cào cả 2 nguồn (100 sách)
npm run scrape:fahasa                   # Chỉ Fahasa
npm run scrape:phuongnam                # Chỉ Phương Nam
node src/scripts/scrapeBooks.js --max=5 # Test nhanh 5 sách
```
