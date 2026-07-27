<template>
  <div class="space-y-16 pb-16 font-sans">
    
    <!-- 1. HERO SLIDER BANNER -->
    <section 
      class="relative bg-primary text-white py-24 px-4 shadow-inner bg-cover bg-center bg-no-repeat"
      :style="{ backgroundImage: `linear-gradient(rgba(15, 76, 129, 0.8), rgba(9, 45, 77, 0.9)), url(${homepageSettings.heroBanner || '/hero_banner.png'})` }"
    >
      <div class="max-w-5xl mx-auto text-center space-y-8 relative z-10">
        <span class="bg-secondary/20 text-secondary border border-secondary/30 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider inline-block">Học thuật & Kết nối Tri thức</span>
        <h1 class="font-sans text-3xl md:text-5xl font-extrabold tracking-tight leading-tight uppercase">
          {{ homepageSettings.heroTitle || 'Khám phá thế giới tri thức tại CTU' }}
        </h1>
        <p class="text-slate-200 text-sm md:text-base max-w-2xl mx-auto font-light leading-relaxed">
          {{ homepageSettings.heroSubtitle || 'Tìm kiếm nhanh giáo trình môn học, công trình nghiên cứu khoa học và đăng ký mượn sách giấy trực tuyến dễ dàng tại Đại học Cần Thơ.' }}
        </p>

        <!-- Search Bar (Giao diện giống TiemChung) -->
        <div class="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-2 flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2 text-slate-800 border border-slate-100 relative z-30">
          <div class="flex items-center space-x-2 w-full md:w-2/3 px-3 py-2 border-b md:border-b-0 md:border-r border-slate-100 relative">
            <Search class="text-slate-400 h-5 w-5 flex-shrink-0" />
            <div class="relative flex-grow">
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Nhập tên sách, tác giả hoặc chủ đề học tập..." 
                class="w-full focus:outline-none text-sm md:text-base font-semibold bg-transparent"
                @keydown.down.prevent="onKeyDown"
                @keydown.up.prevent="onKeyUp"
                @keydown.enter.prevent="onKeyEnter"
                @keydown.esc="showSuggestions = false"
                @input="fetchSuggestions"
                @focus="showSuggestions = true"
                @blur="setTimeout(() => { showSuggestions = false; activeSuggestionIndex = -1; }, 200)"
              />
              
              <!-- Suggestions Dropdown -->
              <div 
                v-if="showSuggestions && suggestions.length > 0" 
                class="absolute left-0 right-0 mt-3 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-64 overflow-y-auto"
              >
                <div 
                  v-for="(item, idx) in suggestions" 
                  :key="item.id + item.type"
                  class="px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-sm font-bold text-slate-700 flex items-center justify-between border-b border-slate-50 last:border-b-0"
                  :class="{ 'bg-slate-100': activeSuggestionIndex === idx }"
                  @mousedown="selectSuggestion(item)"
                >
                  <div class="flex items-center space-x-2">
                    <span 
                      class="text-[10px] md:text-xs font-extrabold px-2.5 py-0.5 rounded-full uppercase"
                      :class="item.type === 'book' ? 'bg-blue-100 text-blue-700' : item.type === 'author' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'"
                    >
                      {{ item.type === 'book' ? 'Sách' : item.type === 'author' ? 'Tác giả' : 'NXB' }}
                    </span>
                    <span class="truncate max-w-[280px]">{{ item.text }}</span>
                  </div>
                  <span class="text-[9px] text-slate-400 font-semibold font-mono">Tìm kiếm</span>
                </div>
              </div>
            </div>
          </div>
          <button 
            @click="handleSearch"
            class="w-full md:w-1/3 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2"
          >
            <span>Tìm kiếm sách</span>
            <ArrowRight class="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>

    <!-- 2. QUICK BORROWING LINK / SHORTCUTS -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-gradient-to-br from-white via-primary/5 to-white rounded-3xl border-2 border-primary/10 border-l-4 border-l-primary shadow-md hover:shadow-xl hover:border-primary/20 transition-all duration-300 p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div class="space-y-3">
          <span class="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider inline-block">Tiện ích nhanh</span>
          <h3 class="font-sans text-lg font-extrabold text-slate-900">Đăng ký Thẻ Độc Giả</h3>
          <p class="text-xs text-slate-500 leading-relaxed">Trở thành hội viên chính thức để hưởng các đặc quyền mượn sách không giới hạn tại thư viện.</p>
        </div>
        <div class="flex flex-col space-y-3 bg-amber-50/30 p-5 rounded-2xl border border-amber-200/60 shadow-sm">
          <div class="flex items-center space-x-3">
            <div class="bg-amber-100 text-amber-600 p-2 rounded-lg"><Sparkles class="h-5 w-5" /></div>
            <div>
              <span class="text-xs font-extrabold text-slate-800 block">Gói Hội Viên VIP (GOLD)</span>
              <span class="text-[10px] text-amber-600 font-bold uppercase">Đặc quyền tối đa</span>
            </div>
          </div>
          <span class="text-xs text-slate-500 leading-relaxed">Mượn tối đa 15 cuốn/lần, thời hạn 30 ngày và chia sẻ quyền lợi nhóm gia đình 3 người.</span>
        </div>
        <div class="flex items-center md:justify-end">
          <router-link to="/memberships" class="w-full md:w-auto bg-primary hover:bg-primary-dark text-white font-extrabold px-8 py-3.5 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-xs text-center flex items-center justify-center space-x-2">
            <span>Đăng ký gói hội viên</span>
            <ArrowRight class="h-4 w-4" />
          </router-link>
        </div>
      </div>
    </section>

    <!-- 3. BOOK CATEGORY SEGMENT (Zebra Light Blue Background) -->
    <section class="bg-slate-50 py-16 border-y border-slate-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div class="text-center max-w-2xl mx-auto space-y-2">
          <span class="text-xs font-bold text-primary uppercase">Khám phá tri thức</span>
          <h2 class="font-sans text-2xl md:text-3xl font-extrabold text-slate-900">Chọn sách theo nhóm ngành học tập</h2>
          <p class="text-xs text-slate-500">Đầy đủ các thể loại từ Công nghệ thông tin, Kinh tế đến Ngoại ngữ, Luật học.</p>
        </div>

        <div v-if="categories.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          <div 
            v-for="cat in visibleCategories" 
            :key="cat._id"
            @click="selectCategory(cat._id)"
            class="bg-white p-6 rounded-2xl border border-slate-200 text-center hover:border-primary hover:shadow-md cursor-pointer transition-all group"
          >
            <div class="bg-primary/10 h-12 w-12 rounded-xl flex items-center justify-center mx-auto mb-3 text-primary group-hover:bg-primary group-hover:text-white transition-all">
              <FolderOpen class="h-6 w-6" />
            </div>
            <span class="text-sm font-semibold block truncate text-slate-700">{{ cat.tenTheLoai }}</span>
          </div>
        </div>
        <div v-else class="text-center text-sm text-slate-400 py-6">Đang tải danh mục thể loại...</div>

        <!-- Toggle expand/collapse button (Bảo đảm giới hạn 1 hàng) -->
        <div v-if="categories.length > 6" class="flex justify-center mt-6">
          <button 
            @click="isExpanded = !isExpanded" 
            class="bg-white hover:bg-slate-50 text-primary font-bold text-xs border border-slate-200 px-6 py-2.5 rounded-xl shadow-sm transition-all flex items-center space-x-1"
          >
            <span>{{ isExpanded ? 'Thu gọn' : 'Xem thêm danh mục' }}</span>
            <ChevronDown :class="isExpanded ? 'rotate-180' : ''" class="h-4 w-4 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </section>

    <!-- 4. NEWEST BOOKS SECTION (Zebra White Background) -->
    <section id="newest-books" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div class="space-y-1">
          <span class="text-xs font-bold text-primary uppercase">Cập nhật liên tục</span>
          <h2 class="font-sans text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center">
            <Sparkles class="h-6 w-6 mr-2 text-yellow-500" /> Sách Mới Nhập Kho
          </h2>
        </div>
        <router-link to="/books" class="text-sm font-bold text-primary hover:underline mt-2 sm:mt-0 inline-flex items-center">
          <span>Xem tất cả kho sách</span>
          <ArrowRight class="h-4 w-4 ml-1" />
        </router-link>
      </div>

      <!-- Tab Switcher (Giống TiemChung) -->
      <div class="flex space-x-2">
        <button 
          @click="activeTab = 'all'" 
          :class="activeTab === 'all' ? 'bg-primary text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
          class="px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all"
        >
          Tất cả sách mới
        </button>
        <button 
          @click="activeTab = 'featured'" 
          :class="activeTab === 'featured' ? 'bg-primary text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
          class="px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all"
        >
          Sách mượn nhiều
        </button>
      </div>

      <div v-if="newBooks.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        <div 
          v-for="book in visibleBooks" 
          :key="book._id"
          class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group cursor-pointer"
          @click="viewBook(book._id)"
        >
          <div class="relative pt-[135%] bg-slate-100 overflow-hidden">
            <img 
              :src="getImageUrl(book.hinhAnh)" 
              :alt="book.tenSach" 
              class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <span 
              v-if="book.trangThai === 'DISCONTINUED'"
              class="absolute top-2 right-2 bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full"
            >
              Ngừng mượn
            </span>
          </div>
          <div class="p-4 space-y-2 flex-grow flex flex-col justify-between">
            <div class="space-y-1">
              <span class="text-xs text-primary font-bold uppercase tracking-wider block">
                {{ book.theLoai?.tenTheLoai || 'Thể loại' }}
              </span>
              <h3 class="font-bold text-sm text-slate-800 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                {{ book.tenSach }}
              </h3>
            </div>
            <div class="flex items-center justify-between pt-2 text-xs border-t border-slate-100">
              <span class="text-slate-500 truncate max-w-[100px]">
                {{ book.tacGia?.map(t => t.tenTacGia).join(', ') || 'Tác giả' }}
              </span>
              <span class="font-bold text-slate-900 text-[10px]">
                {{ formatCurrency(book.giaBia) }} <span class="text-slate-300 font-normal">/</span> <span class="text-primary font-extrabold">{{ formatCurrency(book.giaBia * 0.02) }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center text-sm text-slate-400 py-12">Đang tải danh sách sách mới...</div>

      <!-- Toggle expand/collapse button for books (Bảo đảm giới hạn 1 hàng) -->
      <div v-if="filteredBooks.length > 5" class="flex justify-center mt-8">
        <button 
          @click="isBooksExpanded = !isBooksExpanded" 
          class="bg-white hover:bg-slate-50 text-primary font-bold text-xs border border-slate-200 px-6 py-2.5 rounded-xl shadow-sm transition-all flex items-center space-x-1"
        >
          <span>{{ isBooksExpanded ? 'Thu gọn danh sách' : 'Xem thêm sách mới' }}</span>
          <ChevronDown :class="isBooksExpanded ? 'rotate-180' : ''" class="h-4 w-4 transition-transform duration-200" />
        </button>
      </div>
    </section>

    <!-- 5. SAFE BORROWING PROCESS (Quy trình mượn sách 4 bước dạng dọc giống TiemChung) -->
    <section class="bg-slate-50 py-16 border-y border-slate-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div class="text-center mx-auto space-y-2">
          <span class="bg-primary-light text-primary px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-block">Quy trình đơn giản</span>
          <h2 class="font-sans text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900">4 Bước Đăng Ký Mượn Sách Trực Tuyến</h2>
          <p class="text-xs text-slate-500 max-w-2xl mx-auto">CTU eLibrary áp dụng quy trình mượn trả tiện lợi giúp độc giả tiết kiệm tối đa thời gian.</p>
        </div>

        <!-- Timeline Layout -->
        <div ref="timelineRef" class="relative max-w-3xl mx-auto">
          <!-- Connector line -->
          <div class="hidden md:block absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/60 to-primary/20"></div>

          <!-- Step 1 -->
          <div 
            :class="[
              'flex gap-6 mb-8 relative safe-step',
              isVisible ? 'animate-active' : ''
            ]"
          >
            <div class="shrink-0 w-16 h-16 bg-primary text-white rounded-2xl font-black text-xl flex items-center justify-center shadow-md border-4 border-white z-10 relative">1</div>
            <div class="flex-1 bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 border border-slate-100 relative overflow-hidden group">
              <div class="absolute left-0 top-0 bottom-0 w-[4px] bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300"></div>
              <div class="flex items-center gap-3 mb-2">
                <Search class="w-5 h-5 text-primary" />
                <h4 class="font-bold text-slate-900 text-base">{{ homepageSettings.step1Title || 'Tìm kiếm & Chọn sách' }}</h4>
              </div>
              <p class="text-sm text-slate-600 leading-relaxed">{{ homepageSettings.step1Desc || 'Tra cứu đầu sách mong muốn trên hệ thống cổng thư viện điện tử CTU eLibrary với bộ lọc thông minh.' }}</p>
            </div>
          </div>

          <!-- Step 2 -->
          <div 
            :class="[
              'flex gap-6 mb-8 relative safe-step step-delay-100',
              isVisible ? 'animate-active' : ''
            ]"
          >
            <div class="shrink-0 w-16 h-16 bg-primary text-white rounded-2xl font-black text-xl flex items-center justify-center shadow-md border-4 border-white z-10 relative">2</div>
            <div class="flex-1 bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 border border-slate-100 relative overflow-hidden group">
              <div class="absolute left-0 top-0 bottom-0 w-[4px] bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300"></div>
              <div class="flex items-center gap-3 mb-2">
                <ShoppingBag class="w-5 h-5 text-primary" />
                <h4 class="font-bold text-slate-900 text-base">{{ homepageSettings.step2Title || 'Thêm vào giỏ mượn' }}</h4>
              </div>
              <p class="text-sm text-slate-600 leading-relaxed">{{ homepageSettings.step2Desc || 'Đưa các cuốn sách cần mượn vào giỏ trực tuyến và xác nhận thời hạn cùng chi nhánh nhận sách mong muốn.' }}</p>
            </div>
          </div>

          <!-- Step 3 -->
          <div 
            :class="[
              'flex gap-6 mb-8 relative safe-step step-delay-200',
              isVisible ? 'animate-active' : ''
            ]"
          >
            <div class="shrink-0 w-16 h-16 bg-primary text-white rounded-2xl font-black text-xl flex items-center justify-center shadow-md border-4 border-white z-10 relative">3</div>
            <div class="flex-1 bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 border border-slate-100 relative overflow-hidden group">
              <div class="absolute left-0 top-0 bottom-0 w-[4px] bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300"></div>
              <div class="flex items-center gap-3 mb-2">
                <CalendarRange class="w-5 h-5 text-primary" />
                <h4 class="font-bold text-slate-900 text-base">{{ homepageSettings.step3Title || 'Nhận mã phiếu hẹn' }}</h4>
              </div>
              <p class="text-sm text-slate-600 leading-relaxed">{{ homepageSettings.step3Desc || 'Hệ thống cấp ngay mã phiếu hẹn điện tử ghi rõ hạn giữ sách và gửi thông tin xác nhận trực tiếp.' }}</p>
            </div>
          </div>

          <!-- Step 4 -->
          <div 
            :class="[
              'flex gap-6 relative safe-step step-delay-300',
              isVisible ? 'animate-active' : ''
            ]"
          >
            <div class="shrink-0 w-16 h-16 bg-primary text-white rounded-2xl font-black text-xl flex items-center justify-center shadow-md border-4 border-white z-10 relative">4</div>
            <div class="flex-1 bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 border border-slate-100 relative overflow-hidden group">
              <div class="absolute left-0 top-0 bottom-0 w-[4px] bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300"></div>
              <div class="flex items-center gap-3 mb-2">
                <UserCheck class="w-5 h-5 text-primary" />
                <h4 class="font-bold text-slate-900 text-base">{{ homepageSettings.step4Title || 'Đến nhận sách giấy' }}</h4>
              </div>
              <p class="text-sm text-slate-600 leading-relaxed">{{ homepageSettings.step4Desc || 'Độc giả xuất trình mã phiếu hẹn tại quầy thủ thư chi nhánh đã chọn để nhận sách giấy trong 5 phút.' }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 6. FAQS ACCORDION (Hỏi đáp) -->
    <section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div class="text-center space-y-2">
        <span class="text-xs font-bold text-primary uppercase">Giải đáp nhanh</span>
        <h2 class="font-sans text-2xl md:text-3xl font-extrabold text-slate-900">Câu Hỏi Thường Gặp</h2>
      </div>

      <div class="space-y-4">
        <div 
          v-for="(faq, index) in faqs" 
          :key="index"
          class="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all"
        >
          <button 
            @click="faq.open = !faq.open"
            class="w-full text-left p-5 flex items-center justify-between font-bold text-sm text-slate-800 focus:outline-none"
          >
            <span>{{ faq.question }}</span>
            <ChevronDown 
              :class="faq.open ? 'rotate-180' : ''"
              class="h-5 w-5 text-slate-400 transition-transform duration-200" 
            />
          </button>
          <div v-show="faq.open" class="px-5 pb-5 text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
            {{ faq.answer }}
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import { 
  Search, 
  ArrowRight, 
  BookMarked, 
  FolderOpen, 
  Sparkles, 
  Bookmark, 
  ChevronDown,
  ShoppingBag,
  CalendarRange,
  UserCheck
} from '@lucide/vue';

const router = useRouter();
const searchQuery = ref('');
const suggestions = ref([]);
const showSuggestions = ref(false);
const activeSuggestionIndex = ref(-1);
const categories = ref([]);
const newBooks = ref([]);
const activeTab = ref('all');
const isExpanded = ref(false);
const isBooksExpanded = ref(false);
const timelineRef = ref(null);
const isVisible = ref(false);
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024);

