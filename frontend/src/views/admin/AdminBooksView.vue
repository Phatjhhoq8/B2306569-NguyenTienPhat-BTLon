<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-3">
      <div>
        <h1 class="font-serif text-3xl font-bold text-slate-900">Quản Lý Đầu Sách</h1>
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
      <div class="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 w-full md:w-80 shadow-inner">
        <Search class="h-4 w-4 text-slate-400" />
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Tìm tên sách..." 
          class="w-full focus:outline-none text-sm bg-transparent"
          @input="fetchBooks"
        />
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
    <div v-if="showModal" class="fixed inset-0 bg-slate-900 bg-opacity-65 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div class="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button @click="showModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X class="h-6 w-6" />
        </button>

        <h2 class="font-serif text-2xl font-bold text-slate-900 border-b pb-2">
          {{ isEdit ? 'CẬP NHẬT ĐẦU SÁCH' : 'TẠO MỚI ĐẦU SÁCH' }}
        </h2>

        <form class="space-y-4 text-sm" @submit.prevent="saveBook">
          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-600 uppercase">Tên sách</label>
            <input v-model="form.tenSach" type="text" required placeholder="Nhập tên sách..." class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-600 uppercase">Tác giả</label>
              <input v-model="form.tacGia" type="text" required placeholder="Tên tác giả..." class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" />
            </div>
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-600 uppercase">Nhà xuất bản</label>
              <input v-model="form.nhaXuatBan" type="text" required placeholder="Tên nhà xuất bản..." class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-600 uppercase">Thể loại sách</label>
              <input v-model="form.theLoai" type="text" required placeholder="Tên thể loại..." class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" />
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../services/api';
import { Plus, Search, X } from '@lucide/vue';

const books = ref([]);
const totalCount = ref(0);
const searchQuery = ref('');
const currentPage = ref(1);
const totalPages = ref(1);
const limit = 10;

const showModal = ref(false);
const isEdit = ref(false);
const saving = ref(false);
const editId = ref(null);
const imageSourceType = ref('url');

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
  saving.value = true;
  try {
    if (isEdit.value) {
      // Gọi PUT sửa thông tin
      const res = await api.put(`/books/${editId.value}`, form.value);
      if (res.success) {
        alert('Cập nhật đầu sách thành công!');
      }
    } else {
      // Gọi POST tạo mới
      const res = await api.post('/books', form.value);
      if (res.success) {
        alert('Tạo đầu sách mới thành công!');
      }
    }
    showModal.value = false;
    fetchBooks();
  } catch (error) {
    alert(error.message || 'Lỗi khi lưu đầu sách');
  } finally {
    saving.value = false;
  }
};

const handleDrain = async (bookId) => {
  if (!confirm('Bạn có chắc chắn muốn ngừng phục vụ đầu sách này? Hệ thống sẽ thu hồi các bản sao rảnh ngay lập tức (Drain Strategy).')) return;
  try {
    const res = await api.delete(`/books/${bookId}`);
    if (res.success) {
      alert(res.data.message);
      fetchBooks();
    }
  } catch (error) {
    alert(error.message || 'Lỗi khi thực hiện ngừng phục vụ');
  }
};

onMounted(() => {
  fetchBooks();
});
</script>
