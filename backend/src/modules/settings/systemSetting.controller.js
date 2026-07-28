/**
 * Chức năng: Controller điều phối logic API cài đặt hệ thống (System Settings)
 * Lý do tạo: Phục vụ lưu trữ cấu hình trang chủ & trang giới thiệu động
 */

const fs = require('fs');
const path = require('path');
const { SystemSetting } = require('../../models');
const resultResponse = require('../../utils/resultResponse');

// Các giá trị cấu hình mặc định (fallback presets) để đảm bảo hệ thống không bị lỗi khi chưa thiết lập DB
const presets = {
  homepage: {
    heroTitle: "KHÁM PHÁ THẾ GIỚI TRI THỨC TẠI CTU",
    heroSubtitle: "Tìm kiếm nhanh giáo trình môn học, công trình nghiên cứu khoa học và đăng ký mượn sách giấy trực tuyến dễ dàng tại Đại học Cần Thơ.",
    heroBanner: "/hero_banner.png",
    step1Title: "Tìm kiếm & Chọn sách",
    step1Desc: "Tra cứu đầu sách mong muốn trên hệ thống cổng thư viện điện tử CTU eLibrary với bộ lọc thông minh.",
    step2Title: "Thêm vào giỏ mượn",
    step2Desc: "Đưa các cuốn sách cần mượn vào giỏ trực tuyến và xác nhận thời hạn cùng chi nhánh nhận sách mong muốn.",
    step3Title: "Nhận mã phiếu hẹn",
    step3Desc: "Hệ thống cấp ngay mã phiếu hẹn điện tử ghi rõ hạn giữ sách và gửi thông tin xác nhận trực tiếp.",
    step4Title: "Đến nhận sách giấy",
    step4Desc: "Độc giả xuất trình mã phiếu hẹn tại quầy thủ thư chi nhánh đã chọn để nhận sách giấy trong 5 phút.",
    faqs: [
      {
        question: "Làm thế nào để đăng ký tài khoản độc giả mới?",
        answer: "Sinh viên và cán bộ giảng viên Trường Đại học Cần Thơ có thể nhấn nút 'Đăng ký' ở góc phải màn hình, điền thông tin MSSV/Mã số CB cùng email chính thức của trường để được xác thực và cấp tài khoản tự động."
      },
      {
        question: "Quy trình đặt mượn sách giấy trực tuyến diễn ra như thế nào?",
        answer: "Độc giả tìm kiếm sách trên trang danh mục, nhấn 'Đăng ký mượn', hệ thống sẽ gửi mã vạch phiếu hẹn điện tử. Độc giả chỉ cần mang mã này đến quầy thư viện trung tâm để nhận sách giấy trong vòng 5 phút."
      },
      {
        question: "Thời gian mượn tối đa là bao lâu và được mượn bao nhiêu cuốn sách?",
        answer: "Số lượng và thời gian mượn tùy thuộc gói hội viên: Gói Tiêu chuẩn (STUDENT) mượn tối đa 3 cuốn trong 14 ngày. Gói Đọc VIP mượn tối đa 10 cuốn trong 30 ngày. Bạn có thể gia hạn thời gian mượn trực tiếp trên trang cá nhân."
      },
      {
        question: "Trễ hạn trả sách có bị phạt tiền không và tính như thế nào?",
        answer: "Có. Để đảm bảo cơ hội mượn sách cho độc giả khác, sách trả trễ hạn sẽ bị áp dụng mức phí phạt nhỏ là 5.000 VND/ngày cho mỗi cuốn sách trễ hạn. Bạn cần thanh toán hết phí phạt để tiếp tục mượn sách."
      },
      {
        question: "Làm thế nào để thanh toán nâng cấp gói hội viên VIP?",
        answer: "Bạn truy cập mục 'Gói hội viên', bấm đăng ký gói mong muốn và quét mã QR chuyển khoản ngân hàng trên giao diện. Hệ thống sẽ tự động đối soát và kích hoạt đặc quyền VIP cho tài khoản của bạn ngay khi giao dịch thành công."
      }
    ]
  },
  aboutpage: {
    title: "Hệ Thống Thư Viện Điện Tử CTU eLibrary",
    description: "Đơn vị thư viện học thuật uy tín hàng đầu chuyên cung cấp giải pháp tra cứu sách giấy, giáo trình, nghiên cứu khoa học chất lượng cao cho sinh viên và cán bộ giảng viên Trường Đại học Cần Thơ.",
    historyTitle: "Hành trình Kết nối Tri thức & Phát triển Tương lai",
    historyContent: "Được phát triển nhằm nâng cao năng lực tự học và nghiên cứu của sinh viên Trường Đại học Cần Thơ, CTU eLibrary bắt đầu sứ mệnh mang đến trải nghiệm mượn sách giấy online tiện lợi, minh bạch và nhanh chóng. Trải qua thời gian dài nâng cấp, chúng tôi tự hào đồng hành cùng hàng chục ngàn sinh viên trên con đường học vấn.",
    vision: "Trở thành hệ thống cổng thông tin thư viện điện tử kết hợp mượn trả sách giấy tự động hiện đại nhất khu vực Đồng bằng sông Cửu Long, tiên phong áp dụng công nghệ số và hệ thống quản lý thẻ hội viên thông minh.",
    mission: "Cung cấp giải pháp tra cứu và đăng ký mượn sách giấy trực tuyến nhanh gọn, khoa học và hoàn toàn minh bạch. Hỗ trợ sinh viên tối ưu hóa thời gian nghiên cứu và tiếp cận nguồn tri thức chính thống giá trị.",
    values: "Mọi hoạt động quản lý sách và hỗ trợ độc giả của thư viện đều được chuẩn hóa nghiêm ngặt để mang lại sự tiện lợi tốt nhất cho sinh viên.",
    stats: {
      years: "10+",
      readers: "50,000+",
      branches: "01"
    },
    teamMembers: [
      { name: "Nguyễn Tiến Phát", role: "Giám đốc Thư viện", avatarText: "P" },
      { name: "Trần Thị Minh", role: "Phó Giám đốc điều hành", avatarText: "M" },
      { name: "Lê Văn Hùng", role: "Trưởng phòng Quản lý Sách", avatarText: "H" },
      { name: "Phạm Thị Vy", role: "Thủ thư Trưởng chi nhánh", avatarText: "V" }
    ]
  },
  catalogpage: {
    heroTitle: "Kho Tài Liệu Học Thuật & Sách Giấy",
    heroSubtitle: "Tra cứu hàng ngàn đầu sách giáo trình, nghiên cứu khoa học và tài liệu chuyên ngành chính thống của Trường Đại học Cần Thơ."
  },
  membershippage: {
    heroTitle: "Hạng Thẻ Hội Viên Thư Viện",
    heroSubtitle: "Đăng ký nâng cấp tài khoản hội viên để được hưởng đặc quyền mượn sách không giới hạn thời gian, số lượng lớn và dịch vụ ưu tiên tại Thư viện ĐH Cần Thơ.",
    qrTitle: "QUÉT MÃ QR THANH TOÁN",
    qrInstruction: "Sau khi chọn gói đăng ký mong muốn, vui lòng quét mã QR bên cạnh để thanh toán phí duy trì dịch vụ. Hệ thống sẽ tự động kích hoạt tài khoản ngay khi nhận được giao dịch thành công."
  },
  contactpage: {
    title: "Liên hệ với chúng tôi",
    subtitle: "Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ mọi nhu cầu học tập, mượn trả tài liệu của bạn.",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3928.7933190848834!2d105.76757657591605!3d10.033905572428514!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a088194488383f%3A0xc07cfdb1ef3900f0!2zVGjGsCB2aeG7h24gVHJ1bmcgdMOibSAtIMSQ4bqhaSBo4buNYyBD4bqnbiBUaMah!5e0!3m2!1svi!2s!4v1714495570000!5m2!1svi!2s",
    libraryName: "Thư viện Trung tâm ĐH Cần Thơ",
    address: "Khu II, Đường 3/2, Phường Xuân Khánh, Quận Ninh Kiều, TP. Cần Thơ",
    hotline: "0292 3832 663",
    email: "support@ctu.edu.vn",
    moreTitle: "Thông Tin Thêm",
    moreHours: "Giờ làm việc: 7:30 – 21:00 (Tất cả các ngày trong tuần, kể cả Thứ Bảy, Chủ Nhật, trừ các ngày nghỉ lễ Tết theo quy định).",
    moreNote: "Độc giả vui lòng xuất trình thẻ độc giả (hoặc mã QR thẻ hội viên trên ứng dụng di động) khi thực hiện giao dịch mượn trả tại quầy thủ thư."
  }
};