const itemsPerRow = computed(() => {
  if (windowWidth.value >= 1024) return 5; // lg
  if (windowWidth.value >= 768) return 4;  // md
  if (windowWidth.value >= 640) return 3;  // sm
  return 2;                                // Mobile
});

const visibleCategories = computed(() => {
  // 6 phần tử tương ứng với 1 hàng trên giao diện desktop (md:grid-cols-6)
  return isExpanded.value ? categories.value : categories.value.slice(0, 6);
});

const visibleBooks = computed(() => {
  const cols = itemsPerRow.value;
  if (isBooksExpanded.value) {
    const total = filteredBooks.value.length;
    const maxAllowed = Math.floor(total / cols) * cols;
    return filteredBooks.value.slice(0, maxAllowed || cols);
  }
  return filteredBooks.value.slice(0, cols);
});

const faqs = ref([]);

const getImageUrl = (path) => {
  if (!path) return '/placeholder_book.png';
  if (path.startsWith('http') || path.startsWith('data:image')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `http://localhost:3000${cleanPath}`;
};

const formatCurrency = (val) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
};

let searchTimeout = null;
const fetchSuggestions = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  
  const query = searchQuery.value?.trim();
  if (!query) {
    suggestions.value = [];
    activeSuggestionIndex.value = -1;
    return;
  }
  
  searchTimeout = setTimeout(async () => {
    try {
      const res = await api.get(`/books/search-suggestions?q=${encodeURIComponent(query)}`);
      if (res.success) {
        suggestions.value = res.data;
        activeSuggestionIndex.value = -1; // Reset selection index
      }
    } catch (error) {
      console.error('Fetch suggestions error:', error);
    }
  }, 200);
};

