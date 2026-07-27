<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
    <!-- Breadcrumb -->
    <div class="text-sm text-slate-500">
      <router-link to="/" class="hover:text-primary transition-colors">Trang chủ</router-link>
      <span class="mx-2">/</span>
      <span class="text-primary font-semibold">Giới thiệu thư viện</span>
    </div>

    <!-- Hero Banner -->
    <div class="bg-gradient-to-r from-primary via-blue-900 to-indigo-900 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between">
      <div class="space-y-6 max-w-2xl relative z-10">
        <span class="bg-white/10 text-secondary border border-white/20 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-block">Về Chúng Tôi</span>
        <h1 class="font-sans text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
          {{ aboutSettings.title || 'Hệ Thống Thư Viện Điện Tử CTU eLibrary' }}
        </h1>
        <p class="text-slate-200 text-sm md:text-base leading-relaxed">
          {{ aboutSettings.description || 'Đơn vị thư viện học thuật uy tín hàng đầu chuyên cung cấp giải pháp tra cứu sách giấy, giáo trình, nghiên cứu khoa học chất lượng cao cho sinh viên và cán bộ giảng viên Trường Đại học Cần Thơ.' }}
        </p>
        <router-link to="/books" class="bg-secondary hover:bg-opacity-90 text-slate-900 font-bold px-6 py-3 rounded-xl inline-flex items-center space-x-2 transition-all shadow-md text-sm">
          <BookOpen class="h-4 w-4" />
          <span>Khám phá kho sách ngay</span>
        </router-link>
      </div>

      <!-- Hero Illustration (Stylized Library SVG) -->
      <div class="w-full md:w-1/3 mt-8 md:mt-0 flex justify-center z-10">
        <svg viewBox="0 0 200 200" class="h-48 w-48 text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="30" y="40" width="140" height="130" rx="10" stroke="currentColor" stroke-width="6" />
          <line x1="30" y1="80" x2="170" y2="80" stroke="currentColor" stroke-width="4" />
          <line x1="30" y1="120" x2="170" y2="120" stroke="currentColor" stroke-width="4" />
          <!-- Small stylized books -->
          <rect x="50" y="50" width="15" height="30" rx="2" fill="currentColor" />
          <rect x="70" y="55" width="15" height="25" rx="2" fill="currentColor" />
          <rect x="90" y="60" width="15" height="20" rx="2" fill="currentColor" />
          <rect x="50" y="90" width="20" height="30" rx="2" fill="currentColor" />
          <rect x="80" y="90" width="15" height="30" rx="2" fill="currentColor" />
          <rect x="130" y="95" width="25" height="25" rx="2" fill="currentColor" />
          <!-- Star decoration -->
          <path d="M 135 45 L 140 55 L 150 55 L 142 61 L 145 70 L 135 64 L 125 70 L 128 61 L 120 55 L 130 55 Z" fill="#fef3c7" />
        </svg>
      </div>
      <div class="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-sky-400 via-indigo-900 to-slate-900 pointer-events-none"></div>
    </div>

    <!-- Our Story Section -->
    <section class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      <div class="space-y-6">
        <span class="text-xs font-bold text-primary uppercase tracking-wider block">Câu chuyện CTU eLibrary</span>
        <h2 class="font-sans text-3xl font-extrabold text-slate-900 leading-tight">
          {{ aboutSettings.historyTitle || 'Hành trình Kết nối Tri thức & Phát triển Tương lai' }}
        </h2>
        
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div class="absolute left-0 top-0 bottom-0 w-[4px] bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300"></div>
          <p class="text-slate-600 text-sm leading-relaxed">
            {{ aboutSettings.historyContent || 'Được phát triển nhằm nâng cao năng lực tự học và nghiên cứu của sinh viên Trường Đại học Cần Thơ, CTU eLibrary bắt đầu sứ mệnh mang đến trải nghiệm mượn sách giấy online tiện lợi, minh bạch và nhanh chóng. Trải qua thời gian dài nâng cấp, chúng tôi tự hào đồng hành cùng hàng chục ngàn sinh viên trên con đường học vấn.' }}
          </p>
        </div>

        <!-- Stats Container -->
        <div class="grid grid-cols-3 gap-4">
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div class="text-2xl font-black text-primary">{{ aboutSettings.stats?.years || '10+' }}</div>
            <div class="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Năm Kinh Nghiệm</div>
          </div>
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div class="text-2xl font-black text-primary">{{ aboutSettings.stats?.readers || '50,000+' }}</div>
            <div class="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Độc giả Tin Tưởng</div>
          </div>
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div class="text-2xl font-black text-primary">{{ aboutSettings.stats?.branches || '02' }}</div>
            <div class="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Chi Nhánh Thư Viện</div>
          </div>
        </div>
      </div>

      <!-- SVG Illustration Story -->
      <div class="bg-slate-50 p-6 rounded-3xl border border-slate-200 flex justify-center">
        <svg viewBox="0 0 400 320" width="100%" height="280" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="200" cy="240" rx="150" ry="25" fill="#cbd5e1" opacity="0.5" />
          <ellipse cx="200" cy="235" rx="140" ry="20" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
          <!-- Stylized readers sitting at library table -->
          <circle cx="150" cy="140" r="18" fill="#e2e8f0" />
          <path d="M 125,210 C 125,185 140,165 150,165 C 160,165 175,185 175,210 Z" fill="#0f4c81" />
          
          <circle cx="250" cy="140" r="18" fill="#e2e8f0" />
          <path d="M 225,210 C 225,185 240,165 250,165 C 260,165 275,185 275,210 Z" fill="#0c3d69" />
          
          <!-- Large book open on the table -->
          <path d="M 160,225 L 200,230 L 240,225 L 235,210 L 200,215 L 165,210 Z" fill="#fef3c7" stroke="#d97706" stroke-width="2" />
          <!-- Floating ideas/stars -->
          <path d="M 200,80 L 203,90 L 213,90 L 205,95 L 208,105 L 200,99 L 192,105 L 195,95 L 187,90 L 197,90 Z" fill="#f59e0b" />
          <circle cx="120" cy="90" r="5" fill="#38bdf8" />
          <circle cx="280" cy="90" r="7" fill="#818cf8" />
        </svg>
      </div>
    </section>

    <!-- Mission & Vision Section -->
    <section class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center pt-8 border-t border-slate-100">
      <div class="order-last md:order-first bg-slate-50 p-6 rounded-3xl border border-slate-200 flex justify-center">
        <svg viewBox="0 0 400 320" width="100%" height="280" xmlns="http://www.w3.org/2000/svg">
          <!-- Book delivery/Borrowing representation -->
          <rect x="120" y="60" width="160" height="200" rx="15" fill="#ffffff" stroke="#e2e8f0" stroke-width="4" />
          <line x1="140" y1="110" x2="260" y2="110" stroke="#e2e8f0" stroke-width="3" />
          <line x1="140" y1="150" x2="260" y2="150" stroke="#e2e8f0" stroke-width="3" />
          <line x1="140" y1="190" x2="220" y2="190" stroke="#e2e8f0" stroke-width="3" />
          <!-- Checkmarks -->
          <circle cx="160" cy="110" r="8" fill="#10b981" />
          <path d="M 156,110 L 159,113 L 164,107" stroke="#ffffff" stroke-width="2" stroke-linecap="round" fill="none" />
          <circle cx="160" cy="150" r="8" fill="#10b981" />
          <path d="M 156,150 L 159,153 L 164,147" stroke="#ffffff" stroke-width="2" stroke-linecap="round" fill="none" />
          
          <!-- Shield icon of safety -->
          <g transform="translate(245, 200)">
            <circle cx="25" cy="25" r="30" fill="#f0f7ff" stroke="#3b82f6" stroke-width="2" />
            <path d="M 25,12 L 38,17 L 38,28 C 38,37 32,43 25,46 C 18,43 12,37 12,28 L 12,17 Z" fill="#0f4c81" />
            <path d="M 19,25 L 23,29 L 31,20" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" />
          </g>
        </svg>
      </div>

      <div class="space-y-6">
        <span class="text-xs font-bold text-primary uppercase tracking-wider block">Sứ Mệnh và Tầm Nhìn</span>
        <h2 class="font-sans text-3xl font-extrabold text-slate-900 leading-tight">Đồng Hành Phát Triển Năng Lực Học Thuật</h2>
        
        <div class="flex items-start space-x-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div class="absolute left-0 top-0 bottom-0 w-[4px] bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300"></div>
          <div class="bg-primary/10 text-primary p-3 rounded-xl flex-shrink-0">
            <Target class="h-6 w-6" />
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900">Sứ Mệnh Của Chúng Tôi</h3>
            <p class="text-slate-600 text-xs mt-1.5 leading-relaxed">
              {{ aboutSettings.mission || 'Cung cấp giải pháp tra cứu và đăng ký mượn sách giấy trực tuyến nhanh gọn, khoa học và hoàn toàn minh bạch. Hỗ trợ sinh viên tối ưu hóa thời gian nghiên cứu và tiếp cận nguồn tri thức chính thống giá trị.' }}
            </p>
          </div>
        </div>

        <div class="flex items-start space-x-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div class="absolute left-0 top-0 bottom-0 w-[4px] bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300"></div>
          <div class="bg-secondary/25 text-secondary-dark p-3 rounded-xl flex-shrink-0">
            <Eye class="h-6 w-6" />
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900">Tầm Nhìn Chiến Lược</h3>
            <p class="text-slate-600 text-xs mt-1.5 leading-relaxed">
              {{ aboutSettings.vision || 'Trở thành hệ thống cổng thông tin thư viện điện tử kết hợp mượn trả sách giấy tự động hiện đại nhất khu vực Đồng bằng sông Cửu Long, tiên phong áp dụng công nghệ số và hệ thống quản lý thẻ hội viên thông minh.' }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Core Values Section -->
    <section class="space-y-8 pt-10 border-t border-slate-100">
      <div class="text-center max-w-2xl mx-auto space-y-3">
        <span class="text-xs font-bold text-primary uppercase tracking-wider">Cam Kết Từ CTU eLibrary</span>
        <h2 class="font-sans text-3xl font-extrabold text-slate-900">Sáu Giá Trị Cốt Lõi Vàng</h2>
        <p class="text-slate-500 text-xs">
          {{ aboutSettings.values || 'Mọi hoạt động quản lý sách và hỗ trợ độc giả của thư viện đều được chuẩn hóa nghiêm ngặt để mang lại sự tiện lợi tốt nhất cho sinh viên.' }}
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Value 1 -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 relative overflow-hidden group">
          <div class="absolute left-0 top-0 bottom-0 w-[4px] bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300"></div>
          <div class="bg-primary/10 text-primary h-12 w-12 rounded-xl flex items-center justify-center">
            <ShieldCheck class="h-6 w-6" />
          </div>
          <h3 class="text-base font-bold text-slate-900">Tài Liệu Chính Thống</h3>
          <p class="text-slate-600 text-xs leading-relaxed">
            100% các đầu sách, giáo trình được kiểm duyệt và nhập từ các nhà xuất bản uy tín trong nước và quốc tế, đảm bảo độ tin cậy khoa học tuyệt đối.
          </p>
        </div>

        <!-- Value 2 -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 relative overflow-hidden group">
          <div class="absolute left-0 top-0 bottom-0 w-[4px] bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300"></div>
          <div class="bg-primary/10 text-primary h-12 w-12 rounded-xl flex items-center justify-center">
            <Layers class="h-6 w-6" />
          </div>
          <h3 class="text-base font-bold text-slate-900">Quản Lý Hiện Đại</h3>
          <p class="text-slate-600 text-xs leading-relaxed">
            Đánh mã số tự động, định vị vị trí kệ sách chi tiết. Giúp độc giả dễ dàng tìm thấy sách vật lý ngay khi đến quầy thư viện.
          </p>
        </div>

        <!-- Value 3 -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 relative overflow-hidden group">
          <div class="absolute left-0 top-0 bottom-0 w-[4px] bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300"></div>
          <div class="bg-primary/10 text-primary h-12 w-12 rounded-xl flex items-center justify-center">
            <Heart class="h-6 w-6" />
          </div>
          <h3 class="text-base font-bold text-slate-900">Tận Tâm Phục Vụ</h3>
          <p class="text-slate-600 text-xs leading-relaxed">
            Đội ngũ thủ thư thân thiện, chuyên môn nghiệp vụ cao luôn sẵn sàng hỗ trợ giải đáp thắc mắc và hướng dẫn độc giả tra cứu nhanh chóng.
          </p>
        </div>

        <!-- Value 4 -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 relative overflow-hidden group">
          <div class="absolute left-0 top-0 bottom-0 w-[4px] bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300"></div>
          <div class="bg-primary/10 text-primary h-12 w-12 rounded-xl flex items-center justify-center">
            <Coffee class="h-6 w-6" />
          </div>
          <h3 class="text-base font-bold text-slate-900">Không Gian Chuẩn Mực</h3>
          <p class="text-slate-600 text-xs leading-relaxed">
            Không gian tự học yên tĩnh, thoáng đãng, cung cấp kết nối mạng tốc độ cao phục vụ đắc lực cho nhu cầu làm bài tập lớn và nghiên cứu nhóm.
          </p>
        </div>

        <!-- Value 5 -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 relative overflow-hidden group">
          <div class="absolute left-0 top-0 bottom-0 w-[4px] bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300"></div>
          <div class="bg-primary/10 text-primary h-12 w-12 rounded-xl flex items-center justify-center">
            <Smartphone class="h-6 w-6" />
          </div>
          <h3 class="text-base font-bold text-slate-900">Tiện Ích Số Vượt Trội</h3>
          <p class="text-slate-600 text-xs leading-relaxed">
            Quản lý phiếu mượn trả tự động, theo dõi hạn trả sách ngay trên trang cá nhân của độc giả, tự động cảnh báo sách quá hạn thuận tiện.
          </p>
        </div>

        <!-- Value 6 -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 relative overflow-hidden group">
          <div class="absolute left-0 top-0 bottom-0 w-[4px] bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300"></div>
          <div class="bg-primary/10 text-primary h-12 w-12 rounded-xl flex items-center justify-center">
            <Award class="h-6 w-6" />
          </div>
          <h3 class="text-base font-bold text-slate-900">Phát Triển Tri Thức</h3>
          <p class="text-slate-600 text-xs leading-relaxed">
            Đóng vai trò là cầu nối tri thức học thuật vững chắc, không ngừng cập nhật các đầu sách mới nhất theo chương trình giảng dạy của Nhà trường.
          </p>
        </div>
      </div>
    </section>

    <!-- Meet Our Team -->
    <section class="space-y-8 pt-10 border-t border-slate-100">
      <div class="text-center max-w-2xl mx-auto space-y-3">
        <h2 class="font-sans text-3xl font-extrabold text-slate-900">Ban Giám Đốc và Thủ Thư</h2>
        <p class="text-slate-500 text-xs">Đội ngũ lãnh đạo và nhân viên giàu kinh nghiệm, tận tụy quản lý và vận hành hệ thống kết nối tri thức.</p>
      </div>

      <div class="flex flex-wrap justify-center gap-6">
        <template v-if="aboutSettings.teamMembers && aboutSettings.teamMembers.length > 0">
          <div 
            v-for="(member, idx) in aboutSettings.teamMembers" 
            :key="idx" 
            class="w-full sm:w-[220px] bg-white rounded-3xl border-2 border-slate-300 shadow-sm text-center p-6 space-y-4 hover:-translate-y-2 hover:shadow-xl hover:border-primary transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
          >
            <div>
              <div v-if="member.avatar" class="h-20 w-20 rounded-full overflow-hidden mx-auto border-2 border-slate-100 group-hover:border-primary group-hover:scale-105 transition-all duration-300 shadow-inner mb-3">
                <img :src="getImageUrl(member.avatar)" class="h-full w-full object-cover" />
              </div>
              <div v-else class="h-20 w-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto text-xl font-bold uppercase mb-3 border-2 border-transparent group-hover:border-primary group-hover:scale-105 transition-all duration-300">
                {{ member.avatarText || member.name?.charAt(0) || 'T' }}
              </div>
              <h4 class="font-extrabold text-sm text-slate-800 group-hover:text-primary transition-colors duration-300 line-clamp-1">{{ member.name }}</h4>
            </div>
            <p class="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider mt-1 line-clamp-2 group-hover:text-slate-500 transition-colors duration-300">{{ member.role }}</p>
          </div>
        </template>
        <template v-else>
          <!-- Fallback default team -->
          <div class="w-full sm:w-[220px] bg-white rounded-3xl border-2 border-slate-300 shadow-sm text-center p-6 space-y-4 hover:-translate-y-2 hover:shadow-xl hover:border-primary transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
            <div>
              <div class="h-20 w-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto text-xl font-bold mb-3 border-2 border-transparent group-hover:border-primary group-hover:scale-105 transition-all duration-300">P</div>
              <h4 class="font-extrabold text-sm text-slate-800 group-hover:text-primary transition-colors duration-300">Nguyễn Tiến Phát</h4>
            </div>
            <p class="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider mt-1 group-hover:text-slate-500 transition-colors duration-300">Giám đốc Thư viện</p>
          </div>
          <div class="w-full sm:w-[220px] bg-white rounded-3xl border-2 border-slate-300 shadow-sm text-center p-6 space-y-4 hover:-translate-y-2 hover:shadow-xl hover:border-primary transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
            <div>
              <div class="h-20 w-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto text-xl font-bold mb-3 border-2 border-transparent group-hover:border-primary group-hover:scale-105 transition-all duration-300">M</div>
              <h4 class="font-extrabold text-sm text-slate-800 group-hover:text-primary transition-colors duration-300">Trần Thị Minh</h4>
            </div>
            <p class="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider mt-1 group-hover:text-slate-500 transition-colors duration-300">Phó Giám đốc điều hành</p>
          </div>
          <div class="w-full sm:w-[220px] bg-white rounded-3xl border-2 border-slate-300 shadow-sm text-center p-6 space-y-4 hover:-translate-y-2 hover:shadow-xl hover:border-primary transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
            <div>
              <div class="h-20 w-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto text-xl font-bold mb-3 border-2 border-transparent group-hover:border-primary group-hover:scale-105 transition-all duration-300">H</div>
              <h4 class="font-extrabold text-sm text-slate-800 group-hover:text-primary transition-colors duration-300">Lê Văn Hùng</h4>
            </div>
            <p class="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider mt-1 group-hover:text-slate-500 transition-colors duration-300">Trưởng phòng Quản lý Sách</p>
          </div>
          <div class="w-full sm:w-[220px] bg-white rounded-3xl border-2 border-slate-300 shadow-sm text-center p-6 space-y-4 hover:-translate-y-2 hover:shadow-xl hover:border-primary transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
            <div>
              <div class="h-20 w-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto text-xl font-bold mb-3 border-2 border-transparent group-hover:border-primary group-hover:scale-105 transition-all duration-300">V</div>
              <h4 class="font-extrabold text-sm text-slate-800 group-hover:text-primary transition-colors duration-300">Phạm Thị Vy</h4>
            </div>
            <p class="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider mt-1 group-hover:text-slate-500 transition-colors duration-300">Thủ thư Trưởng chi nhánh</p>
          </div>
        </template>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';
import { 
  BookOpen, 
  Target, 
  Eye, 
  ShieldCheck, 
  Layers, 
  Heart, 
  Coffee, 
  Smartphone, 
  Award 
} from '@lucide/vue';

const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:image')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `http://localhost:3000${cleanPath}`;
};