/**
 * Lấy cấu hình hệ thống theo Key
 */
const getSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    const setting = await SystemSetting.findOne({ key });
    
    // Nếu chưa có trong DB, trả về preset mặc định
    const data = setting ? setting.value : (presets[key] || {});
    return resultResponse.ok(res, data);
  } catch (error) {
    next(error);
  }
};

/**
 * Cập nhật cấu hình hệ thống
 */
const updateSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (!value) {
      const error = new Error('Giá trị cấu hình là bắt buộc');
      error.status = 400;
      throw error;
    }

    // Bắt lỗi số điện thoại hotline ở backend cho trang liên hệ
    if (key === 'contactpage') {
      const phoneRegex = /^(0\d{1,4}[.\s-]?\d{3,4}[.\s-]?\d{3,4}|(1800|1900)\d{4}|(\+84|0)\d{9,10})$/;
      const isValidPhone = (phone) => {
        if (!phone) return false;
        return phoneRegex.test(phone.trim());
      };

      if (!isValidPhone(value.hotline)) {
        const error = new Error('Số điện thoại Hotline Trụ sở chính không hợp lệ! Vui lòng nhập đúng định dạng số điện thoại Việt Nam.');
        error.status = 400;
        throw error;
      }

      if (value.branches && Array.isArray(value.branches)) {
        for (let i = 0; i < value.branches.length; i++) {
          const branch = value.branches[i];
          if (!isValidPhone(branch.hotline)) {
            const error = new Error(`Số điện thoại Hotline của Chi nhánh #${i + 1} (${branch.name || 'Chưa đặt tên'}) không hợp lệ!`);
            error.status = 400;
            throw error;
          }
        }
      }
    }

    const setting = await SystemSetting.findOneAndUpdate(
      { key },
      { value },
      { new: true, upsert: true }
    );

    return resultResponse.ok(res, setting.value);
  } catch (error) {
    next(error);
  }
};

const uploadImage = async (req, res, next) => {
  try {
    const { fileData, fileName } = req.body;
    if (!fileData) {
      const error = new Error('Dữ liệu file (Base64) là bắt buộc');
      error.status = 400;
      throw error;
    }

    const matches = fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      const error = new Error('Định dạng Base64 không hợp lệ');
      error.status = 400;
      throw error;
    }

    const fileBuffer = Buffer.from(matches[2], 'base64');
    const ext = path.extname(fileName || 'image.png') || '.png';
    const uniqueFileName = `upload_${Date.now()}_${Math.round(Math.random() * 1E9)}${ext}`;
    
    const uploadDir = path.join(__dirname, '../../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, uniqueFileName);
    fs.writeFileSync(filePath, fileBuffer);

    const fileUrl = `/uploads/${uniqueFileName}`;

    return resultResponse.ok(res, {
      url: fileUrl,
      message: 'Tải ảnh lên thành công'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSetting,
  updateSetting,
  uploadImage
};
