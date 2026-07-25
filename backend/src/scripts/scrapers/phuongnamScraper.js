/**
 * Chức năng: Scraper chuyên biệt cho nhasachphuongnam.com sử dụng Haravan JSON API
 * Lý do tạo: Phương Nam dùng Haravan (Shopify-like) → có JSON API tại /products/{handle}.json
 *            Cung cấp dữ liệu sạch hơn HTML parsing (tên, giá, ảnh, vendor, body_html chứa metadata)
 * Link trích dẫn: https://nhasachphuongnam.com/collections/all
 */

const cheerio = require('cheerio');
const path = require('path');
const {
  fetchWithRetry,
  randomDelay,
  sanitizePrice,
  sanitizeFileName,
  cleanText,
  normalizeImageUrl,
  downloadImage,
  logProgress,
} = require('./utils');

// ============================================
// Config
// ============================================

const BASE_URL = 'https://nhasachphuongnam.com';

// Các collection page (đa dạng thể loại)
const COLLECTION_URLS = [
  { url: `${BASE_URL}/collections/van-hoc`, category: 'Văn Học' },
  { url: `${BASE_URL}/collections/kinh-te`, category: 'Kinh Tế' },
  { url: `${BASE_URL}/collections/ky-nang-song`, category: 'Kỹ Năng Sống' },
  { url: `${BASE_URL}/collections/thieu-nhi`, category: 'Thiếu Nhi' },
  { url: `${BASE_URL}/collections/khoa-hoc`, category: 'Khoa Học' },
  { url: `${BASE_URL}/collections/all`, category: 'Tổng Hợp' },
];

// ============================================
// Parse Functions (Pure)
// ============================================

/**
 * Parse danh sách product handle từ trang collection HTML
 * @param {string} html - HTML trang collection
 * @returns {string[]} - Danh sách product handles
 */
