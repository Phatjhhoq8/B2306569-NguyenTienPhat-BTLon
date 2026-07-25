/**
 * Chức năng: Scraper chuyên biệt cho Fahasa.com sử dụng Puppeteer (bypass Cloudflare)
 * Lý do tạo: Fahasa dùng Cloudflare chống bot → cần headless browser thay vì axios
 * Link trích dẫn: https://www.fahasa.com/sach-trong-nuoc.html
 */

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const cheerio = require('cheerio');
const path = require('path');
const {
  randomDelay,
  sanitizePrice,
  sanitizeFileName,
  cleanText,
  normalizeImageUrl,
  downloadImage,
  logProgress,
} = require('./utils');

// Stealth plugin giúp puppeteer trông giống browser thật
puppeteer.use(StealthPlugin());

// ============================================
// Config
// ============================================

const BASE_URL = 'https://www.fahasa.com';

// Các category page (đa dạng thể loại, sort theo bán chạy)
const CATEGORY_URLS = [
  { url: `${BASE_URL}/sach-trong-nuoc/van-hoc-trong-nuoc.html?order=num_orders&limit=24&p=`, category: 'Văn Học' },
  { url: `${BASE_URL}/sach-trong-nuoc/kinh-te-chinh-tri-phap-ly.html?order=num_orders&limit=24&p=`, category: 'Kinh Tế' },
  { url: `${BASE_URL}/sach-trong-nuoc/tam-ly-ky-nang-song.html?order=num_orders&limit=24&p=`, category: 'Tâm Lý - Kỹ Năng Sống' },
  { url: `${BASE_URL}/sach-trong-nuoc/thieu-nhi.html?order=num_orders&limit=24&p=`, category: 'Thiếu Nhi' },
  { url: `${BASE_URL}/sach-trong-nuoc/tieu-su-hoi-ky.html?order=num_orders&limit=24&p=`, category: 'Tiểu Sử - Hồi Ký' },
];

// ============================================
// Browser Helper
// ============================================

/**
 * Mở browser Puppeteer và trả về page
 * @returns {Promise<{browser, page}>}
 */
const launchBrowser = async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1920,1080',
    ],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );
  // Block images & CSS để tải nhanh hơn
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const type = req.resourceType();
    if (['image', 'stylesheet', 'font', 'media'].includes(type)) {
      req.abort();
    } else {
      req.continue();
    }
  });
  return { browser, page };
};

/**
 * Fetch HTML từ URL bằng Puppeteer với retry
 * @param {object} page - Puppeteer page
 * @param {string} url
 * @param {number} retries
 * @returns {Promise<string|null>}
 */
const fetchPage = async (page, url, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      // Chờ thêm 2s để nội dung render (dùng delay thay waitForTimeout đã bị xóa trong puppeteer mới)
      await new Promise((r) => setTimeout(r, 2000));
      const html = await page.content();
      return html;
    } catch (error) {
      console.warn(`  [Retry ${attempt}/${retries}] Lỗi fetch ${url}: ${error.message}`);
      if (attempt === retries) {
        console.error(`  [FAIL] Không thể fetch: ${url}`);
        return null;
      }
      await randomDelay(3000, 5000);
    }
  }
  return null;
};

// ============================================
// Parse Functions (Pure - dùng cheerio)
// ============================================

/**
 * Parse danh sách link sản phẩm từ trang category
 * @param {string} html
 * @returns {string[]}
 */
const parseProductLinks = (html) => {
  const $ = cheerio.load(html);
  const links = [];

  // Selector chính cho product links trên Fahasa
  $('h2.product-name-no-ellipsis a, .product-name-no-ellipsis a').each((_, el) => {
    const href = $(el).attr('href');
    if (href && href.includes('fahasa.com')) {
      links.push(href);
    }
  });

  // Fallback selectors
  if (links.length === 0) {
    $('h2.product-name a, .product-name a, .fhs-product-detail a').each((_, el) => {
      const href = $(el).attr('href');
      if (href && href.includes('fahasa.com') && !links.includes(href)) {
        links.push(href);
      }
    });
  }

  return [...new Set(links)];
};

/**
 * Parse thông tin chi tiết sách từ trang product detail
 * @param {string} html
 * @param {string} url
 * @param {string} category
 * @returns {object|null}
 */
