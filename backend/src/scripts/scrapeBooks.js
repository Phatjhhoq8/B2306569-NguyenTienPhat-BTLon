/**
 * Chức năng: Script chính điều phối cào dữ liệu sách từ Fahasa.com & nhasachphuongnam.com
 * Lý do tạo: Seed dữ liệu ~100 đầu sách đa dạng thể loại cho Hệ thống Mượn Sách Online
 * Link trích dẫn: https://www.fahasa.com/ | https://nhasachphuongnam.com/
 *
 * Cách dùng:
 *   node src/scripts/scrapeBooks.js                # Cào cả 2 nguồn (mặc định 100 sách)
 *   node src/scripts/scrapeBooks.js --source=fahasa # Chỉ cào Fahasa
 *   node src/scripts/scrapeBooks.js --source=phuongnam # Chỉ cào Phương Nam
 *   node src/scripts/scrapeBooks.js --max=50       # Giới hạn tổng số sách
 */

const path = require('path');
const { scrapeFahasa } = require('./scrapers/fahasaScraper');
const { scrapePhuongNam } = require('./scrapers/phuongnamScraper');
const { saveJson, ensureDir } = require('./scrapers/utils');

// ============================================
// Config
// ============================================

const OUTPUT_DIR = path.join(__dirname, 'output');
const IMAGE_DIR_FAHASA = path.join(OUTPUT_DIR, 'images', 'fahasa');
const IMAGE_DIR_PHUONGNAM = path.join(OUTPUT_DIR, 'images', 'phuongnam');

// ============================================
// CLI Arguments Parser (Pure)
// ============================================

/**
 * Parse CLI arguments dạng --key=value
 * @param {string[]} args - process.argv
 * @returns {object}
 */
const parseArgs = (args) => {
  const result = {};
  args.slice(2).forEach((arg) => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      result[key] = value || 'true';
    }
  });
  return result;
};

// ============================================
// Statistics (Pure)
// ============================================

/**
 * Tính thống kê từ danh sách sách
 * @param {object[]} books
 * @returns {object}
 */
const computeStats = (books) => {
  const bySource = books.reduce((acc, book) => {
    acc[book.nguon] = (acc[book.nguon] || 0) + 1;
    return acc;
  }, {});

  const byCategory = books.reduce((acc, book) => {
    acc[book.theLoai] = (acc[book.theLoai] || 0) + 1;
    return acc;
  }, {});

  const withImage = books.filter((b) => b.hinhAnhLocal).length;
  const withAuthor = books.filter((b) => b.tacGia[0] !== 'Không rõ').length;
  const withDesc = books.filter((b) => b.moTa.length > 10).length;

  return { total: books.length, bySource, byCategory, withImage, withAuthor, withDesc };
};

/**
 * In bảng thống kê đẹp
 * @param {object} stats
 */
const printStats = (stats) => {
  console.log('\n' + '='.repeat(60));
  console.log('📊 THỐNG KÊ KẾT QUẢ CÀO DỮ LIỆU');
  console.log('='.repeat(60));
  console.log(`📚 Tổng số sách:        ${stats.total}`);
  console.log(`🖼️  Có ảnh bìa:          ${stats.withImage}/${stats.total}`);
  console.log(`✍️  Có tác giả:          ${stats.withAuthor}/${stats.total}`);
  console.log(`📝 Có mô tả:            ${stats.withDesc}/${stats.total}`);
  console.log('\n📂 Theo nguồn:');
  Object.entries(stats.bySource).forEach(([source, count]) => {
    console.log(`   - ${source}: ${count} cuốn`);
  });
  console.log('\n📁 Theo thể loại:');
  Object.entries(stats.byCategory).forEach(([cat, count]) => {
    console.log(`   - ${cat}: ${count} cuốn`);
  });
  console.log('='.repeat(60));
};

// ============================================
// Main
// ============================================

const main = async () => {
  const startTime = Date.now();
  const args = parseArgs(process.argv);

  const maxTotal = parseInt(args.max, 10) || 100;
  const source = args.source || 'all'; // 'fahasa' | 'phuongnam' | 'all'

  console.log('🚀 ============================================');
  console.log('   TOOL CÀO DỮ LIỆU SÁCH');
  console.log('   Nguồn: Fahasa.com & NhaSachPhuongNam.com');
  console.log('🚀 ============================================');
  console.log(`⚙️  Cấu hình: source=${source}, max=${maxTotal}`);

  // Đảm bảo thư mục output tồn tại
  ensureDir(OUTPUT_DIR);
  ensureDir(IMAGE_DIR_FAHASA);
  ensureDir(IMAGE_DIR_PHUONGNAM);

  const allBooks = [];

  try {
    // --- Cào Fahasa ---
    if (source === 'all' || source === 'fahasa') {
      const maxFahasa = source === 'all' ? Math.ceil(maxTotal / 2) : maxTotal;
      const fahasaBooks = await scrapeFahasa({
        maxBooks: maxFahasa,
        imageDir: IMAGE_DIR_FAHASA,
      });
      allBooks.push(...fahasaBooks);

      // Lưu riêng
      saveJson(path.join(OUTPUT_DIR, 'fahasa_books.json'), fahasaBooks);
    }

    // --- Cào Phương Nam ---
    if (source === 'all' || source === 'phuongnam') {
      const maxPN = source === 'all' ? maxTotal - allBooks.length : maxTotal;
      const pnBooks = await scrapePhuongNam({
        maxBooks: Math.max(maxPN, 10),
        imageDir: IMAGE_DIR_PHUONGNAM,
      });
      allBooks.push(...pnBooks);

      // Lưu riêng
      saveJson(path.join(OUTPUT_DIR, 'phuongnam_books.json'), pnBooks);
    }

    // --- Lưu tổng hợp ---
    saveJson(path.join(OUTPUT_DIR, 'scraped_books.json'), allBooks);

    // --- Thống kê ---
    const stats = computeStats(allBooks);
    printStats(stats);

    // Lưu stats
    saveJson(path.join(OUTPUT_DIR, 'scrape_stats.json'), {
      ...stats,
      scrapedAt: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      durationFormatted: `${Math.round((Date.now() - startTime) / 1000)}s`,
    });

  } catch (error) {
    console.error('\n❌ Lỗi nghiêm trọng:', error.message);
    console.error(error.stack);

    // Vẫn lưu những gì đã cào được
    if (allBooks.length > 0) {
      console.log(`\n💾 Lưu lại ${allBooks.length} sách đã cào được trước khi lỗi...`);
      saveJson(path.join(OUTPUT_DIR, 'scraped_books_partial.json'), allBooks);
    }
  }

  const elapsed = Math.round((Date.now() - startTime) / 1000);
  console.log(`\n⏱️  Tổng thời gian: ${elapsed}s`);
  console.log('🏁 Hoàn tất!');
};

main();
