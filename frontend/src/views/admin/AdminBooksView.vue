<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-3">
      <div>
        <h1 class="font-sans text-3xl font-extrabold text-slate-900">Quản Lý Đầu Sách</h1>
        <p class="text-sm text-slate-500 font-medium">Thêm, sửa đổi thông tin và ngừng phục vụ các đầu sách</p>
      </div>
      <button 
        @click="openAddModal"
        class="bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 px-6 rounded-xl text-sm transition-all shadow-md flex items-center justify-center space-x-2"
      >
        <Plus class="h-5 w-5" />
        <span>Thêm đầu sách mới</span>
      </button>
    </div>

    <!-- Search / List Table -->
    <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div class="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 w-full md:w-80 shadow-inner relative z-30">
        <Search class="h-4 w-4 text-slate-400 flex-shrink-0" />
        <div class="relative flex-grow">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Tìm tên sách..." 
            class="w-full focus:outline-none text-sm bg-transparent font-medium"
            @input="[fetchBooks(), fetchBookSuggestions()]"
            @focus="showBookSuggestions = true"
            @blur="setTimeout(() => { showBookSuggestions = false; activeSuggestionIndex = -1; }, 200)"
            @keydown.down.prevent="onKeyDown"
            @keydown.up.prevent="onKeyUp"
            @keydown.enter.prevent="onKeyEnter"
            @keydown.esc="showBookSuggestions = false"
          />
          
          <!-- Suggestions Dropdown -->
          <div 
            v-if="showBookSuggestions && bookSuggestions.length > 0" 
            class="absolute left-0 right-0 mt-3 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto w-64 md:w-72"
          >
            <div 
              v-for="(item, idx) in bookSuggestions" 
              :key="item.id"
              class="px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-sm font-bold text-slate-700 flex items-center justify-between border-b border-slate-50 last:border-b-0"
              :class="{ 'bg-slate-100': activeSuggestionIndex === idx }"
              @mousedown="selectBookSuggestion(item)"
            >
              <span class="truncate max-w-[180px] md:max-w-[220px]">{{ item.text }}</span>
              <span class="text-[10px] md:text-xs text-slate-400 font-semibold font-mono">Đầu sách</span>
            </div>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <th class="pb-3">Đầu sách</th>
              <th class="pb-3">Mã đầu sách</th>
              <th class="pb-3">Thể loại</th>
              <th class="pb-3 text-center">Bản khả dụng</th>
              <th class="pb-3">Vị trí</th>
              <th class="pb-3">Trạng thái</th>
              <th class="pb-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50 text-sm font-medium text-slate-700">
            <tr v-for="book in books" :key="book._id" class="hover:bg-slate-50/55 transition-colors">
              <td class="py-4 flex items-center space-x-3">
                <div class="h-12 w-8 bg-slate-100 rounded overflow-hidden flex-shrink-0 border border-slate-200">
                  <img :src="getImageUrl(book.hinhAnh)" class="h-full w-full object-cover" />
                </div>
                <div>
                  <span class="font-bold text-slate-900 block line-clamp-1 max-w-[200px]">{{ book.tenSach }}</span>
                  <span class="text-xs text-slate-400 block">Tác giả: {{ book.tacGia?.map(t => t.tenTacGia).join(', ') }}</span>
                </div>
              </td>
              <td class="py-4 text-xs font-bold text-slate-500">{{ book.maDauSach }}</td>
              <td class="py-4">{{ book.theLoai?.tenTheLoai }}</td>
              <td class="py-4 text-center font-bold">{{ book.soLuongKhaDung }} / {{ book.soLuongDangQuanLy }}</td>
              <td class="py-4 text-xs font-bold text-slate-500">{{ book.viTriKe || 'Kệ trống' }}</td>
              <td class="py-4">
                <span 
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                  :class="book.trangThai === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                >
                  {{ book.trangThai === 'ACTIVE' ? 'Đang phục vụ' : 'Ngừng phục vụ' }}
                </span>
              </td>
              <td class="py-4 text-right space-x-2">
                <router-link 
                  :to="`/admin/copies/${book._id}`"
                  class="text-xs font-bold text-primary hover:underline"
                  title="Quản lý bản sao"
                >
                  Bản sao
                </router-link>
                <button 
                  @click="openEditModal(book)"
                  class="text-xs font-bold text-slate-500 hover:text-primary transition-colors"
                >
                  Sửa
                </button>
                <button 
                  v-if="book.trangThai === 'ACTIVE'"
                  @click="handleDrain(book._id)"
                  class="text-xs font-bold text-red-600 hover:text-red-800 transition-colors"
                  title="Ngừng phục vụ gối đầu (Drain Strategy)"
                >
                  Ngừng phục vụ
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center items-center space-x-2 pt-4">
        <button 
          @click="changePage(currentPage - 1)" 
          :disabled="currentPage === 1"
          class="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-xs font-semibold transition-colors"
        >
          Trước
        </button>
        <span class="text-xs font-bold text-slate-500">Trang {{ currentPage }} / {{ totalPages }}</span>
        <button 
          @click="changePage(currentPage + 1)" 
          :disabled="currentPage === totalPages"
          class="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-xs font-semibold transition-colors"
        >
          Sau
        </button>
      </div>
    </div>

    <!-- Modal Form (Add / Edit) -->
    <Teleport to="body">
      <div 
        v-if="showModal" 
        class="fixed inset-0 bg-slate-900 bg-opacity-65 z-[9999] overflow-y-auto p-4 md:py-8 flex items-start justify-center backdrop-blur-sm"
        @click.self="showModal = false"
      >
      <div class="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative my-auto">
        <button @click="showModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X class="h-6 w-6" />
        </button>

        <h2 class="font-sans text-2xl font-extrabold text-slate-900 border-b pb-2">
          {{ isEdit ? 'CẬP NHẬT ĐẦU SÁCH' : 'TẠO MỚI ĐẦU SÁCH' }}
        </h2>

        <form class="space-y-4 text-sm" @submit.prevent="saveBook">
          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-600 uppercase">Tên sách</label>
            <input v-model="form.tenSach" type="text" required placeholder="Nhập tên sách..." class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1 relative">
              <label class="text-xs font-bold text-slate-600 uppercase">Tác giả</label>
              <input 
                v-model="form.tacGia" 
                type="text" 
                required 
                placeholder="Tên tác giả..." 
                class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" 
                @focus="showAuthorSuggestions = true"
                @blur="setTimeout(() => showAuthorSuggestions = false, 200)"
              />
              <div 
                v-if="showAuthorSuggestions && authorSuggestions.length > 0" 
                class="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-40 overflow-y-auto"
              >
                <div 
                  v-for="item in authorSuggestions" 
                  :key="item._id"
                  class="px-3 py-2 hover:bg-slate-50 cursor-pointer text-xs font-bold text-slate-700"
                  @mousedown="form.tacGia = item.tenTacGia"
                >
                  {{ item.tenTacGia }}
                </div>
              </div>
            </div>
            
            <div class="space-y-1 relative">
              <label class="text-xs font-bold text-slate-600 uppercase">Nhà xuất bản</label>
              <input 
                v-model="form.nhaXuatBan" 
                type="text" 
                required 
                placeholder="Tên nhà xuất bản..." 
                class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" 
                @focus="showPublisherSuggestions = true"
                @blur="setTimeout(() => showPublisherSuggestions = false, 200)"
              />
              <div 
                v-if="showPublisherSuggestions && publisherSuggestions.length > 0" 
                class="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-40 overflow-y-auto"
              >
                <div 
                  v-for="item in publisherSuggestions" 
                  :key="item._id"
                  class="px-3 py-2 hover:bg-slate-50 cursor-pointer text-xs font-bold text-slate-700"
                  @mousedown="form.nhaXuatBan = item.tenNXB"
                >
                  {{ item.tenNXB }}
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1 relative">
              <label class="text-xs font-bold text-slate-600 uppercase">Thể loại sách</label>
              <input 
                v-model="form.theLoai" 
                type="text" 
                required 
                placeholder="Tên thể loại..." 
                class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" 
                @focus="showCategorySuggestions = true"
                @blur="setTimeout(() => showCategorySuggestions = false, 200)"
              />
              <div 
                v-if="showCategorySuggestions && categorySuggestions.length > 0" 
                class="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-40 overflow-y-auto"
              >
                <div 
                  v-for="item in categorySuggestions" 
                  :key="item._id"
                  class="px-3 py-2 hover:bg-slate-50 cursor-pointer text-xs font-bold text-slate-700"
                  @mousedown="form.theLoai = item.tenTheLoai"
                >
                  {{ item.tenTheLoai }}
                </div>
              </div>
            </div>
            
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-600 uppercase">Năm sản xuất</label>
              <input v-model="form.namSanXuat" type="number" required placeholder="Ví dụ: 2026" class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-600 uppercase">Giá bìa sách (VND)</label>
              <input v-model="form.giaBia" type="number" required placeholder="120000" class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" />
            </div>
            <!-- Chỉ cho phép nhập số lượng ban đầu khi tạo mới -->
            <div v-if="!isEdit" class="space-y-1">
              <label class="text-xs font-bold text-slate-600 uppercase">Số lượng bản sao</label>
              <input v-model="form.tongSoLuong" type="number" required placeholder="3" class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" />
            </div>
            <!-- Vị trí kệ chỉ chỉnh khi tạo hoặc chỉnh sửa -->
            <div v-else class="space-y-1">
              <label class="text-xs font-bold text-slate-600 uppercase">Kệ sách</label>
              <input v-model="form.viTriKe" type="text" placeholder="Kệ A1" class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" />
            </div>
          </div>

          <!-- Nếu tạo mới, kệ sách ở dòng riêng -->
          <div v-if="!isEdit" class="space-y-1">
            <label class="text-xs font-bold text-slate-600 uppercase">Kệ sách</label>
            <input v-model="form.viTriKe" type="text" placeholder="Kệ A1" class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" />
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-600 uppercase">Hình ảnh đầu sách</label>
            <div class="flex space-x-2">
              <select v-model="imageSourceType" class="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none">
                <option value="url">Nhập URL</option>
                <option value="upload">Tải file từ máy</option>
              </select>
              
              <!-- Input URL -->
              <input 
                v-if="imageSourceType === 'url'"
                v-model="form.hinhAnh" 
                type="text" 
                placeholder="https://..." 
                class="flex-grow bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none text-sm" 
              />
              
              <!-- Input File Upload -->
              <div v-else class="flex-grow flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <input 
                  type="file" 
                  accept="image/*" 
                  @change="handleImageUpload" 
                  class="flex-grow text-xs text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-light file:text-primary hover:file:bg-opacity-80 cursor-pointer" 
                />
              </div>
            </div>
            
            <!-- Preview image if exists -->
            <div v-if="form.hinhAnh" class="mt-2 flex items-center space-x-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
              <img :src="getImageUrl(form.hinhAnh)" class="h-10 w-10 object-cover rounded-lg border border-slate-300 bg-white" />
              <span class="text-xs text-slate-500 truncate max-w-[200px]">{{ form.hinhAnh.startsWith('data:image') ? 'Đã chọn ảnh tải lên' : form.hinhAnh }}</span>
              <button type="button" @click="form.hinhAnh = ''" class="text-red-500 hover:text-red-700 text-xs font-bold ml-auto">Xoá ảnh</button>
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-600 uppercase">Mô tả sách</label>
            <textarea v-model="form.moTa" rows="3" placeholder="Nhập tóm tắt..." class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"></textarea>
          </div>

          <button 
            type="submit" 
            :disabled="saving"
            class="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2"
          >
            <span>{{ isEdit ? 'Lưu thay đổi' : 'Tạo đầu sách' }}</span>
          </button>
        </form>
      </div>
    </div>
    </Teleport>
    
    <!-- Custom Confirm Dialog -->
    <ConfirmModal ref="confirmModal" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../../services/api';
