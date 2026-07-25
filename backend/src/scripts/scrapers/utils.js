/**
 * Chức năng: Pure functions tiện ích dùng chung cho các scraper
 * Lý do tạo: Tái sử dụng logic HTTP, parse, download ảnh giữa các scraper
 * Link trích dẫn: https://github.com/axios/axios | https://github.com/cheeriojs/cheerio
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// ============================================
// HTTP & Retry
// ============================================

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
  'Accept-Encoding': 'gzip, deflate',
  'Connection': 'keep-alive',
};

/**
 * Fetch URL với retry logic
 * @param {string} url - URL cần fetch
 * @param {object} options - Axios options
 * @param {number} retries - Số lần retry (default: 3)
 * @returns {Promise<string>} HTML content
 */
const fetchWithRetry = async (url, options = {}, retries = 3) => {
  const config = {
    headers: DEFAULT_HEADERS,
    timeout: 15000,
    ...options,
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(url, config);
      return response.data;
    } catch (error) {
      const isLastAttempt = attempt === retries;
      console.warn(
        `[Retry ${attempt}/${retries}] Lỗi fetch ${url}: ${error.message}`
      );
      if (isLastAttempt) {
        console.error(`[FAIL] Không thể fetch sau ${retries} lần: ${url}`);
        return null;
      }
      await delay(2000 * attempt); // backoff tăng dần
    }
  }
  return null;
};

// ============================================
// Delay & Throttle
// ============================================

/**
 * Promise-based delay
 * @param {number} ms - Milliseconds
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Random delay trong khoảng [min, max] ms
 * @param {number} min - Min ms
 * @param {number} max - Max ms
 * @returns {Promise<void>}
 */
const randomDelay = (min = 1000, max = 3000) => {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return delay(ms);
};

// ============================================
// Parse & Sanitize
// ============================================

/**
 * Parse chuỗi giá tiền VNĐ → số nguyên
 * "64,600₫" → 64600 | "79.000 đ" → 79000
 * @param {string} priceStr
 * @returns {number}
 */
const sanitizePrice = (priceStr) => {
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(/[^\d]/g, '');
  return parseInt(cleaned, 10) || 0;
};

/**
 * Tạo tên file an toàn từ chuỗi Unicode
 * "Nhà Giả Kim (Tái Bản)" → "nha-gia-kim-tai-ban"
 * @param {string} name
 * @returns {string}
 */
const sanitizeFileName = (name) => {
  if (!name) return 'unknown';
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // bỏ dấu
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // chỉ giữ chữ, số, space, dash
    .replace(/\s+/g, '-') // space → dash
    .replace(/-+/g, '-') // nhiều dash → 1 dash
    .replace(/^-|-$/g, '') // trim dash đầu/cuối
    .slice(0, 80); // giới hạn độ dài
};

/**
 * Trim và clean text, bỏ whitespace thừa
 * @param {string} text
 * @returns {string}
 */
const cleanText = (text) => {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
};

/**
 * Chuẩn hóa URL ảnh (thêm protocol nếu thiếu)
 * @param {string} url
 * @returns {string}
 */
const normalizeImageUrl = (url) => {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  if (trimmed.startsWith('/')) return trimmed; // relative URL, cần base
  return trimmed;
};

// ============================================
// File System
// ============================================

/**
 * Đảm bảo thư mục tồn tại (tạo recursive nếu chưa có)
 * @param {string} dirPath
 */
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Download ảnh từ URL và lưu vào đường dẫn chỉ định
 * @param {string} imageUrl - URL ảnh
 * @param {string} outputPath - Đường dẫn file output
 * @returns {Promise<boolean>} true nếu thành công
 */
const downloadImage = async (imageUrl, outputPath) => {
  try {
    const url = normalizeImageUrl(imageUrl);
    if (!url || url.startsWith('/')) {
      console.warn(`[SKIP] URL ảnh không hợp lệ: ${imageUrl}`);
      return false;
    }

    ensureDir(path.dirname(outputPath));

    const response = await axios.get(url, {
      responseType: 'stream',
      timeout: 20000,
      headers: DEFAULT_HEADERS,
    });

    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);

    return new Promise((resolve) => {
      writer.on('finish', () => resolve(true));
      writer.on('error', (err) => {
        console.error(`[ERROR] Lỗi ghi ảnh ${outputPath}: ${err.message}`);
        resolve(false);
      });
    });
  } catch (error) {
    console.error(`[ERROR] Lỗi download ảnh ${imageUrl}: ${error.message}`);
    return false;
  }
};

/**
 * Lưu dữ liệu JSON ra file
 * @param {string} filePath - Đường dẫn file
 * @param {any} data - Dữ liệu cần lưu
 */
const saveJson = (filePath, data) => {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✅ Đã lưu: ${filePath} (${Array.isArray(data) ? data.length : 1} items)`);
};

// ============================================
// Progress Logger
// ============================================

/**
 * In progress bar đơn giản
 * @param {number} current
 * @param {number} total
 * @param {string} label
 */
const logProgress = (current, total, label = '') => {
  const percent = Math.round((current / total) * 100);
  const bar = '█'.repeat(Math.floor(percent / 5)) + '░'.repeat(20 - Math.floor(percent / 5));
  process.stdout.write(`\r  [${bar}] ${percent}% (${current}/${total}) ${label}`);
  if (current === total) console.log(''); // newline khi xong
};

module.exports = {
  fetchWithRetry,
  delay,
  randomDelay,
  sanitizePrice,
  sanitizeFileName,
  cleanText,
  normalizeImageUrl,
  ensureDir,
  downloadImage,
  saveJson,
  logProgress,
  DEFAULT_HEADERS,
};