const aboutSettings = ref({
  title: "Hệ Thống Thư Viện Điện Tử CTU eLibrary",
  description: "Đơn vị thư viện học thuật uy tín hàng đầu chuyên cung cấp giải pháp tra cứu sách giấy, giáo trình, nghiên cứu khoa học chất lượng cao cho sinh viên và cán bộ giảng viên Trường Đại học Cần Thơ.",
  historyTitle: "Hành trình Kết nối Tri thức & Phát triển Tương lai",
  historyContent: "Được phát triển nhằm nâng cao năng lực tự học và nghiên cứu của sinh viên Trường Đại học Cần Thơ, CTU eLibrary bắt đầu sứ mệnh mang đến trải nghiệm mượn sách giấy online tiện lợi, minh bạch và nhanh chóng. Trải qua thời gian dài nâng cấp, chúng tôi tự hào đồng hành cùng hàng chục ngàn sinh viên trên con đường học vấn.",
  vision: "Trở thành hệ thống cổng thông tin thư viện điện tử kết hợp mượn trả sách giấy tự động hiện đại nhất khu vực Đồng bằng sông Cửu Long, tiên phong áp dụng công nghệ số và hệ thống quản lý thẻ hội viên thông minh.",
  mission: "Cung cấp giải pháp tra cứu và đăng ký mượn sách giấy trực tuyến nhanh gọn, khoa học và hoàn toàn minh bạch. Hỗ trợ sinh viên tối ưu hóa thời gian nghiên cứu và tiếp cận nguồn tri thức chính thống giá trị.",
  values: "Mọi hoạt động quản lý sách và hỗ trợ độc giả của thư viện đều được chuẩn hóa nghiêm ngặt để mang lại sự tiện lợi tốt nhất cho sinh viên."
});

onMounted(async () => {
  try {
    const res = await api.get('/settings/aboutpage');
    if (res.success && res.data && Object.keys(res.data).length > 0) {
      aboutSettings.value = { ...aboutSettings.value, ...res.data };
    }
  } catch (err) {
    console.error('Fetch about settings failed:', err);
  }
});
</script>
