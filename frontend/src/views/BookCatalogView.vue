<template>
  <div class="space-y-10 pb-16 font-sans">
    
    <!-- 1. Catalog Hero Banner -->
    <section class="bg-gradient-to-r from-primary via-primary-dark to-slate-900 py-16 px-4 text-white relative shadow-inner">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between relative z-10">
        <div class="space-y-4 max-w-4xl">
          <div class="text-xs font-bold text-secondary flex items-center space-x-2">
            <router-link to="/" class="hover:text-white transition-colors">Trang chủ</router-link>
            <span>/</span>
            <span>Danh mục sách</span>
          </div>
          <h1 class="font-sans text-3xl md:text-4xl font-extrabold tracking-tight uppercase">
            {{ catalogSettings.heroTitle || 'Danh mục tài liệu & Kho sách' }}
          </h1>
          <p class="text-slate-200 text-xs md:text-sm leading-relaxed max-w-xl">
            {{ catalogSettings.heroSubtitle || 'Tra cứu giáo trình môn học, công trình nghiên cứu, tài liệu khoa học, tiểu thuyết đang có sẵn tại các chi nhánh thư viện CTU eLibrary.' }}
          </p>
          
          <!-- Search Bar -->
          <div class="flex items-center space-x-2 bg-white px-3 py-2 rounded-2xl border border-slate-100 max-w-md shadow-md text-slate-800 relative z-30">
            <Search class="h-4 w-4 text-slate-400 flex-shrink-0" />
            <div class="relative flex-grow">
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Tìm tên sách, tác giả hoặc từ khóa..." 
                class="w-full focus:outline-none text-xs md:text-sm font-semibold bg-transparent"
                @input="fetchSuggestions"
                @focus="showSuggestions = true"
                @blur="setTimeout(() => { showSuggestions = false; activeSuggestionIndex = -1; }, 200)"
                @keydown.down.prevent="onKeyDown"
                @keydown.up.prevent="onKeyUp"
                @keydown.enter.prevent="onKeyEnter"
                @keydown.esc="showSuggestions = false"
              />
              
              <!-- Suggestions Dropdown -->
              <div 
                v-if="showSuggestions && suggestions.length > 0" 
                class="absolute left-0 right-0 mt-3 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto"
              >
                <div 
                  v-for="(item, idx) in suggestions" 
                  :key="item.id + item.type"
                  class="px-3 py-2.5 hover:bg-slate-50 cursor-pointer text-xs md:text-sm font-bold text-slate-700 flex items-center justify-between border-b border-slate-50 last:border-b-0"
                  :class="{ 'bg-slate-100': activeSuggestionIndex === idx }"
                  @mousedown="selectSuggestion(item)"
                >
                  <div class="flex items-center space-x-2">
                    <span 
                      class="text-[10px] md:text-xs font-extrabold px-2 py-0.5 rounded-full uppercase"
                      :class="item.type === 'book' ? 'bg-primary-light text-primary-dark' : item.type === 'author' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'"
                    >
                      {{ item.type === 'book' ? 'Sách' : item.type === 'author' ? 'Tác giả' : 'NXB' }}
                    </span>
                    <span class="truncate max-w-[200px]">{{ item.text }}</span>
                  </div>
                  <span class="text-[9px] text-slate-400 font-semibold">Tìm kiếm</span>
                </div>
              </div>
            </div>
            <button @click="executeSearch" class="bg-primary hover:bg-primary-dark text-white font-bold text-xs px-4 py-1.5 rounded-lg transition-colors flex-shrink-0">Lọc</button>
          </div>
        </div>
        
        <!-- Decoration graphic -->
        <div class="hidden md:block opacity-20">
          <BookOpen class="h-40 w-40 text-white" />
        </div>
      </div>
      <div class="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-sky-400 via-indigo-950 to-slate-950 pointer-events-none"></div>
    </section>

    <!-- 2. Main Catalog Layout -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row gap-8">
        
        <!-- Left Sidebar: Filter Panel -->
        <aside class="w-full md:w-64 flex-shrink-0">
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            
            <!-- 1. Category Filter Section -->
            <div class="p-5 space-y-3">
              <button 
                @click="isCategoryOpen = !isCategoryOpen"
                class="w-full flex items-center justify-between font-bold text-slate-800 text-xs uppercase tracking-wider focus:outline-none"
              >
                <span class="flex items-center">
                  <Filter class="h-4 w-4 mr-2 text-primary" /> Thể loại
                </span>
                <ChevronDown v-if="!isCategoryOpen" class="h-4 w-4 text-slate-400" />
                <ChevronUp v-else class="h-4 w-4 text-slate-400" />
              </button>
              
              <div v-show="isCategoryOpen" class="space-y-3 pt-2">
                <!-- Quick Search Input -->
                <input 
                  v-model="categorySearch" 
                  type="text" 
                  placeholder="Tìm nhanh thể loại..." 
                  class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-primary/50 bg-slate-50/50" 
                />
                
                <div class="max-h-48 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                  <button 
                    @click="filterCategory(null)"
                    class="w-full text-left py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between"
                    :class="!selectedCatId ? 'bg-primary text-white shadow-sm' : 'hover:bg-slate-50 text-slate-700'"
                  >
                    <span>Tất cả thể loại</span>
                    <Check v-if="!selectedCatId" class="h-3.5 w-3.5" />
                  </button>
                  
                  <button 
                    v-for="cat in filteredCategories" 
                    :key="cat._id"
                    @click="filterCategory(cat._id)"
                    class="w-full text-left py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between truncate"
                    :class="selectedCatId === cat._id ? 'bg-primary text-white shadow-sm' : 'hover:bg-slate-50 text-slate-700'"
                  >
                    <span>{{ cat.tenTheLoai }}</span>
                    <Check v-if="selectedCatId === cat._id" class="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <!-- 2. Author Filter Section -->
            <div class="p-5 space-y-3">
              <button 
                @click="isAuthorOpen = !isAuthorOpen"
                class="w-full flex items-center justify-between font-bold text-slate-800 text-xs uppercase tracking-wider focus:outline-none"
              >
                <span class="flex items-center">
                  <User class="h-4 w-4 mr-2 text-primary" /> Tác giả
                </span>
                <ChevronDown v-if="!isAuthorOpen" class="h-4 w-4 text-slate-400" />
                <ChevronUp v-else class="h-4 w-4 text-slate-400" />
              </button>
              
              <div v-show="isAuthorOpen" class="space-y-3 pt-2">
                <!-- Quick Search Input -->
                <input 
                  v-model="authorSearch" 
                  type="text" 
                  placeholder="Tìm nhanh tác giả..." 
                  class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-primary/50 bg-slate-50/50" 
                />
                
                <div class="max-h-48 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                  <button 
                    @click="filterAuthor(null)"
                    class="w-full text-left py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between"
                    :class="!selectedAuthorId ? 'bg-primary text-white shadow-sm' : 'hover:bg-slate-50 text-slate-700'"
                  >
                    <span>Tất cả tác giả</span>
                    <Check v-if="!selectedAuthorId" class="h-3.5 w-3.5" />
                  </button>
                  
                  <button 
                    v-for="author in filteredAuthors" 
                    :key="author._id"
                    @click="filterAuthor(author._id)"
                    class="w-full text-left py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between truncate"
                    :class="selectedAuthorId === author._id ? 'bg-primary text-white shadow-sm' : 'hover:bg-slate-50 text-slate-700'"
                  >
                    <span>{{ author.tenTacGia }}</span>
                    <Check v-if="selectedAuthorId === author._id" class="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <!-- 3. Publisher Filter Section -->
            <div class="p-5 space-y-3">
              <button 
                @click="isPublisherOpen = !isPublisherOpen"
                class="w-full flex items-center justify-between font-bold text-slate-800 text-xs uppercase tracking-wider focus:outline-none"
              >
                <span class="flex items-center">
                  <BookOpen class="h-4 w-4 mr-2 text-primary" /> Nhà xuất bản
                </span>
                <ChevronDown v-if="!isPublisherOpen" class="h-4 w-4 text-slate-400" />
                <ChevronUp v-else class="h-4 w-4 text-slate-400" />
              </button>
              
              <div v-show="isPublisherOpen" class="space-y-3 pt-2">
                <!-- Quick Search Input -->
                <input 
                  v-model="publisherSearch" 
                  type="text" 
                  placeholder="Tìm nhanh nhà xuất bản..." 
                  class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-primary/50 bg-slate-50/50" 
                />
                
                <div class="max-h-48 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                  <button 
                    @click="filterPublisher(null)"
                    class="w-full text-left py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between"
                    :class="!selectedPublisherId ? 'bg-primary text-white shadow-sm' : 'hover:bg-slate-50 text-slate-700'"
                  >
                    <span>Tất cả NXB</span>
                    <Check v-if="!selectedPublisherId" class="h-3.5 w-3.5" />
                  </button>
                  
                  <button 
                    v-for="pub in filteredPublishers" 
                    :key="pub._id"
                    @click="filterPublisher(pub._id)"
                    class="w-full text-left py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between truncate"
                    :class="selectedPublisherId === pub._id ? 'bg-primary text-white shadow-sm' : 'hover:bg-slate-50 text-slate-700'"
                  >
                    <span>{{ pub.tenNXB }}</span>
                    <Check v-if="selectedPublisherId === pub._id" class="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </aside>

        <!-- Right Main Grid: Books Grid -->
        <section class="flex-grow space-y-6">
          <!-- Toolbar -->
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 class="font-bold text-slate-900 text-base">
                Danh sách tài liệu học tập
              </h2>
              <p class="text-xs text-slate-500 font-medium">Tìm thấy {{ totalCount }} sách phù hợp</p>
            </div>
            
            <!-- Sort Pills (Giống TiemChung) -->
            <div class="flex items-center space-x-2 text-xs">
              <span class="text-slate-400 font-semibold">Sắp xếp:</span>
              <div class="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
                <button 
                  @click="setSort('popular')"
                  :class="sortType === 'popular' ? 'bg-white text-primary font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'"
                  class="px-3 py-1 rounded-lg transition-all"
                >
                  Phổ biến
                </button>
                <button 
                  @click="setSort('price_asc')"
                  :class="sortType === 'price_asc' ? 'bg-white text-primary font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'"
                  class="px-3 py-1 rounded-lg transition-all"
                >
                  Giá tăng
                </button>
                <button 
                  @click="setSort('price_desc')"
                  :class="sortType === 'price_desc' ? 'bg-white text-primary font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'"
                  class="px-3 py-1 rounded-lg transition-all"
                >
                  Giá giảm
                </button>
              </div>
            </div>
          </div>

          <!-- Books Grid -->
          <div v-if="books.length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            <div 
              v-for="book in books" 
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
                <span
                  v-else-if="book.soLuongKhaDung > 0"
                  class="absolute top-2 right-2 bg-primary-light text-primary-dark text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                >
                  Còn {{ book.soLuongKhaDung }}
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
                  <span class="font-extrabold text-primary text-xs">
                    Miễn phí
                  </span>
                </div>
                <div class="grid grid-cols-[42px_1fr] gap-2 pt-2" @click.stop>
                  <button
                    @click="addBookToCart(book)"
                    :disabled="!canBorrowBook(book)"
                    class="h-9 rounded-xl border border-primary/20 bg-primary-light text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Thêm vào giỏ mượn"
                  >
                    <ShoppingBag class="h-4 w-4" />
                  </button>
                  <button
                    @click="quickBorrow(book)"
                    :disabled="!canBorrowBook(book) || quickBorrowingId === book._id"
                    class="h-9 rounded-xl bg-primary hover:bg-primary-dark text-white text-[11px] font-extrabold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ quickBorrowingId === book._id ? 'Đang xử lý...' : 'Mượn ngay' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="loading" class="text-center py-20 text-slate-400 font-medium">Đang tải danh mục sách...</div>
          <div v-else class="text-center py-20 text-slate-400 font-medium bg-white rounded-2xl border border-slate-200 shadow-sm">
            Không tìm thấy sách nào phù hợp.
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex justify-center items-center space-x-1.5 pt-6">
            <button 
              @click="changePage(1)" 
              :disabled="currentPage === 1"
              class="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-xs font-bold transition-colors"
            >
              Đầu
            </button>
            <button 
              @click="changePage(currentPage - 1)" 
              :disabled="currentPage === 1"
              class="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-xs font-bold transition-colors"
            >
              Trước
            </button>
            
            <template v-for="(page, idx) in visiblePages" :key="idx">
              <span v-if="page === '...'" class="px-1.5 text-xs font-bold text-slate-400">...</span>
              <button 
                v-else
                @click="changePage(page)"
                class="w-8 h-8 rounded-xl border text-xs font-bold transition-all"
                :class="page === currentPage 
                  ? 'bg-primary text-white border-primary shadow-sm' 
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'"
              >
                {{ page }}
              </button>
            </template>

            <button 
              @click="changePage(currentPage + 1)" 
              :disabled="currentPage === totalPages"
              class="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-xs font-bold transition-colors"
            >
              Sau
            </button>
            <button 
              @click="changePage(totalPages)" 
              :disabled="currentPage === totalPages"
              class="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-xs font-bold transition-colors"
            >
              Cuối
            </button>
          </div>
        </section>
      </div>
    </div>
  </div>
  <Teleport to="body">
    <div
      v-if="quickBorrowBook"
      class="fixed inset-0 bg-slate-900/60 z-[99999] flex items-center justify-center p-4 backdrop-blur-sm"
      @click.self="closeQuickBorrowModal"
    >
      <div class="bg-white rounded-3xl max-w-sm w-full p-6 space-y-5 shadow-2xl border border-slate-150">
        <div class="space-y-1">
          <h3 class="font-sans font-extrabold text-slate-900 text-sm uppercase tracking-wide">Xác nhận mượn sách</h3>
          <p class="text-xs font-bold text-slate-600 leading-relaxed">
            Bạn muốn đăng ký mượn sách này với số lượng bao nhiêu?
          </p>
          <p class="text-xs font-extrabold text-slate-900 leading-relaxed bg-slate-50 border border-slate-100 rounded-2xl px-3 py-2 max-h-20 overflow-y-auto">
            {{ quickBorrowBook.tenSach }}
          </p>
          <p class="text-[11px] font-bold text-primary-dark bg-primary-light border border-primary/10 rounded-2xl px-3 py-2 leading-relaxed">
            Thời gian mượn dự kiến: {{ getBorrowDays(getDefaultReturnDate()) }} ngày, từ {{ formatBorrowDate(new Date()) }} đến {{ formatBorrowDate(getDefaultReturnDate()) }}.
          </p>
        </div>

        <div class="space-y-2">
          <label class="text-[10px] font-bold text-slate-500 uppercase">Số lượng muốn mượn</label>
          <div class="flex items-center justify-between gap-3">
            <div class="inline-flex items-center rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
              <button
                @click="changeQuickBorrowQuantity(-1)"
                :disabled="quickBorrowQuantity <= 1"
                class="h-9 w-9 text-sm font-black text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >-</button>
              <input
                v-model.number="quickBorrowQuantity"
                type="number"
                min="1"
                :max="quickBorrowBook.soLuongKhaDung || 1"
                @input="clampQuickBorrowQuantity"
                class="h-9 w-16 bg-white border-x border-slate-200 text-center text-xs font-extrabold text-slate-800 focus:outline-none"
              />
              <button
                @click="changeQuickBorrowQuantity(1)"
                :disabled="quickBorrowQuantity >= (quickBorrowBook.soLuongKhaDung || 1)"
                class="h-9 w-9 text-sm font-black text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >+</button>
            </div>
            <span class="text-[10px] font-semibold text-slate-400">Còn {{ quickBorrowBook.soLuongKhaDung || 1 }} bản</span>
          </div>
        </div>

        <div class="flex space-x-3 pt-1">
          <button
            @click="closeQuickBorrowModal"
            class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold py-2.5 rounded-xl text-xs transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            @click="submitQuickBorrow"
            :disabled="quickBorrowingId === quickBorrowBook._id"
            class="flex-1 bg-primary hover:bg-primary-dark text-white font-extrabold py-2.5 rounded-xl text-xs transition-all shadow-md disabled:opacity-50"
          >
            {{ quickBorrowingId === quickBorrowBook._id ? 'Đang xử lý...' : 'Mượn ngay' }}
          </button>
        </div>
      </div>
    </div>
    <ConfirmModal ref="confirmModal" />
  </Teleport>
