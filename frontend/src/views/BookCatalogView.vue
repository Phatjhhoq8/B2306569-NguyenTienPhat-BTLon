<template>
  <div class="space-y-10 pb-16 font-sans">
    
    <!-- 1. Catalog Hero Banner -->
    <section class="bg-gradient-to-r from-primary via-blue-900 to-indigo-900 py-16 px-4 text-white relative overflow-hidden shadow-inner">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between relative z-10">
        <div class="space-y-4 max-w-2xl">
          <div class="text-xs font-bold text-secondary flex items-center space-x-2">
            <router-link to="/" class="hover:text-white transition-colors">Trang chủ</router-link>
            <span>/</span>
            <span>Danh mục sách</span>
          </div>
          <h1 class="font-sans text-3xl md:text-4xl font-extrabold tracking-tight uppercase">Danh mục tài liệu & Kho sách</h1>
          <p class="text-slate-200 text-xs md:text-sm leading-relaxed max-w-xl">
            Tra cứu giáo trình môn học, công trình nghiên cứu, tài liệu khoa học, tiểu thuyết đang có sẵn tại các chi nhánh thư viện CTU eLibrary.
          </p>
          
          <!-- Search Bar -->
          <div class="flex items-center space-x-2 bg-white px-3 py-2 rounded-2xl border border-slate-100 max-w-md shadow-md text-slate-800">
            <Search class="h-4 w-4 text-slate-400 flex-shrink-0" />
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Tìm tên sách, tác giả hoặc từ khóa..." 
              class="w-full focus:outline-none text-xs bg-transparent font-medium"
              @input="handleQueryChange"
            />
            <button @click="fetchBooks" class="bg-primary hover:bg-primary-dark text-white font-bold text-xs px-4 py-1.5 rounded-lg transition-colors">Lọc</button>
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
        <aside class="w-full md:w-64 flex-shrink-0 space-y-6">
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 class="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center text-sm uppercase tracking-wider">
              <Filter class="h-4 w-4 mr-2 text-primary" /> Bộ lọc thể loại
            </h3>
            
            <div class="space-y-1">
              <button 
                @click="filterCategory(null)"
                class="w-full text-left py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between"
                :class="!selectedCatId ? 'bg-primary text-white shadow-sm' : 'hover:bg-slate-50 text-slate-700'"
              >
                <span>Tất cả thể loại</span>
                <Check v-if="!selectedCatId" class="h-3.5 w-3.5" />
              </button>
              
              <button 
                v-for="cat in categories" 
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
                  <span class="font-bold text-slate-900">
                    {{ formatCurrency(book.giaBia) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="loading" class="text-center py-20 text-slate-400 font-medium">Đang tải danh mục sách...</div>
          <div v-else class="text-center py-20 text-slate-400 font-medium bg-white rounded-2xl border border-slate-200 shadow-sm">
            Không tìm thấy sách nào phù hợp.
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex justify-center items-center space-x-2 pt-6">
            <button 
              @click="changePage(currentPage - 1)" 
              :disabled="currentPage === 1"
              class="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-xs font-bold transition-colors"
            >
              Trước
            </button>
            <span class="text-xs font-bold text-slate-500">Trang {{ currentPage }} / {{ totalPages }}</span>
            <button 
              @click="changePage(currentPage + 1)" 
              :disabled="currentPage === totalPages"
              class="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-xs font-bold transition-colors"
            >
              Sau
            </button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api';
import { Search, BookOpen, Filter, Check } from '@lucide/vue';

const route = useRoute();
const router = useRouter();

const categories = ref([]);
const books = ref([]);
const totalCount = ref(0);
const loading = ref(false);

const selectedCatId = ref(route.query.category || null);
const searchQuery = ref(route.query.q || '');
const currentPage = ref(parseInt(route.query.page || '1', 10));
const sortType = ref('popular');
const limit = 12;
const totalPages = ref(1);

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

const handleQueryChange = () => {
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
  if (searchQuery.value.trim()) query.q = searchQuery.value.trim();
  if (currentPage.value > 1) query.page = currentPage.value;
  router.push({ name: 'books', query });
};

const fetchBooks = async () => {
  loading.value = true;
  try {
    let url = `/books?page=${currentPage.value}&limit=${limit}`;
    if (selectedCatId.value) url += `&category=${selectedCatId.value}`;
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

onMounted(async () => {
  try {
    const res = await api.get('/categories');
    if (res.success) categories.value = res.data;
  } catch (error) {
    console.error('Categories load error:', error);
  }
  fetchBooks();
});

watch(
  () => route.query,
  (newQuery) => {
    selectedCatId.value = newQuery.category || null;
    searchQuery.value = newQuery.q || '';
    currentPage.value = parseInt(newQuery.page || '1', 10);
    fetchBooks();
  }
);
</script>
