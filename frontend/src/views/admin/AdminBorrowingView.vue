<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-3">
      <div class="space-y-1.5">
        <h1 class="font-sans text-3xl font-extrabold text-slate-900">Quản Lý Mượn Trả Sách</h1>
        <p class="text-sm text-slate-500 font-medium">Phê duyệt phiếu mượn, xác nhận trả sách và theo dõi quá hạn</p>
      </div>
    </div>

    <!-- Filters & List -->
    <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
      <!-- Search & Filters Container -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <!-- State Filters -->
        <div class="flex flex-wrap gap-2">
          <button 
            v-for="status in statuses" 
            :key="status.value"
            @click="filterStatus(status.value)"
            class="px-4 py-2 rounded-xl text-xs font-bold transition-all border"
            :class="selectedStatus === status.value ? 'bg-primary text-white border-primary shadow-sm' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'"
          >
            {{ status.label }}
          </button>
        </div>

        <!-- Search Input -->
        <div class="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 w-full md:w-80 shadow-inner relative z-30">
          <Search class="h-4 w-4 text-slate-400 flex-shrink-0" />
          <div class="relative flex-grow">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Tìm mã phiếu, độc giả..." 
              class="w-full focus:outline-none text-sm bg-transparent font-medium"
              @input="fetchReceipts"
            />
          </div>
          <button 
            v-if="searchQuery"
            @click="[searchQuery = '', fetchReceipts()]"
            class="text-xs font-bold text-primary hover:underline flex items-center space-x-1"
          >
            <XIcon class="h-4.5 w-4.5 text-slate-400" />
          </button>
        </div>
      </div>

      <!-- Receipts Table -->
      <div v-if="receipts.length > 0" class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <th class="pb-3">Mã phiếu</th>
              <th class="pb-3">Độc giả</th>
              <th class="pb-3">Sách mượn</th>
              <th class="pb-3">Ngày mượn / Hạn trả</th>
              <th class="pb-3 text-center">Trạng thái</th>
              <th class="pb-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50 text-sm font-medium text-slate-700">
            <tr v-for="receipt in receipts" :key="receipt._id" class="hover:bg-slate-50/55 transition-colors">
              <td class="py-4 font-bold text-slate-950">{{ receipt.maPhieu }}</td>
              <td class="py-4">
                {{ receipt.docGia?.hoLot }} {{ receipt.docGia?.ten }}
                <span class="text-xs text-slate-400 block font-mono">Mã: {{ receipt.docGia?.maDocGia }}</span>
              </td>
              <td class="py-4 text-xs font-semibold max-w-[200px] truncate">
                <span v-for="(item, idx) in receipt.chiTietMuon" :key="item._id" class="block truncate">
                  {{ idx + 1 }}. {{ item.sach?.dauSach?.tenSach }} ({{ item.sach?.maSach }})
                  <span :class="receipt.trangThai === 'HUY' ? 'text-slate-400' : 
                                (item.daTraChua ? 
                                  (item.ngayTraThucTe && new Date(item.ngayTraThucTe) > new Date(receipt.ngayHenTra) ? 'text-orange-600' : 'text-green-600') 
                                  : 'text-amber-600')">
                    [{{ receipt.trangThai === 'HUY' ? 'Đã hủy' : 
                       (item.daTraChua ? 
                         (item.ngayTraThucTe && new Date(item.ngayTraThucTe) > new Date(receipt.ngayHenTra) ? 'Trả trễ' : 'Đã trả') 
                         : 'Chưa trả') }}]
                  </span>
                </span>
              </td>
              <td class="py-4 text-xs">
                <p>Mượn: {{ formatDate(receipt.ngayMuon) }}</p>
                <p class="text-slate-400">Hạn: {{ formatDate(receipt.ngayHenTra) }}</p>
              </td>
              <td class="py-4 text-center">
                <span 
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                  :class="getReceiptStatusClass(receipt.trangThai)"
                >
                  {{ getReceiptStatusText(receipt.trangThai) }}
                </span>
              </td>
              <td class="py-4 text-right space-x-2">
                <button 
                  v-if="receipt.trangThai === 'DANG_MUON' || receipt.trangThai === 'QUA_HAN'"
                  @click="openReturnModal(receipt)"
                  class="bg-primary hover:bg-primary-dark text-white font-bold text-xs py-1.5 px-3 rounded-xl transition-all shadow"
                >
                  Ghi nhận trả
                </button>
                <button 
                  v-if="receipt.trangThai === 'CHO_DUYET'"
                  @click="approveReceipt(receipt._id)"
                  class="bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-1.5 px-3 rounded-xl transition-all shadow"
                >
                  Duyệt phiếu
                </button>
                <button 
                  v-if="receipt.trangThai === 'SAN_SANG'"
                  @click="pickupReceipt(receipt._id)"
                  class="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-1.5 px-3 rounded-xl transition-all shadow"
                >
                  Giao sách
                </button>
                <button 
                  v-if="['CHO_DUYET', 'SAN_SANG'].includes(receipt.trangThai)"
                  @click="cancelReceipt(receipt._id)"
                  class="text-xs font-bold text-red-600 hover:text-red-800 transition-colors"
                >
                  Hủy phiếu
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center py-12 text-sm text-slate-400 font-medium">Không tìm thấy phiếu mượn nào phù hợp.</div>
    </div>

    <!-- Return Details Modal (Partial Return handling) -->
    <Teleport to="body">
      <div 
        v-if="activeReceipt" 
        class="fixed inset-0 bg-slate-900 bg-opacity-65 z-[9999] overflow-y-auto p-4 md:py-8 flex items-start justify-center backdrop-blur-sm"
        @click.self="activeReceipt = null"
      >
      <div class="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative my-auto">
        <button @click="activeReceipt = null" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X class="h-6 w-6" />
        </button>

        <h2 class="font-sans text-2xl font-extrabold text-slate-900 border-b pb-2">XÁC NHẬN TRẢ SÁCH</h2>
        
        <div class="space-y-4 text-sm text-slate-600 font-medium">
          <div class="flex justify-between">
            <span>Mã phiếu mượn:</span>
            <strong class="text-slate-900">{{ activeReceipt.maPhieu }}</strong>
          </div>
          <div class="flex justify-between">
            <span>Độc giả mượn:</span>
            <strong class="text-slate-900">{{ activeReceipt.docGia?.hoLot }} {{ activeReceipt.docGia?.ten }}</strong>
          </div>
          <div class="flex justify-between text-xs">
            <span>Hạn trả:</span>
            <strong class="text-slate-800">{{ formatDate(activeReceipt.ngayHenTra) }}</strong>
          </div>

          <hr class="border-slate-100" />

          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Chọn các cuốn sách được trả hôm nay:</p>

          <!-- Book selection list -->
          <div class="space-y-2">
            <div 
              v-for="item in returnForm.chiTietMuon" 
              :key="item.sachId"
              class="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200"
            >
              <div class="flex-grow min-w-0 pr-4">
                <span class="font-bold text-xs text-slate-800 block leading-tight truncate">{{ item.tenSach }}</span>
                <span class="text-[9px] text-slate-400 block font-mono">Mã sách: {{ item.maSach }}</span>
              </div>
              <div class="flex-shrink-0 flex items-center">
                <!-- Nếu sách chưa trả, hiển thị 3 lựa chọn radio -->
                <div v-if="!item.alreadyReturned" class="flex items-center space-x-3.5">
                  <label class="inline-flex items-center text-xs font-bold text-slate-500 cursor-pointer">
                    <input type="radio" :name="'status_' + item.sachId" v-model="item.statusAction" value="CHUA_TRA" class="h-3.5 w-3.5 text-slate-600 focus:ring-slate-500 mr-1" />
                    Chưa trả
                  </label>
                  <label class="inline-flex items-center text-xs font-bold text-primary cursor-pointer">
                    <input type="radio" :name="'status_' + item.sachId" v-model="item.statusAction" value="TRA_SACH" class="h-3.5 w-3.5 text-primary focus:ring-primary mr-1" />
                    Đã trả
                  </label>
                  <label class="inline-flex items-center text-xs font-bold text-red-600 cursor-pointer">
                    <input type="radio" :name="'status_' + item.sachId" v-model="item.statusAction" value="MAT_SACH" class="h-3.5 w-3.5 text-red-600 focus:ring-red-500 mr-1" />
                    Báo mất
                  </label>
                </div>
                <span 
                  v-else
                  class="bg-green-100 text-green-700 text-[9px] font-bold px-2.5 py-1 rounded-full"
                >
                  Đã trả từ trước
                </span>
              </div>
            </div>
          </div>

          <!-- Date field -->
          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-500 uppercase">Ngày trả thực tế</label>
            <input 
              v-model="returnForm.ngayTraThucTe" 
              type="date" 
              required
              class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
            />
          </div>
        </div>

        <button 
          @click="submitReturn"
          :disabled="submitting"
          class="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2"
        >
          <span>Xác nhận trả sách</span>
        </button>
      </div>
    </div>
    </Teleport>
    
    <!-- Custom Confirm Dialog -->
    <ConfirmModal ref="confirmModal" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../services/api';