const parseProductHandles = (html) => {
  const $ = cheerio.load(html);
  const handles = [];

  // Lấy handle từ link sản phẩm (href="/products/{handle}")
  $('a.image_thumb, h3.product-name a').each((_, el) => {
    const href = $(el).attr('href') || '';
    const match = href.match(/\/products\/([^?#]+)/);
    if (match && match[1]) {
      handles.push(match[1]);
    }
  });

  return [...new Set(handles)];
};

/**
 * Parse metadata từ body_html (bảng MsoTableGrid) bằng cheerio
 * @param {string} bodyHtml - HTML của product body
 * @returns {object} - Key-value metadata
 */
const parseBodyHtmlMeta = (bodyHtml) => {
  if (!bodyHtml) return {};

  const $ = cheerio.load(bodyHtml);
  const meta = {};

  // Parse bảng thông số (table.MsoTableGrid hoặc bất kỳ table nào)
  $('table tr').each((_, row) => {
    const cells = $(row).find('td');
    if (cells.length >= 2) {
      const label = cleanText($(cells[0]).text()).replace(/:$/g, '').toLowerCase();
      const value = cleanText($(cells[1]).text());
      if (label && value) {
        meta[label] = value;
      }
    }
  });

  return meta;
};

/**
 * Trích xuất mô tả text sạch từ body_html (bỏ bảng thông số)
 * @param {string} bodyHtml
 * @returns {string}
 */
const extractDescription = (bodyHtml) => {
  if (!bodyHtml) return '';

  const $ = cheerio.load(bodyHtml);
  // Xóa bảng thông số để chỉ lấy mô tả
  $('table').remove();
  return cleanText($.text()).slice(0, 1000);
};

/**
 * Parse product JSON thành object sách chuẩn
 * @param {object} productJson - JSON từ API /products/{handle}.json
 * @param {string} category - Thể loại từ collection
 * @returns {object|null}
 */
const parseProductJson = (productJson, category) => {
  try {
    const product = productJson.product || productJson;
    if (!product || !product.title) return null;

    const tenSach = cleanText(product.title);

    // --- Hình ảnh (ảnh đầu tiên, chất lượng cao) ---
    const hinhAnhUrl = normalizeImageUrl(
      product.image?.src ||
      (product.images && product.images[0]?.src) || ''
    );

    // --- Giá (từ variant đầu tiên) ---
    const variant = product.variants?.[0] || {};
    const giaBia = parseInt(variant.price, 10) || 0;
    const giaGoc = parseInt(variant.compare_at_price, 10) || giaBia;

    // --- Parse metadata từ body_html ---
    const meta = parseBodyHtmlMeta(product.body_html);

    // --- Tác giả ---
    const tacGiaRaw = meta['tác giả'] || meta['tac gia'] || meta['author'] || '';
    const tacGia = tacGiaRaw
      .split(/[,;&]/)
      .map(cleanText)
      .filter(Boolean);

    // --- NXB ---
    const nhaXuatBan = meta['nhà xuất bản'] ||
                       meta['nxb'] ||
                       meta['tên nhà cung cấp'] ||
                       cleanText(product.vendor || '') || '';

    // --- ISBN ---
    const isbn = meta['mã sản phẩm'] ||
                 meta['isbn'] ||
                 variant.barcode ||
                 variant.sku || '';

    // --- Năm XB ---
    const namRaw = meta['năm xb'] || meta['năm xuất bản'] || '';
    const namSanXuat = parseInt(namRaw, 10) || null;

    // --- Mô tả ---
    const moTa = extractDescription(product.body_html);

    // --- Thể loại (ưu tiên product_type nếu có) ---
    const theLoai = cleanText(product.product_type) || category;

    return {
      tenSach,
      tacGia: tacGia.length > 0 ? tacGia : ['Không rõ'],
      nhaXuatBan: cleanText(nhaXuatBan) || 'Không rõ',
      theLoai,
      giaBia,
      giaGoc,
      hinhAnhUrl,
      hinhAnhLocal: '',
      moTa,
      isbn: cleanText(isbn),
      namSanXuat,
      url: `${BASE_URL}/products/${product.handle}`,
      nguon: 'phuongnam',
    };
  } catch (error) {
    console.error(`[ERROR] Lỗi parse product JSON: ${error.message}`);
    return null;
  }
};

// ============================================
// Scraper Main
// ============================================

/**
 * Cào danh sách sách từ Nhà Sách Phương Nam qua JSON API
 * @param {object} options
 * @param {number} options.maxBooks - Số sách tối đa
 * @param {string} options.imageDir - Thư mục lưu ảnh
 * @returns {Promise<object[]>}
 */
const scrapePhuongNam = async ({ maxBooks = 50, imageDir }) => {
  console.log('\n📚 ====== BẮT ĐẦU CÀO NHASACHPHUONGNAM.COM (JSON API) ======');
  console.log(`🎯 Mục tiêu: ${maxBooks} cuốn sách\n`);

  const allBooks = [];
  const seenHandles = new Set();

  for (const { url: collectionUrl, category } of COLLECTION_URLS) {
    if (allBooks.length >= maxBooks) break;

    console.log(`\n📂 Thể loại: ${category}`);

    // Cào tối đa 3 trang mỗi collection
    for (let page = 1; page <= 3; page++) {
      if (allBooks.length >= maxBooks) break;

      const pageUrl = `${collectionUrl}?page=${page}`;
      console.log(`  📄 Trang ${page}: ${pageUrl}`);

      const html = await fetchWithRetry(pageUrl);
      if (!html) continue;

      const handles = parseProductHandles(html);
      console.log(`  → Tìm thấy ${handles.length} sản phẩm`);

      if (handles.length === 0) break;

      // Fetch JSON cho từng sản phẩm
      for (const handle of handles) {
        if (allBooks.length >= maxBooks) break;
        if (seenHandles.has(handle)) continue;
        seenHandles.add(handle);

        await randomDelay(800, 1500); // delay nhẹ hơn vì chỉ gọi API

        // Gọi JSON API thay vì parse HTML
        const jsonUrl = `${BASE_URL}/products/${handle}.json`;
        const jsonData = await fetchWithRetry(jsonUrl);
        if (!jsonData) continue;

        const productJson = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
        const book = parseProductJson(productJson, category);
        if (!book || !book.tenSach) continue;

        // Download ảnh
        if (book.hinhAnhUrl && imageDir) {
          try {
            const urlObj = new URL(book.hinhAnhUrl);
            const ext = path.extname(urlObj.pathname) || '.jpg';
            const fileName = `${sanitizeFileName(book.tenSach)}${ext}`;
            const outputPath = path.join(imageDir, fileName);

            const downloaded = await downloadImage(book.hinhAnhUrl, outputPath);
            if (downloaded) {
              book.hinhAnhLocal = `images/phuongnam/${fileName}`;
            }
          } catch {
            // URL ảnh không hợp lệ, skip
          }
        }

        allBooks.push(book);
        logProgress(allBooks.length, maxBooks, book.tenSach.slice(0, 40));
      }

      await randomDelay(1500, 3000);
    }
  }

  console.log(`\n✅ Phương Nam: Đã cào ${allBooks.length}/${maxBooks} cuốn sách`);
  return allBooks;
};

module.exports = { scrapePhuongNam };
