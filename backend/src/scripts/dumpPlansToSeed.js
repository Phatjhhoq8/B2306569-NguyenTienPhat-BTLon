/**
 * Chức năng: Ghi nhận dữ liệu gói hội viên hiện tại trong CSDL và ghi đè vào file seedFromScrapedBooks.js
 * Lý do tạo: Cho phép Admin/User lưu cấu hình gói cước hiện tại làm dữ liệu seed mặc định
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/library_management';

const dump = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected.');

    // Đăng ký Schema động để đọc dữ liệu
    const MembershipPlan = mongoose.model('MembershipPlan', new mongoose.Schema({}, { strict: false }));
    
    const plans = await MembershipPlan.find({}).lean();
    if (plans.length === 0) {
      console.log('Không tìm thấy gói hội viên nào trong CSDL để lưu.');
      process.exit(0);
    }

    // Làm sạch dữ liệu để đưa vào file seed
    const cleanPlans = plans.map(p => {
      const { _id, createdAt, updatedAt, __v, maGoi, ...clean } = p;
      return clean;
    });

    const seedFilePath = path.join(__dirname, 'seedFromScrapedBooks.js');
    let seedContent = fs.readFileSync(seedFilePath, 'utf8');

    // Vị trí mảng plans
    const startMarker = 'const plans = [';
    const startIndex = seedContent.indexOf(startMarker);
    if (startIndex === -1) {
      throw new Error('Không tìm thấy mảng plans trong file seed.');
    }

    // Tìm dấu ngoặc đóng ] tương ứng
    let openBrackets = 1;
    let endIndex = -1;
    for (let i = startIndex + startMarker.length; i < seedContent.length; i++) {
      if (seedContent[i] === '[') openBrackets++;
      if (seedContent[i] === ']') {
        openBrackets--;
        if (openBrackets === 0) {
          endIndex = i + 1; // Bao gồm cả dấu ngoặc đóng ']'
          break;
        }
      }
    }

    if (endIndex === -1) {
      throw new Error('Không tìm thấy dấu đóng ngoặc của mảng plans.');
    }

    const plansJson = JSON.stringify(cleanPlans, null, 2);
    const newPlansCode = `const plans = ${plansJson}`;
    
    const newSeedContent = seedContent.substring(0, startIndex) + newPlansCode + seedContent.substring(endIndex);
    fs.writeFileSync(seedFilePath, newSeedContent, 'utf8');
    
    console.log(`Đã ghi đè thành công ${cleanPlans.length} gói hội viên hiện tại vào file seed: ${seedFilePath}`);
    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi ghi dữ liệu seed:', error);
    process.exit(1);
  }
};

dump();