import { X as XIcon, Search } from '@lucide/vue';
import ConfirmModal from '../../components/ConfirmModal.vue';
import { useToastStore } from '../../stores/toast';

const confirmModal = ref(null);
const toast = useToastStore();
const receipts = ref([]);
const selectedStatus = ref('');
const activeReceipt = ref(null);
const submitting = ref(false);
const searchQuery = ref('');

const returnForm = ref({
  chiTietMuon: [],
  ngayTraThucTe: ''
});

const statuses = [
  { label: 'Tất cả', value: '' },
  { label: 'Chờ duyệt', value: 'CHO_DUYET' },
  { label: 'Sẵn sàng', value: 'SAN_SANG' },
  { label: 'Đang mượn', value: 'DANG_MUON' },
  { label: 'Đã trả sách', value: 'DA_TRA' },
  { label: 'Quá hạn', value: 'QUA_HAN' }
];

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

const getReceiptStatusText = (status) => {
  const map = {
    'CHO_DUYET': 'Chờ duyệt',
    'SAN_SANG': 'Sẵn sàng',
    'DANG_MUON': 'Đang mượn',
    'DA_TRA': 'Đã trả',
    'QUA_HAN': 'Quá hạn',
    'HUY': 'Đã hủy'
  };
  return map[status] || status;
};