import { Plus, Search, X } from '@lucide/vue';
import ConfirmModal from '../../components/ConfirmModal.vue';
import { useToastStore } from '../../stores/toast';

const confirmModal = ref(null);
const toast = useToastStore();
const books = ref([]);
const totalCount = ref(0);
const searchQuery = ref('');
const bookSuggestions = ref([]);
const showBookSuggestions = ref(false);
const activeSuggestionIndex = ref(-1);
const currentPage = ref(1);
const totalPages = ref(1);
const limit = 10;

const showModal = ref(false);
const isEdit = ref(false);
const saving = ref(false);
const editId = ref(null);
const imageSourceType = ref('url');

const allAuthors = ref([]);
const allPublishers = ref([]);
const allCategories = ref([]);

const showAuthorSuggestions = ref(false);
const showPublisherSuggestions = ref(false);
const showCategorySuggestions = ref(false);

const authorSuggestions = computed(() => {
  const q = form.value.tacGia?.trim().toLowerCase();
  if (!q) return [];
  return allAuthors.value.filter(a => a.tenTacGia.toLowerCase().includes(q) && a.tenTacGia.toLowerCase() !== q);
});

const publisherSuggestions = computed(() => {
  const q = form.value.nhaXuatBan?.trim().toLowerCase();
  if (!q) return [];
  return allPublishers.value.filter(p => p.tenNXB.toLowerCase().includes(q) && p.tenNXB.toLowerCase() !== q);
});

