<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex justify-between items-center border-b pb-3">
      <div class="space-y-1.5">
        <h1 class="font-sans text-3xl font-extrabold text-slate-900">Quản Lý Bản Sao Vật Lý</h1>
        <p class="text-sm text-slate-500 font-medium">Đầu sách: <span class="text-primary font-bold">{{ bookTitle?.tenSach }}</span></p>
      </div>
      <router-link to="/admin/books" class="text-xs font-semibold text-primary hover:underline flex items-center">
        <ArrowLeft class="h-4 w-4 mr-1" /> Về Quản lý đầu sách
      </router-link>
    </div>

    <!-- Copies Table -->
    <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div v-if="copies.length > 0" class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <th class="pb-3">Mã bản sao (barcode)</th>
              <th class="pb-3">Kệ sách</th>
              <th class="pb-3">Tình trạng vật lý</th>
              <th class="pb-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50 text-sm font-medium text-slate-700">
            <tr v-for="copy in copies" :key="copy._id" class="hover:bg-slate-50/55 transition-colors">
              <td class="py-4 font-mono font-bold text-slate-800">{{ copy.maSach }}</td>
              <td class="py-4">
                <input 
                  v-model="copy.viTriKe" 
                  type="text" 
                  class="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none w-32"
                  @change="updateCopy(copy)"
                />
              </td>
              <td class="py-4">
                <select 
                  v-model="copy.tinhTrang"
                  :disabled="copy.tinhTrang === 'DA_MUON'"
                  class="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none"
                  @change="updateCopy(copy)"
                >
                  <option value="CHO_MUON">Khả dụng (Cho mượn)</option>
                  <option value="DA_MUON" disabled>Đang cho mượn</option>
                  <option value="BAO_TRI">Bảo trì / Sửa chữa</option>
                  <option value="MAT">Đã mất</option>
                </select>
              </td>
              <td class="py-4 text-right">
                <button 
                  @click="deleteCopy(copy)"
                  :disabled="copy.tinhTrang === 'DA_MUON'"
                  class="text-xs font-bold text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                  title="Xóa bản sao khỏi hệ thống"
                >
                  Xóa bản sao
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center py-12 text-sm text-slate-400 font-medium">Chưa có bản sao vật lý nào cho đầu sách này.</div>
    </div>
    
    <!-- Custom Confirm Dialog -->
    <ConfirmModal ref="confirmModal" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../../services/api';
import { ArrowLeft } from '@lucide/vue';
import ConfirmModal from '../../components/ConfirmModal.vue';
import { useToastStore } from '../../stores/toast';

const confirmModal = ref(null);
const toast = useToastStore();
const route = useRoute();
const bookTitle = ref(null);
const copies = ref([]);

const loadData = async () => {
  try {
    const res = await api.get(`/books/${route.params.bookId}`);
    if (res.success) {
      bookTitle.value = res.data.book;
      copies.value = res.data.copies || [];
    }
  } catch (error) {
    console.error('Load copies error:', error);
  }
};

const updateCopy = async (copy) => {
  const ok = await confirmModal.value.ask({ message: 'Bạn có chắc chắn muốn cập nhật thông tin bản sao sách này không?' });
  if (!ok) {
    loadData(); // Revert
    return;
  }
  try {
    const res = await api.put(`/book-copies/${copy._id}`, {
      viTriKe: copy.viTriKe,
      tinhTrang: copy.tinhTrang
    });
    if (res.success) {
      toast.show('Cập nhật bản sao thành công!');
      loadData();
    }
  } catch (error) {
    toast.show(error.message || 'Lỗi khi cập nhật bản sao', 'error');
    loadData(); // Revert
  }
};

const deleteCopy = async (copy) => {
  const ok = await confirmModal.value.ask({ 
    message: `Bạn có chắc chắn muốn xóa bản sao ${copy.maSach} ra khỏi hệ thống không?`,
    isDestructive: true 
  });
  if (!ok) return;
  try {
    const res = await api.delete(`/book-copies/${copy._id}`);
    if (res.success) {
      toast.show('Đã xóa bản sao thành công.');
      loadData();
    }
  } catch (error) {
    toast.show(error.message || 'Lỗi khi xóa bản sao', 'error');
  }
};

onMounted(() => {
  loadData();
});
</script>
