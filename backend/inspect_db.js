const mongoose = require('mongoose');
const path = require('path');

// Load config de ket noi DB
// Hãy tìm file config database trong backend, thuong la src/app.js hoac src/config/db.js
// Ta co the xem src/app.js hoac run truc tiep bang cach require app.js
try {
  const app = require('./src/app');
  
  // Cho 2s de DB ket noi
  setTimeout(async () => {
    try {
      const BookTitle = mongoose.model('BookTitle');
      const BookCopy = mongoose.model('BookCopy');
      
      const titles = await BookTitle.find({}).limit(5);
      const copies = await BookCopy.find({}).limit(5);
      
      console.log('=== BOOK TITLES ===');
      titles.forEach(t => console.log(`ID: ${t._id}, Title: ${t.tenSach}`));
      
      console.log('\n=== BOOK COPIES ===');
      copies.forEach(c => console.log(`ID: ${c._id}, DauSach: ${c.dauSach}, TinhTrang: ${c.tinhTrang}`));
      
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  }, 2000);
} catch (err) {
  console.error(err);
  process.exit(1);
}
