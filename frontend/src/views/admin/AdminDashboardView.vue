<template>
  <div class="space-y-8">
    <div class="flex justify-between items-center border-b pb-3">
      <div class="space-y-1.5">
        <h1 class="font-sans text-3xl font-extrabold text-slate-900">Dashboard</h1>
        <p class="text-sm text-slate-500 font-medium">Chào mừng, {{ authStore.user?.hoTenNV }}</p>
      </div>
    </div>

    <!-- Stats Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div 
        v-for="stat in stats" 
        :key="stat.title"
        class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between"
      >
        <div class="space-y-1">
          <span class="text-xs text-slate-400 uppercase font-bold tracking-wider">{{ stat.title }}</span>
          <p class="text-3xl font-black text-slate-900">{{ stat.value }}</p>
        </div>
        <div :class="stat.iconBg" class="h-12 w-12 rounded-2xl flex items-center justify-center text-white">
          <component :is="stat.icon" class="h-6 w-6" />
        </div>
      </div>
    </div>

    <!-- Main Grid: Recent Activities -->
    <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-3">
        <h2 class="font-sans text-xl font-extrabold text-slate-800 flex items-center">
          <Sparkles class="h-5 w-5 mr-2 text-yellow-500" /> Hoạt Động Mượn Sách Mới Nhất
        </h2>
        
        <!-- Filters -->
        <div class="flex flex-wrap items-center gap-3">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Tìm mã phiếu, độc giả, email..." 
            class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none w-52"
          />
          
          <select v-model="filterStatus" class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none">
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="DANG_MUON">Đang mượn</option>
            <option value="DA_TRA">Đã trả</option>
            <option value="QUA_HAN">Quá hạn</option>
            <option value="HUY">Đã hủy</option>
          </select>
        </div>
      </div>

      <div v-if="filteredReceipts.length > 0" class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <th class="pb-3">Mã phiếu</th>
              <th class="pb-3">Độc giả</th>
              <th class="pb-3">Ngày mượn</th>
              <th class="pb-3">Hạn trả</th>
              <th class="pb-3">Trạng thái</th>
              <th class="pb-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50 text-sm font-medium text-slate-700">
            <tr v-for="receipt in filteredReceipts" :key="receipt._id" class="hover:bg-slate-50/55 transition-colors">
              <td class="py-4 font-bold text-slate-950">{{ receipt.maPhieu }}</td>
              <td class="py-4">
                {{ receipt.docGia?.hoLot }} {{ receipt.docGia?.ten }}
                <span class="text-[10px] text-slate-400 block">{{ receipt.docGia?.email }}</span>
              </td>
              <td class="py-4 text-xs">{{ formatDate(receipt.ngayMuon) }}</td>
              <td class="py-4 text-xs">{{ formatDate(receipt.ngayHenTra) }}</td>
              <td class="py-4">
                <span 
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                  :class="getReceiptStatusClass(receipt.trangThai)"
                >
                  {{ getReceiptStatusText(receipt.trangThai) }}
                </span>
              </td>
              <td class="py-4 text-right">
                <router-link 
                  to="/admin/borrowing"
                  class="text-xs text-primary hover:underline"
                >
                  Xem chi tiết
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center py-8 text-sm text-slate-400 font-medium">Chưa có hoạt động mượn sách nào.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import api from '../../services/api';
import { 
  BookMarked, 
  Users, 
  GitCompare, 
  AlertTriangle, 
  Sparkles 
} from '@lucide/vue';

const authStore = useAuthStore();
const currentTime = ref(new Date().toLocaleString('vi-VN'));

const stats = ref([
  { title: 'Tổng đầu sách', value: 0, icon: BookMarked, iconBg: 'bg-primary' },
  { title: 'Tổng Độc giả', value: 0, icon: Users, iconBg: 'bg-green-600' },
  { title: 'Phiếu đang mượn', value: 0, icon: GitCompare, iconBg: 'bg-amber-600' },
  { title: 'Phiếu quá hạn', value: 0, icon: AlertTriangle, iconBg: 'bg-red-600' }
]);

const allReceipts = ref([]);
const searchQuery = ref('');
const filterStatus = ref('');

const filteredReceipts = computed(() => {
  return allReceipts.value.filter(receipt => {
    const matchStatus = !filterStatus.value || receipt.trangThai === filterStatus.value;
    
    let matchQuery = true;
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase();
      const maPhieu = (receipt.maPhieu || '').toLowerCase();
      const hoTen = `${receipt.docGia?.hoLot || ''} ${receipt.docGia?.ten || ''}`.toLowerCase();
      const email = (receipt.docGia?.email || '').toLowerCase();
      const dienThoai = (receipt.docGia?.dienThoai || '').toLowerCase();
      matchQuery = maPhieu.includes(q) || hoTen.includes(q) || email.includes(q) || dienThoai.includes(q);
    }
    
    return matchStatus && matchQuery;
  }).slice(0, 5);
});

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

const getReceiptStatusText = (status) => {
  const map = {
    'PENDING': 'Chờ duyệt',
    'DANG_MUON': 'Đang mượn',
    'DA_TRA': 'Đã trả',
    'QUA_HAN': 'Quá hạn',
    'HUY': 'Đã hủy'
  };
  return map[status] || status;
};

const getReceiptStatusClass = (status) => {
  const map = {
    'PENDING': 'bg-slate-100 text-slate-700',
    'DANG_MUON': 'bg-primary-light text-primary-dark',
    'DA_TRA': 'bg-green-100 text-green-700',
    'QUA_HAN': 'bg-red-100 text-red-700',
    'HUY': 'bg-red-50 text-red-400'
  };
  return map[status] || 'bg-slate-100';
};

const loadDashboardData = async () => {
  try {
    const [booksRes, readersRes, receiptsRes] = await Promise.all([
      api.get('/books?limit=1'),
      api.get('/admin/readers?limit=1'),
      api.get('/borrowing/receipts')
    ]);

    if (booksRes.success) {
      stats.value[0].value = booksRes.data.totalCount || 0;
    }
    if (readersRes.success) {
      stats.value[1].value = readersRes.data.totalCount || 0;
    }
    if (receiptsRes.success) {
      allReceipts.value = receiptsRes.data;
      
      const activeLoans = allReceipts.value.filter(r => r.trangThai === 'DANG_MUON').length;
      const overdueLoans = allReceipts.value.filter(r => r.trangThai === 'QUA_HAN').length;
      
      stats.value[2].value = activeLoans;
      stats.value[3].value = overdueLoans;
    }
  } catch (error) {
    console.error('Dashboard load error:', error);
  }
};

onMounted(() => {
  loadDashboardData();
  // Update time
  setInterval(() => {
    currentTime.value = new Date().toLocaleString('vi-VN');
  }, 1000);
});
</script>
