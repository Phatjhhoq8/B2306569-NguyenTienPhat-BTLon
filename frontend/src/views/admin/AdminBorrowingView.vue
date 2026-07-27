<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex justify-between items-center border-b pb-3">
      <div>
        <h1 class="font-sans text-3xl font-extrabold text-slate-900">Quản Lý Mượn / Trả Sách</h1>
        <p class="text-sm text-slate-500 font-medium">Phê duyệt phiếu mượn, xác nhận trả sách và theo dõi quá hạn</p>
      </div>
    </div>

    <!-- Filters & List -->
    <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
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
                  <span :class="item.daTraChua ? 'text-green-600' : 'text-amber-600'">
                    [{{ item.daTraChua ? 'Đã trả' : 'Chưa trả' }}]
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
                  v-if="receipt.trangThai === 'PENDING'"
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
              <div class="flex items-center space-x-3">
                <!-- Checkbox -->
                <input 
                  type="checkbox" 
                  v-model="item.daTraChua"
                  :disabled="item.alreadyReturned"
                  class="h-4 w-4 text-primary focus:ring-primary rounded"
                />
                <div>
                  <span class="font-bold text-xs text-slate-800 block leading-tight">{{ item.tenSach }}</span>
                  <span class="text-[9px] text-slate-400 block font-mono">Mã: {{ item.maSach }}</span>
                </div>
              </div>
              <span 
                v-if="item.alreadyReturned"
                class="bg-green-100 text-green-700 text-[9px] font-bold px-2 py-0.5 rounded-full"
              >
                Đã trả từ trước
              </span>
              <span 
                v-else
                class="text-[9px] font-bold px-2 py-0.5 rounded-full"
                :class="item.daTraChua ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'"
              >
                {{ item.daTraChua ? 'Sắp trả' : 'Chưa trả' }}
              </span>
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
import { X } from '@lucide/vue';
import ConfirmModal from '../../components/ConfirmModal.vue';
import { useToastStore } from '../../stores/toast';

const confirmModal = ref(null);
const toast = useToastStore();
const receipts = ref([]);
const selectedStatus = ref('');
const activeReceipt = ref(null);
const submitting = ref(false);

const returnForm = ref({
  chiTietMuon: [],
  ngayTraThucTe: ''
});

const statuses = [
  { label: 'Tất cả', value: '' },
  { label: 'Chờ duyệt', value: 'PENDING' },
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
    'DANG_MUON': 'bg-blue-100 text-blue-700',
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
    let url = '/borrowing/receipts';
    if (selectedStatus.value) url += `?status=${selectedStatus.value}`;
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
      alreadyReturned: item.daTraChua
    }))
  };
};

const submitReturn = async () => {
  if (!activeReceipt.value || submitting.value) return;
  const ok = await confirmModal.value.ask({ message: 'Bạn có chắc chắn muốn ghi nhận trả sách cho phiếu mượn này không?' });
  if (!ok) return;
  submitting.value = true;
  try {
    // Chỉ gửi các cuốn sách được đánh dấu trả
    const chiTietMuon = returnForm.value.chiTietMuon.map(item => ({
      sach: item.sachId,
      daTraChua: item.daTraChua
    }));

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

onMounted(() => {
  fetchReceipts();
});
</script>