</template>

<script setup>
import { ref, onMounted, watch, computed, nextTick } from 'vue';
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router';
import api from '../services/api';
import { Search, BookOpen, Filter, Check, User, ChevronDown, ChevronUp, ShoppingBag } from '@lucide/vue';
import { useAuthStore } from '../stores/auth';
import ConfirmModal from '../components/ConfirmModal.vue';
import { useCartStore } from '../stores/cart';
import { useToastStore } from '../stores/toast';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();
const toast = useToastStore();
const confirmModal = ref(null);

onBeforeRouteLeave((to, from) => {
  if (to.name === 'book-detail') {
    sessionStorage.setItem('catalog_scroll_y', window.scrollY);
  }
});

const categories = ref([]);
const authors = ref([]);
const publishers = ref([]);
const books = ref([]);
const totalCount = ref(0);
const loading = ref(false);
const quickBorrowingId = ref(null);
const quickBorrowBook = ref(null);
const quickBorrowQuantity = ref(1);

const isCategoryOpen = ref(true);
const isAuthorOpen = ref(false);
const isPublisherOpen = ref(false);

const categorySearch = ref('');
const authorSearch = ref('');
const publisherSearch = ref('');

const suggestions = ref([]);
const showSuggestions = ref(false);
const activeSuggestionIndex = ref(-1);