const getReceiptStatusClass = (status) => {
  const map = {
    'CHO_DUYET': 'bg-slate-100 text-slate-700',
    'SAN_SANG': 'bg-amber-100 text-amber-700',
    'DANG_MUON': 'bg-primary-light text-primary-dark',
    'DA_TRA': 'bg-green-100 text-green-700',
    'QUA_HAN': 'bg-red-100 text-red-700',
    'HUY': 'bg-red-50 text-red-400'
  };
  return map[status] || 'bg-slate-100';
};

const filterStatus = (status) => {
  selectedStatus.value = status;
  fetchReceipts();
};

const fetchReceipts = async () => {
  try {
    let url = '/borrowing/receipts?';
    if (selectedStatus.value) url += `status=${selectedStatus.value}&`;
    if (searchQuery.value.trim()) url += `q=${encodeURIComponent(searchQuery.value.trim())}&`;
    const res = await api.get(url);
    if (res.success) {
      receipts.value = res.data;
    }
  } catch (error) {
    console.error('Fetch receipts error:', error);
  }
};

const openReturnModal = (receipt) => {
  activeReceipt.value = receipt;
  returnForm.value = {
    ngayTraThucTe: new Date().toISOString().split('T')[0],
    chiTietMuon: receipt.chiTietMuon.map(item => ({
      sachId: item.sach?._id,
      tenSach: item.sach?.dauSach?.tenSach,
      maSach: item.sach?.maSach,
      daTraChua: item.daTraChua,
      alreadyReturned: item.daTraChua,
      statusAction: item.daTraChua ? 'TRA_SACH' : 'CHUA_TRA'
    }))
  };
};