const categorySuggestions = computed(() => {
  const q = form.value.theLoai?.trim().toLowerCase();
  if (!q) return [];
  return allCategories.value.filter(c => c.tenTheLoai.toLowerCase().includes(q) && c.tenTheLoai.toLowerCase() !== q);
});

const loadSuggestions = async () => {
  try {
    const [authorRes, publisherRes, catRes] = await Promise.all([
      api.get('/authors'),
      api.get('/publishers'),
      api.get('/categories')
    ]);
    if (authorRes.success) allAuthors.value = authorRes.data;
    if (publisherRes.success) allPublishers.value = publisherRes.data;
    if (catRes.success) allCategories.value = catRes.data;
  } catch (error) {
    console.error('Load suggestions error:', error);
  }
};

const form = ref({
  tenSach: '',
  tacGia: '',
  nhaXuatBan: '',
  theLoai: '',
  namSanXuat: 2026,
  giaBia: 0,
  tongSoLuong: 3,
  viTriKe: 'Kệ A1',
  hinhAnh: '',
  moTa: ''
});

const getImageUrl = (path) => {
  if (!path) return '/placeholder_book.png';
  if (path.startsWith('http') || path.startsWith('data:image')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `http://localhost:3000${cleanPath}`;
};

const handleImageUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    form.value.hinhAnh = event.target.result;
  };
  reader.readAsDataURL(file);
};