const onKeyDown = () => {
  if (suggestions.value.length === 0) return;
  activeSuggestionIndex.value = (activeSuggestionIndex.value + 1) % suggestions.value.length;
};

const onKeyUp = () => {
  if (suggestions.value.length === 0) return;
  activeSuggestionIndex.value = (activeSuggestionIndex.value - 1 + suggestions.value.length) % suggestions.value.length;
};

const onKeyEnter = () => {
  if (showSuggestions.value && activeSuggestionIndex.value !== -1 && activeSuggestionIndex.value < suggestions.value.length) {
    selectSuggestion(suggestions.value[activeSuggestionIndex.value]);
  } else {
    handleSearch();
  }
};

const selectSuggestion = (item) => {
  searchQuery.value = item.text;
  showSuggestions.value = false;
  activeSuggestionIndex.value = -1;
  if (item.type === 'book') {
    router.push({ name: 'book-detail', params: { id: item.id } });
  } else if (item.type === 'author') {
    router.push({ name: 'books', query: { author: item.id } });
  } else if (item.type === 'publisher') {
    router.push({ name: 'books', query: { publisher: item.id } });
  }
};

const handleSearch = () => {
  if (!searchQuery.value.trim()) return;
  showSuggestions.value = false;
  activeSuggestionIndex.value = -1;
  router.push({ name: 'books', query: { q: searchQuery.value.trim() } });
};