const filteredCategories = computed(() => {
  const q = categorySearch.value.trim().toLowerCase();
  if (!q) return categories.value;
  return categories.value.filter(c => c.tenTheLoai.toLowerCase().includes(q));
});

const filteredAuthors = computed(() => {
  const q = authorSearch.value.trim().toLowerCase();
  if (!q) return authors.value;
  return authors.value.filter(a => a.tenTacGia.toLowerCase().includes(q));
});

const filteredPublishers = computed(() => {
  const q = publisherSearch.value.trim().toLowerCase();
  if (!q) return publishers.value;
  return publishers.value.filter(p => p.tenNXB.toLowerCase().includes(q));
});

const selectedCatId = ref(route.query.category || null);
const selectedAuthorId = ref(route.query.author || null);
const selectedPublisherId = ref(route.query.publisher || null);
const searchQuery = ref(route.query.q || '');
const currentPage = ref(parseInt(route.query.page || '1', 10));
const sortType = ref('popular');
const limit = 12;
const totalPages = ref(1);

const visiblePages = computed(() => {
  const pages = [];
  const range = 1;
  for (let i = 1; i <= totalPages.value; i++) {
    if (
      i === 1 ||
      i === totalPages.value ||
      (i >= currentPage.value - range && i <= currentPage.value + range)
    ) {
      pages.push(i);
    } else if (
      (i === 2 && currentPage.value - range > 2) ||
      (i === totalPages.value - 1 && currentPage.value + range < totalPages.value - 1)
    ) {
      pages.push('...');
    }
  }
  return pages.filter((item, index, self) => {
    if (item === '...') {
      return self[index - 1] !== '...';
    }
    return true;
  });
});