const formatPrice = (val) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
};

let searchTimeout = null;
const fetchBookSuggestions = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  
  const query = searchQuery.value?.trim();
  if (!query) {
    bookSuggestions.value = [];
    activeSuggestionIndex.value = -1;
    return;
  }
  
  searchTimeout = setTimeout(async () => {
    try {
      const res = await api.get(`/books/search-suggestions?q=${encodeURIComponent(query)}`);
      if (res.success) {
        // Chỉ gợi ý sách trong mục quản lý sách
        bookSuggestions.value = res.data.filter(item => item.type === 'book');
        activeSuggestionIndex.value = -1;
      }
    } catch (error) {
      console.error('Fetch book suggestions error:', error);
    }
  }, 200);
};

const selectBookSuggestion = (item) => {
  searchQuery.value = item.code || item.text;
  showBookSuggestions.value = false;
  activeSuggestionIndex.value = -1;
  fetchBooks();
};

const onKeyDown = () => {
  if (bookSuggestions.value.length === 0) return;
  activeSuggestionIndex.value = (activeSuggestionIndex.value + 1) % bookSuggestions.value.length;
};

const onKeyUp = () => {
  if (bookSuggestions.value.length === 0) return;
  activeSuggestionIndex.value = (activeSuggestionIndex.value - 1 + bookSuggestions.value.length) % bookSuggestions.value.length;
};