const selectCategory = (catId) => {
  router.push({ name: 'books', query: { category: catId } });
};

const viewBook = (bookId) => {
  router.push({ name: 'book-detail', params: { id: bookId } });
};

const filteredBooks = computed(() => {
  if (activeTab.value === 'all') {
    return newBooks.value;
  }
  // Giả lập sách mượn nhiều (lọc sách có giá trị cao hoặc thứ tự ngẫu nhiên)
  return [...newBooks.value].reverse();
});

const homepageSettings = ref({
  heroTitle: "KHÁM PHÁ THẾ GIỚI TRI THỨC TẠI CTU",
  heroSubtitle: "Tìm kiếm nhanh giáo trình môn học, công trình nghiên cứu khoa học và đăng ký mượn sách giấy trực tuyến dễ dàng tại Đại học Cần Thơ.",
  heroBanner: "/hero_banner.png",
  step1Title: "1. Chọn sách & Đăng ký",
  step1Desc: "Tìm kiếm cuốn sách cần thiết trong kho tài liệu số khổng lồ, nhấn nút đăng ký và lựa chọn gói dịch vụ phù hợp nhất.",
  step2Title: "2. Nhận mã xác nhận",
  step2Desc: "Hệ thống sẽ tự động phê duyệt nhanh chóng và gửi mã vạch xác nhận mượn sách trực tiếp qua thư điện tử/SMS.",
  step3Title: "3. Đến quầy thủ thư",
  step3Desc: "Mang mã xác nhận (hoặc thẻ độc giả) đến quầy thư viện trung tâm để nhận sách giấy trong thời gian hoạt động.",
  step4Title: "4. Trả sách đúng hẹn",
  step4Desc: "Độc giả trả sách tại quầy hoặc thùng trả tự động trước khi hết hạn để tránh phát sinh chi phí phạt không đáng có.",
  faqs: []
});