const getImageUrl = (path) => {
  if (!path) return '/placeholder_book.png';
  if (path.startsWith('http') || path.startsWith('data:image')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `http://localhost:3000${cleanPath}`;
};

const formatCurrency = (val) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
};

const filterCategory = (catId) => {
  selectedCatId.value = catId;
  currentPage.value = 1;
  updateRouter();
};

const filterAuthor = (authorId) => {
  selectedAuthorId.value = authorId;
  currentPage.value = 1;
  updateRouter();
};

const filterPublisher = (pubId) => {
  selectedPublisherId.value = pubId;
  currentPage.value = 1;
  updateRouter();
};

let searchTimeout = null;
const fetchSuggestions = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  
  const query = searchQuery.value?.trim();
  if (!query) {
    suggestions.value = [];
    return;
  }
  
  searchTimeout = setTimeout(async () => {
    try {
      const res = await api.get(`/books/search-suggestions?q=${encodeURIComponent(query)}`);
      if (res.success) {
        suggestions.value = res.data;
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
    executeSearch();
  }
};

const selectSuggestion = (item) => {
  showSuggestions.value = false;
  activeSuggestionIndex.value = -1;
  
  if (item.type === 'book') {
    searchQuery.value = item.text;
    router.push({ name: 'book-detail', params: { id: item.id } });
  } else if (item.type === 'author') {
    searchQuery.value = ''; // Reset searchQuery để tránh so khớp nhầm tên sách vs tên tác giả
    selectedAuthorId.value = item.id;
    currentPage.value = 1;
    updateRouter();
  } else if (item.type === 'publisher') {
    searchQuery.value = ''; // Reset searchQuery để tránh so khớp nhầm tên sách vs tên NXB
    selectedPublisherId.value = item.id;
    currentPage.value = 1;
    updateRouter();
  }
};

const executeSearch = () => {
  showSuggestions.value = false;
  activeSuggestionIndex.value = -1;
  currentPage.value = 1;
  updateRouter();
};

const setSort = (type) => {
  sortType.value = type;
  fetchBooks();
};

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  updateRouter();
};

const updateRouter = () => {
  const query = {};
  if (selectedCatId.value) query.category = selectedCatId.value;
  if (selectedAuthorId.value) query.author = selectedAuthorId.value;
  if (selectedPublisherId.value) query.publisher = selectedPublisherId.value;
  if (searchQuery.value.trim()) query.q = searchQuery.value.trim();
  if (currentPage.value > 1) query.page = currentPage.value;
  router.push({ name: 'books', query });
};

const fetchBooks = async () => {
  loading.value = true;
  try {
    let url = `/books?page=${currentPage.value}&limit=${limit}`;
    if (selectedCatId.value) url += `&category=${selectedCatId.value}`;
    if (selectedAuthorId.value) url += `&author=${selectedAuthorId.value}`;
    if (selectedPublisherId.value) url += `&publisher=${selectedPublisherId.value}`;
    if (searchQuery.value.trim()) url += `&q=${encodeURIComponent(searchQuery.value.trim())}`;
    
    const res = await api.get(url);
    if (res.success) {
      let booksData = res.data.books;
      
      // Sort logic client-side to keep KISS
      if (sortType.value === 'price_asc') {
        booksData.sort((a, b) => (a.giaBia || 0) - (b.giaBia || 0));
      } else if (sortType.value === 'price_desc') {
        booksData.sort((a, b) => (b.giaBia || 0) - (a.giaBia || 0));
      }

      books.value = booksData;
      totalCount.value = res.data.totalCount;
      totalPages.value = Math.ceil(totalCount.value / limit);

      // Phục hồi vị trí cuộn sau khi DOM render xong
      nextTick(() => {
        const savedScroll = sessionStorage.getItem('catalog_scroll_y');
        if (savedScroll) {
          window.scrollTo({
            top: parseInt(savedScroll, 10),
            behavior: 'auto'
          });
          sessionStorage.removeItem('catalog_scroll_y');
        }
      });
    }
  } catch (error) {
    console.error('Catalog fetch error:', error);
  } finally {
    loading.value = false;
  }
};

const viewBook = (bookId) => {
  router.push({ name: 'book-detail', params: { id: bookId } });
};

const canBorrowBook = (book) => book.trangThai === 'ACTIVE' && Number(book.soLuongKhaDung) > 0;

const ensureReaderCanBorrow = async () => {
  if (!authStore.isAuthenticated) {
    const ok = await confirmModal.value.ask({
      title: 'Yêu cầu đăng nhập',
      message: 'Bạn cần đăng nhập tài khoản Độc giả để thực hiện mượn sách. Đi đến trang đăng nhập?',
      confirmText: 'Đăng nhập ngay',
      cancelText: 'Hủy bỏ'
    });
    if (ok) {
      router.push({ name: 'login', query: { redirect: route.fullPath } });
    }
    return false;
  }
  if (authStore.isStaff) {
    toast.show('Tài khoản nhân viên không có quyền đăng ký mượn sách.', 'warning');
    return false;
  }
  return true;
};

const addBookToCart = async (book) => {
  if (!(await ensureReaderCanBorrow()) || !canBorrowBook(book)) return;
  cartStore.addBook(book, 1);
  toast.show('Đã thêm sách vào giỏ mượn.', 'success');
};

const getDefaultReturnDate = () => {
  const maxDays = authStore.user?.subscriptionPlan?.soNgayMuonToiDa || 14;
  const date = new Date();
  date.setDate(date.getDate() + Math.min(14, maxDays));
  return date.toISOString().split('T')[0];
};

const formatBorrowDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const getBorrowDays = (returnDateValue) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const returnDate = new Date(returnDateValue);
  returnDate.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((returnDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
};

const quickBorrow = async (book) => {
  if (!(await ensureReaderCanBorrow()) || !canBorrowBook(book) || quickBorrowingId.value) return;
  quickBorrowBook.value = book;
  quickBorrowQuantity.value = 1;
};

const closeQuickBorrowModal = () => {
  if (quickBorrowingId.value) return;
  quickBorrowBook.value = null;
  quickBorrowQuantity.value = 1;
};

const clampQuickBorrowQuantity = () => {
  if (!quickBorrowBook.value) return;
  const max = Math.max(1, Number(quickBorrowBook.value.soLuongKhaDung) || 1);
  quickBorrowQuantity.value = Math.min(Math.max(1, Number(quickBorrowQuantity.value) || 1), max);
};

const changeQuickBorrowQuantity = (delta) => {
  quickBorrowQuantity.value += delta;
  clampQuickBorrowQuantity();
};

const submitQuickBorrow = async () => {
  if (!quickBorrowBook.value || quickBorrowingId.value) return;
  clampQuickBorrowQuantity();
  const book = quickBorrowBook.value;
  quickBorrowingId.value = book._id;
  try {
    const payload = {
      chiTietMuon: [{ sach: book._id, soLuong: quickBorrowQuantity.value }],
      ngayHenTra: getDefaultReturnDate(),
      phiMuon: 0,
      soTienGiam: 0,
      tongTienThanhToan: 0,
    };
    const res = await api.post('/borrowing/receipts', payload);
    if (res.success) {
      toast.show('Đăng ký mượn sách thành công! Vui lòng đến thư viện nhận sách.', 'success');
      quickBorrowBook.value = null;
      router.push('/profile');
    }
  } catch (error) {
    toast.show(error.message || 'Gặp lỗi trong quá trình đăng ký mượn sách.', 'error');
  } finally {
    quickBorrowingId.value = null;
  }
};

const catalogSettings = ref({
  heroTitle: "Danh mục tài liệu & Kho sách",
  heroSubtitle: "Tra cứu giáo trình môn học, công trình nghiên cứu, tài liệu khoa học, tiểu thuyết đang có sẵn tại các chi nhánh thư viện CTU eLibrary."
});

onMounted(async () => {
  // Tải cấu hình trang danh mục sách
  try {
    const settingRes = await api.get('/settings/catalogpage');
    if (settingRes.success && settingRes.data && Object.keys(settingRes.data).length > 0) {
      catalogSettings.value = { ...catalogSettings.value, ...settingRes.data };
    }
  } catch (err) {
    console.error('Fetch catalog settings failed:', err);
  }

  try {
    const [catRes, authorRes, publisherRes] = await Promise.all([
      api.get('/categories'),
      api.get('/authors'),
      api.get('/publishers')
    ]);
    if (catRes.success) categories.value = catRes.data;
    if (authorRes.success) authors.value = authorRes.data;
    if (publisherRes.success) publishers.value = publisherRes.data;
  } catch (error) {
    console.error('Categories, Authors, Publishers load error:', error);
  }
  fetchBooks();
});

watch(
  () => route.query,
  (newQuery) => {
    selectedCatId.value = newQuery.category || null;
    selectedAuthorId.value = newQuery.author || null;
    selectedPublisherId.value = newQuery.publisher || null;
    searchQuery.value = newQuery.q || '';
    currentPage.value = parseInt(newQuery.page || '1', 10);
    fetchBooks();
  }
);
</script>