const submitReturn = async () => {
  if (!activeReceipt.value || submitting.value) return;
  const ok = await confirmModal.value.ask({ message: 'Bạn có chắc chắn muốn ghi nhận trạng thái mượn trả/báo mất cho phiếu mượn này không?' });
  if (!ok) return;
  submitting.value = true;
  try {
    const chiTietMuon = returnForm.value.chiTietMuon.map(item => {
      let daTraChua = item.daTraChua;
      let tinhTrangSauMuon = '';
      if (item.statusAction === 'TRA_SACH') {
        daTraChua = true;
        tinhTrangSauMuon = 'TRA_SACH';
      } else if (item.statusAction === 'MAT_SACH') {
        daTraChua = true; // Đánh dấu đã xử lý để đóng phiếu
        tinhTrangSauMuon = 'MAT';
      } else if (item.statusAction === 'CHUA_TRA') {
        daTraChua = false;
      }
      return {
        sach: item.sachId,
        daTraChua,
        tinhTrangSauMuon
      };
    });

    const res = await api.post(`/borrowing/receipts/${activeReceipt.value._id}/return`, {
      chiTietMuon,
      ngayTraThucTe: returnForm.value.ngayTraThucTe
    });

    if (res.success) {
      toast.show('Ghi nhận trả sách thành công!');
      activeReceipt.value = null;
      fetchReceipts();
    }
  } catch (error) {
    toast.show(error.message || 'Lỗi khi ghi nhận trả sách', 'error');
  } finally {
    submitting.value = false;
  }
};

const cancelReceipt = async (id) => {
  const ok = await confirmModal.value.ask({ message: 'Bạn có chắc chắn muốn hủy phiếu mượn này không?' });
  if (!ok) return;
  try {
    const res = await api.post(`/borrowing/receipts/${id}/cancel`);
    if (res.success) {
      toast.show('Đã hủy phiếu mượn thành công.');
      fetchReceipts();
    }
  } catch (error) {
    toast.show(error.message || 'Lỗi khi hủy phiếu mượn', 'error');
  }
};

const approveReceipt = async (id) => {
  const ok = await confirmModal.value.ask({
    title: 'Xác nhận duyệt phiếu',
    message: 'Duyệt phiếu mượn này? Sách sẽ được chuẩn bị sẵn sàng cho độc giả đến lấy.',
    confirmText: 'Duyệt phiếu',
    cancelText: 'Hủy bỏ'
  });
  if (!ok) return;
  try {
    const res = await api.post(`/borrowing/receipts/${id}/approve`);
    if (res.success) {
      toast.show('Duyệt thành công! Phiếu đang ở trạng thái "Sẵn sàng" chờ độc giả đến lấy sách.', 'success');
      fetchReceipts();
    }
  } catch (error) {
    toast.show(error.message || 'Lỗi khi duyệt phiếu mượn', 'error');
  }
};

const pickupReceipt = async (id) => {
  const ok = await confirmModal.value.ask({
    title: 'Xác nhận giao sách',
    message: 'Độc giả đã đến lấy sách? Phiếu sẽ chuyển sang "Đang mượn" và bắt đầu tính thời hạn trả + phí mượn từ lúc này.',
    confirmText: 'Giao sách',
    cancelText: 'Hủy bỏ'
  });
  if (!ok) return;
  try {
    const res = await api.post(`/borrowing/receipts/${id}/pickup`);
    if (res.success) {
      toast.show('Đã giao sách thành công! Phiếu hiện đang ở trạng thái "Đang mượn", bắt đầu tính hạn trả & phí.', 'success');
      fetchReceipts();
    }
  } catch (error) {
    toast.show(error.message || 'Lỗi khi giao sách', 'error');
  }
};

onMounted(() => {
  fetchReceipts();
});
</script>