const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(async () => {
  window.addEventListener('resize', handleResize);

  // Tạo IntersectionObserver để kích hoạt hiệu ứng xuất hiện (fade-right) khi cuộn đến timeline
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        isVisible.value = true;
        observer.disconnect(); // Ngắt quan sát sau khi đã hiển thị
      }
    });
  }, { threshold: 0.15 });

  if (timelineRef.value) {
    observer.observe(timelineRef.value);
  }

  // Tải cấu hình trang chủ động từ API
  try {
    const settingRes = await api.get('/settings/homepage');
    if (settingRes.success && settingRes.data && Object.keys(settingRes.data).length > 0) {
      homepageSettings.value = { ...homepageSettings.value, ...settingRes.data };
    }
  } catch (err) {
    console.error('Fetch homepage settings failed:', err);
  }

  // Khởi tạo faqs động đồng bộ 100% với API settings
  faqs.value = (homepageSettings.value.faqs || []).map(f => ({ ...f, open: false }));

  try {
    const [catRes, bookRes] = await Promise.all([
      api.get('/categories'),
      api.get('/books?limit=10')
    ]);
    if (catRes.success) categories.value = catRes.data;
    if (bookRes.success) newBooks.value = bookRes.data.books;
  } catch (error) {
    console.error('Home load error:', error);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.safe-step {
  opacity: 0;
  transform: translate3d(-100px, 0, 0);
  transition: opacity 1000ms cubic-bezier(0.215, 0.61, 0.355, 1), transform 1000ms cubic-bezier(0.215, 0.61, 0.355, 1);
}

.safe-step.animate-active {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}

.step-delay-100 {
  transition-delay: 100ms;
}

.step-delay-200 {
  transition-delay: 200ms;
}

.step-delay-300 {
  transition-delay: 300ms;
}
</style>