const parseProductDetail = (html, url, category) => {
  try {
    const $ = cheerio.load(html);

    // --- Tên sách ---
    const tenSach = cleanText($('h1.product-name').text()) ||
                    cleanText($('.product-essential h1').text()) ||
                    cleanText($('h1').first().text());
    if (!tenSach) return null;

    // --- Hình ảnh ---
    const hinhAnhUrl = normalizeImageUrl(
      $('#image-main').attr('data-src') ||
      $('#image-main').attr('src') ||
      $('.fhs_img_frame img').first().attr('data-src') ||
      $('.fhs_img_frame img').first().attr('src') ||
      $('meta[property="og:image"]').attr('content') || ''
    );

    // --- Giá ---
    const giaText = $('.special-price .price').first().text() ||
                    $('p.special-price .price').first().text() ||
                    $('.regular-price .price').first().text();
    const giaBia = sanitizePrice(giaText);

    const giaGocText = $('.old-price .price').first().text();
    const giaGoc = sanitizePrice(giaGocText) || giaBia;

    // --- Bảng thông tin (tác giả, NXB, ISBN...) ---
    const info = {};

    // Pattern 1: Khu vực tóm tắt phía trên (.product-view-sa-one)
    $('.product-view-sa .product-view-sa-one').each((_, el) => {
      const label = cleanText($(el).find('.product-view-sa-one-left').text())
        .replace(/:$/g, '').toLowerCase();
      const value = cleanText($(el).find('.product-view-sa-one-right').text());
      if (label && value) info[label] = value;
    });

    // Pattern 2: Bảng thông tin chi tiết (#product-attribute-specs-table)
    $('#product-attribute-specs-table tr').each((_, row) => {
      const label = cleanText($(row).find('th.label').text() || $(row).find('td').first().text())
        .replace(/:$/g, '').toLowerCase();
      const value = cleanText($(row).find('td.data').text() || $(row).find('td').last().text());
      if (label && value && label !== value && !info[label]) {
        info[label] = value;
      }
    });

    // Pattern 3: Fallback - bảng dữ liệu chung
    if (Object.keys(info).length === 0) {
      $('.data-table tr').each((_, row) => {
        const label = cleanText($(row).find('td, th').first().text()).toLowerCase();
        const value = cleanText($(row).find('td').last().text());
        if (label && value && label !== value) info[label] = value;
      });
    }

    // --- Tác giả ---
    const tacGiaRaw = info['tác giả'] || info['tac gia'] || info['author'] || '';
    const tacGia = tacGiaRaw.split(/[,;&]/).map(cleanText).filter(Boolean);

    // --- NXB ---
    const nhaXuatBan = info['nhà xuất bản'] || info['nxb'] ||
                       info['nhà cung cấp'] || info['công ty phát hành'] ||
                       info['nha xuat ban'] || info['publisher'] || '';

    // --- ISBN ---
    const isbn = info['isbn'] || info['isbn-13'] || info['mã hàng'] ||
                 info['barcode'] || info['mã sản phẩm'] || '';

    // --- Năm XB ---
    const namRaw = info['năm xb'] || info['năm xuất bản'] || '';
    const namSanXuat = parseInt(namRaw, 10) || null;

    // --- Mô tả ---
    const moTa = cleanText(
      $('.product_tab_content .std').text() ||
      $('#desc_content').text() ||
      $('meta[name="description"]').attr('content') || ''
    ).slice(0, 1000);

    return {
      tenSach,
      tacGia: tacGia.length > 0 ? tacGia : ['Không rõ'],
      nhaXuatBan: cleanText(nhaXuatBan) || 'Không rõ',
      theLoai: category,
      giaBia,
      giaGoc,
      hinhAnhUrl,
      hinhAnhLocal: '',
      moTa,
      isbn: cleanText(isbn),
      namSanXuat,
      url,
      nguon: 'fahasa',
    };
  } catch (error) {
    console.error(`[ERROR] Lỗi parse detail ${url}: ${error.message}`);
    return null;
  }
};

// ============================================
// Scraper Main
// ============================================

/**
 * Cào danh sách sách từ Fahasa bằng Puppeteer
 * @param {object} options
 * @param {number} options.maxBooks - Số sách tối đa
 * @param {string} options.imageDir - Thư mục lưu ảnh
 * @returns {Promise<object[]>}
 */
const scrapeFahasa = async ({ maxBooks = 50, imageDir }) => {
  console.log('\n📚 ====== BẮT ĐẦU CÀO FAHASA.COM (Puppeteer) ======');
  console.log(`🎯 Mục tiêu: ${maxBooks} cuốn sách\n`);

  const { browser, page } = await launchBrowser();
  console.log('🌐 Browser đã khởi động\n');

  const allBooks = [];
  const seenUrls = new Set();

  try {
    // Truy cập trang chủ trước để lấy cookies
    console.log('🔑 Truy cập trang chủ lấy cookies...');
    await fetchPage(page, BASE_URL);
    await randomDelay(2000, 3000);

    for (const { url: categoryBaseUrl, category } of CATEGORY_URLS) {
      if (allBooks.length >= maxBooks) break;

      console.log(`\n📂 Thể loại: ${category}`);

      // Cào 2 trang mỗi category
      for (let pg = 1; pg <= 2; pg++) {
        if (allBooks.length >= maxBooks) break;

        const pageUrl = `${categoryBaseUrl}${pg}`;
        console.log(`  📄 Trang ${pg}: ${pageUrl}`);

        const html = await fetchPage(page, pageUrl);
        if (!html) continue;

        const productLinks = parseProductLinks(html);
        console.log(`  → Tìm thấy ${productLinks.length} sản phẩm`);

        for (const productUrl of productLinks) {
          if (allBooks.length >= maxBooks) break;
          if (seenUrls.has(productUrl)) continue;
          seenUrls.add(productUrl);

          await randomDelay(2000, 4000);

          const detailHtml = await fetchPage(page, productUrl);
          if (!detailHtml) continue;

          const book = parseProductDetail(detailHtml, productUrl, category);
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
                book.hinhAnhLocal = `images/fahasa/${fileName}`;
              }
            } catch {
              // URL không hợp lệ, skip
            }
          }

          allBooks.push(book);
          logProgress(allBooks.length, maxBooks, book.tenSach.slice(0, 40));
        }

        await randomDelay(2000, 4000);
      }
    }
  } finally {
    await browser.close();
    console.log('\n🔒 Browser đã đóng');
  }

  console.log(`\n✅ Fahasa: Đã cào ${allBooks.length}/${maxBooks} cuốn sách`);
  return allBooks;
};

module.exports = { scrapeFahasa };
