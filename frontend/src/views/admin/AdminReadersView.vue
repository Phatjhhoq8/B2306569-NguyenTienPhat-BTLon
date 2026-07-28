<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex justify-between items-center border-b pb-3">
      <div class="space-y-1.5">
        <h1 class="font-sans text-3xl font-extrabold text-slate-900">Quản Lý Độc Giả</h1>
        <p class="text-sm text-slate-500 font-medium">Xem danh sách độc giả, đổi trạng thái hoạt động hoặc xóa tài khoản độc giả</p>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <!-- Search -->
        <div class="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 w-full sm:w-80 shadow-inner relative z-30">
          <Search class="h-4 w-4 text-slate-400 flex-shrink-0" />
          <div class="relative flex-grow">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Tìm theo tên, email, sđt..." 
              class="w-full focus:outline-none text-sm bg-transparent font-medium"
              @input="[fetchReaders(), fetchReaderSuggestions()]"
              @focus="showReaderSuggestions = true"
              @blur="setTimeout(() => { showReaderSuggestions = false; activeSuggestionIndex = -1; }, 200)"
              @keydown.down.prevent="onKeyDown"
              @keydown.up.prevent="onKeyUp"
              @keydown.enter.prevent="onKeyEnter"
              @keydown.esc="showReaderSuggestions = false"
            />
            
            <!-- Suggestions Dropdown -->
            <div 
              v-if="showReaderSuggestions && readerSuggestions.length > 0" 
              class="absolute left-0 right-0 mt-3 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto w-64 sm:w-72"
            >
              <div 
                v-for="(item, idx) in readerSuggestions" 
                :key="item.id"
                class="px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-sm font-bold text-slate-700 flex items-center justify-between border-b border-slate-50 last:border-b-0"
                :class="{ 'bg-slate-100': activeSuggestionIndex === idx }"
                @mousedown="selectReaderSuggestion(item)"
              >
                <span class="truncate max-w-[180px] sm:max-w-[200px]">{{ item.text }}</span>
                <span class="text-[10px] md:text-xs text-slate-400 font-semibold font-mono">Độc giả</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Filter status -->
        <select 
          v-model="selectedStatus"
          class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none w-full sm:w-40"
          @change="fetchReaders"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">Hoạt động (Active)</option>
          <option value="SUSPENDED">Đang khóa (Suspended)</option>
        </select>
      </div>

      <div v-if="readers.length > 0" class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <th class="pb-3">Độc giả</th>
              <th class="pb-3">Mã độc giả</th>
              <th class="pb-3">Liên hệ</th>
              <th class="pb-3">Địa chỉ / Ngày sinh</th>
              <th class="pb-3">Trạng thái</th>
              <th class="pb-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50 text-sm font-medium text-slate-700">
            <tr v-for="reader in readers" :key="reader._id" class="hover:bg-slate-50/55 transition-colors">
              <td class="py-4 font-bold text-slate-950">{{ reader.hoLot }} {{ reader.ten }}</td>
              <td class="py-4 text-xs font-bold text-slate-500 font-mono">{{ reader.maDocGia }}</td>
              <td class="py-4 text-xs">
                <p>Email: {{ reader.email }}</p>
                <p class="text-slate-400">SĐT: {{ reader.dienThoai }}</p>
              </td>
              <td class="py-4 text-xs">
                <p>{{ reader.diachi }}</p>
                <p class="text-slate-400">NS: {{ formatDate(reader.ngaySinh) }}</p>
              </td>
              <td class="py-4">
                <span 
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                  :class="reader.trangThai === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                >
                  {{ reader.trangThai === 'ACTIVE' ? 'Hoạt động' : 'Bị khóa' }}
                </span>
              </td>
              <td class="py-4 text-right space-x-2">
                <button 
                  @click="toggleStatus(reader._id)"
                  class="text-xs font-bold text-primary hover:underline"
                >
                  {{ reader.trangThai === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa' }}
                </button>
                <button 
                  @click="deleteReader(reader._id)"
                  class="text-xs font-bold text-red-600 hover:text-red-800 transition-colors"
                >
                  Xóa
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center py-12 text-sm text-slate-400 font-medium">Không tìm thấy độc giả nào phù hợp.</div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center items-center space-x-1.5 pt-4">
        <button 
          @click="changePage(1)" 
          :disabled="currentPage === 1"
          class="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-xs font-semibold transition-colors"
        >
          Đầu
        </button>
        <button 
          @click="changePage(currentPage - 1)" 
          :disabled="currentPage === 1"
          class="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-xs font-semibold transition-colors"
        >
          Trước
        </button>

        <template v-for="(page, idx) in visiblePages" :key="idx">
          <span v-if="page === '...'" class="px-1 text-xs font-bold text-slate-400">...</span>
          <button 
            v-else
            @click="changePage(page)"
            class="w-7 h-7 rounded-lg border text-xs font-bold transition-all"
            :class="page === currentPage 
              ? 'bg-primary text-white border-primary shadow-sm' 
              : 'border-slate-200 hover:bg-slate-50 text-slate-600'"
          >
            {{ page }}
          </button>
        </template>

        <button 
          @click="changePage(currentPage + 1)" 
          :disabled="currentPage === totalPages"
          class="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-xs font-semibold transition-colors"
        >
          Sau
        </button>
        <button 
          @click="changePage(totalPages)" 
          :disabled="currentPage === totalPages"
          class="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-xs font-semibold transition-colors"
        >
          Cuối
        </button>
      </div>
    </div>
    
    <!-- Custom Confirm Dialog -->
    <ConfirmModal ref="confirmModal" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../../services/api';
import { Search } from '@lucide/vue';
import ConfirmModal from '../../components/ConfirmModal.vue';
import { useToastStore } from '../../stores/toast';

const confirmModal = ref(null);
const toast = useToastStore();
const readers = ref([]);
const totalCount = ref(0);
const searchQuery = ref('');
const readerSuggestions = ref([]);
const showReaderSuggestions = ref(false);
const activeSuggestionIndex = ref(-1);
const selectedStatus = ref('');
const currentPage = ref(1);
const totalPages = ref(1);
const limit = 10;

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

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

let searchTimeout = null;
const fetchReaderSuggestions = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  
  const query = searchQuery.value?.trim();
  if (!query) {
    readerSuggestions.value = [];
    activeSuggestionIndex.value = -1;
    return;
  }
  
  searchTimeout = setTimeout(async () => {
    try {
      const res = await api.get(`/admin/readers/search-suggestions?q=${encodeURIComponent(query)}`);
      if (res.success) {
        readerSuggestions.value = res.data;
        activeSuggestionIndex.value = -1;
      }
    } catch (error) {
      console.error('Fetch reader suggestions error:', error);
    }
  }, 200);
};

const selectReaderSuggestion = (item) => {
  searchQuery.value = item.code || item.name;
  showReaderSuggestions.value = false;
  activeSuggestionIndex.value = -1;
  fetchReaders();
};

const onKeyDown = () => {
  if (readerSuggestions.value.length === 0) return;
  activeSuggestionIndex.value = (activeSuggestionIndex.value + 1) % readerSuggestions.value.length;
};

const onKeyUp = () => {
  if (readerSuggestions.value.length === 0) return;
  activeSuggestionIndex.value = (activeSuggestionIndex.value - 1 + readerSuggestions.value.length) % readerSuggestions.value.length;
};

const onKeyEnter = () => {
  if (showReaderSuggestions.value && activeSuggestionIndex.value !== -1 && activeSuggestionIndex.value < readerSuggestions.value.length) {
    selectReaderSuggestion(readerSuggestions.value[activeSuggestionIndex.value]);
  } else {
    showReaderSuggestions.value = false;
    activeSuggestionIndex.value = -1;
    fetchReaders();
  }
};

const fetchReaders = async () => {
  try {
    let url = `/admin/readers?page=${currentPage.value}&limit=${limit}`;
    if (searchQuery.value.trim()) url += `&q=${encodeURIComponent(searchQuery.value.trim())}`;
    if (selectedStatus.value) url += `&status=${selectedStatus.value}`;
    
    const res = await api.get(url);
    if (res.success) {
      readers.value = res.data.readers;
      totalCount.value = res.data.totalCount;
      totalPages.value = Math.ceil(totalCount.value / limit);
    }
  } catch (error) {
    console.error('Fetch readers error:', error);
  }
};

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  fetchReaders();
};

const toggleStatus = async (id) => {
  const ok = await confirmModal.value.ask({ message: 'Bạn có chắc chắn muốn thay đổi trạng thái (khóa/mở khóa) tài khoản độc giả này không?' });
  if (!ok) return;
  try {
    const res = await api.post(`/admin/readers/${id}/toggle-status`);
    if (res.success) {
      toast.show('Chuyển đổi trạng thái tài khoản thành công!');
      fetchReaders();
    }
  } catch (error) {
    toast.show(error.message || 'Lỗi khi chuyển đổi trạng thái', 'error');
  }
};

const deleteReader = async (id) => {
  const ok = await confirmModal.value.ask({ 
    message: 'Bạn có chắc chắn muốn xóa độc giả này khỏi hệ thống không?',
    isDestructive: true 
  });
  if (!ok) return;
  try {
    const res = await api.delete(`/admin/readers/${id}`);
    if (res.success) {
      toast.show('Đã xóa độc giả thành công.');
      fetchReaders();
    }
  } catch (error) {
    toast.show(error.message || 'Lỗi khi xóa độc giả', 'error');
  }
};

onMounted(() => {
  fetchReaders();
});
</script>
