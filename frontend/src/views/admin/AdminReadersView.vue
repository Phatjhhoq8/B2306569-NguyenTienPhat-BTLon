<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex justify-between items-center border-b pb-3">
      <div>
        <h1 class="font-serif text-3xl font-bold text-slate-900">Quản Lý Độc Giả</h1>
        <p class="text-sm text-slate-500 font-medium">Xem danh sách độc giả, đổi trạng thái hoạt động hoặc xóa tài khoản độc giả</p>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <!-- Search -->
        <div class="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 w-full sm:w-80 shadow-inner">
          <Search class="h-4 w-4 text-slate-400" />
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Tìm theo tên hoặc email..." 
            class="w-full focus:outline-none text-sm bg-transparent"
            @input="fetchReaders"
          />
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../services/api';
import { Search } from '@lucide/vue';

const readers = ref([]);
const totalCount = ref(0);
const searchQuery = ref('');
const selectedStatus = ref('');
const currentPage = ref(1);
const totalPages = ref(1);
const limit = 10;

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN');
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
  try {
    const res = await api.post(`/admin/readers/${id}/toggle-status`);
    if (res.success) {
      fetchReaders();
    }
  } catch (error) {
    alert(error.message || 'Lỗi khi chuyển đổi trạng thái');
  }
};

const deleteReader = async (id) => {
  if (!confirm('Bạn có chắc muốn xóa độc giả này khỏi hệ thống? (Xóa mềm)')) return;
  try {
    const res = await api.delete(`/admin/readers/${id}`);
    if (res.success) {
      alert('Đã xóa độc giả thành công.');
      fetchReaders();
    }
  } catch (error) {
    alert(error.message || 'Lỗi khi xóa độc giả');
  }
};

onMounted(() => {
  fetchReaders();
});
</script>