const onKeyEnter = () => {
  if (showBookSuggestions.value && activeSuggestionIndex.value !== -1 && activeSuggestionIndex.value < bookSuggestions.value.length) {
    selectBookSuggestion(bookSuggestions.value[activeSuggestionIndex.value]);
  } else {
    showBookSuggestions.value = false;
    activeSuggestionIndex.value = -1;
    fetchBooks();
  }
};

const fetchBooks = async () => {
  try {
    let url = `/books?page=${currentPage.value}&limit=${limit}`;
    if (searchQuery.value.trim()) url += `&q=${encodeURIComponent(searchQuery.value.trim())}`;
    
    const res = await api.get(url);
    if (res.success) {
      books.value = res.data.books;
      totalCount.value = res.data.totalCount;
      totalPages.value = Math.ceil(totalCount.value / limit);
    }
  } catch (error) {
    console.error('Fetch admin books error:', error);
  }
};

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  fetchBooks();
};

const openAddModal = () => {
  isEdit.value = false;
  editId.value = null;
  imageSourceType.value = 'url';
  form.value = {
    tenSach: '',
    tacGia: '',
    nhaXuatBan: '',
    theLoai: '',
    namSanXuat: 2026,
    giaBia: 0,
    tongSoLuong: 3,
    viTriKe: 'Kệ A1',
    hinhAnh: '',
    moTa: ''
  };
  showModal.value = true;
};

const openEditModal = (book) => {
  isEdit.value = true;
  editId.value = book._id;
  imageSourceType.value = book.hinhAnh?.startsWith('data:image') ? 'upload' : 'url';
  form.value = {
    tenSach: book.tenSach,
    tacGia: book.tacGia?.map(t => t.tenTacGia).join(', ') || '',
    nhaXuatBan: book.nhaXuatBan?.tenNXB || '',
    theLoai: book.theLoai?.tenTheLoai || '',
    namSanXuat: book.namSanXuat,
    giaBia: book.giaBia,
    viTriKe: book.viTriKe,
    hinhAnh: book.hinhAnh,
    moTa: book.moTa
  };
  showModal.value = true;
};

const saveBook = async () => {
  const ok = await confirmModal.value.ask({ message: 'Bạn có chắc chắn muốn lưu (thêm/sửa) thông tin đầu sách này không?' });
  if (!ok) return;
  saving.value = true;
  try {
    if (isEdit.value) {
      // Gọi PUT sửa thông tin
      const res = await api.put(`/books/${editId.value}`, form.value);
      if (res.success) {
        toast.show('Cập nhật đầu sách thành công!');
      }
    } else {
      // Gọi POST tạo mới
      const res = await api.post('/books', form.value);
      if (res.success) {
        toast.show('Tạo đầu sách mới thành công!');
      }
    }
    showModal.value = false;
    fetchBooks();
    loadSuggestions(); // Tải lại danh sách gợi ý mới
  } catch (error) {
    toast.show(error.message || 'Lỗi khi lưu đầu sách', 'error');
  } finally {
    saving.value = false;
  }
};

const handleDrain = async (bookId) => {
  const ok = await confirmModal.value.ask({ message: 'Bạn có chắc chắn muốn ngừng phục vụ đầu sách này? Hệ thống sẽ thu hồi các bản sao rảnh ngay lập tức (Drain Strategy).' });
  if (!ok) return;
  try {
    const res = await api.delete(`/books/${bookId}`);
    if (res.success) {
      toast.show(res.data.message);
      fetchBooks();
      loadSuggestions(); // Tải lại gợi ý sau khi ngừng phục vụ
    }
  } catch (error) {
    toast.show(error.message || 'Lỗi khi thực hiện ngừng phục vụ', 'error');
  }
};

onMounted(() => {
  fetchBooks();
  loadSuggestions();
});
</script>
