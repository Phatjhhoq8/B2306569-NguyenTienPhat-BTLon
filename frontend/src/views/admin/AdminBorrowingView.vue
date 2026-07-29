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
                  class="bg-primary hover:bg-primary-dark text-white font-bold text-xs py-1.5 px-3 rounded-xl transition-all shadow inline-block"
                >
                  Ghi nhận trả
                </button>
                <button 
                  v-if="receipt.trangThai === 'DANG_MUON' || receipt.trangThai === 'QUA_HAN'"
                  @click="openRenewModal(receipt)"
                  class="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-1.5 px-3 rounded-xl transition-all shadow inline-block"
                >
                  Gia hạn
                </button>
                <button 
                  v-if="receipt.trangThai === 'SAN_SANG'"
                  @click="pickupReceipt(receipt._id)"
                  class="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-1.5 px-3 rounded-xl transition-all shadow"
                >
                  Giao sách
                </button>
                <button 
                  v-if="receipt.trangThai === 'SAN_SANG'"
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
    
    <!-- Renew Date Modal (Admin) -->
    <Teleport to="body">
      <div 
        v-if="isRenewModalOpen" 
        class="fixed inset-0 bg-slate-900/65 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-300"
        @click.self="isRenewModalOpen = false"
      >
        <div class="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-150 transform scale-100 transition-all duration-300">
          <div class="flex items-center space-x-3 text-primary">
            <div class="bg-blue-50 p-2.5 rounded-xl">
              <span class="text-xl">📅</span>
            </div>
            <h3 class="font-sans font-extrabold text-slate-900 text-sm uppercase tracking-wide">
              Gia hạn phiếu mượn (Thủ thư)
            </h3>
          </div>

          <div v-if="loadingSub" class="text-center py-4 text-xs font-semibold text-slate-400">
            Đang tải thông tin gói hội viên của độc giả...
          </div>
          <div v-else-if="renewingReceipt" class="space-y-3 text-xs text-slate-600 font-medium">
            <p><strong>Mã phiếu:</strong> {{ renewingReceipt.maPhieu }}</p>
            <p><strong>Độc giả:</strong> {{ renewingReceipt.docGia?.hoLot }} {{ renewingReceipt.docGia?.ten }} ({{ renewingReceipt.docGia?.maDocGia }})</p>
            <p><strong>Ngày mượn gốc:</strong> {{ formatDate(renewingReceipt.ngayMuon) }}</p>
            <p><strong>Hạn trả hiện tại:</strong> {{ formatDate(renewingReceipt.ngayHenTra) }}</p>
            <p><strong>Hạn trả tối đa cho phép:</strong> {{ formatDate(getMaxRenewDate(renewingReceipt)) }}</p>
            
            <div v-if="activeSub" class="space-y-1 pt-2">
              <label class="block text-slate-700 font-bold">Chọn ngày hẹn trả mới:</label>
              <input 
                type="date" 
                v-model="newDueDateStr"
                :min="getMinRenewDateStr(renewingReceipt)"
                :max="getMaxRenewDateStr(renewingReceipt)"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:border-primary"
              />
            </div>
            <div v-else class="p-3 bg-red-50 rounded-xl border border-red-100 text-red-800 font-bold">
              Độc giả này không có gói hội viên còn hiệu lực hoặc gói không hỗ trợ gia hạn online. Không thể thực hiện gia hạn phiếu mượn.
            </div>

            <!-- Phí phát sinh dự tính -->
            <div v-if="activeSub && estimatedExtraFee > 0" class="p-3 bg-amber-50 rounded-xl border border-amber-100 text-amber-900 font-bold space-y-1">
              <p>Phí gia hạn phát sinh thêm: {{ formatCurrency(estimatedExtraFee) }}</p>
              <p class="text-[10px] text-slate-500 font-normal">
                (Số ngày gia hạn thêm: {{ estimatedRenewDays }} ngày × {{ formatCurrency(activeSub.goiDocGia?.phiMuonSachGiay) }}/ngày/sách)
              </p>
            </div>
            <div v-else-if="activeSub" class="p-3 bg-green-50 rounded-xl border border-green-100 text-green-800 font-bold">
              Gia hạn miễn phí (giáo trình hoặc gói mượn miễn phí).
            </div>
          </div>

          <div class="flex space-x-3 pt-2">
            <button 
              @click="isRenewModalOpen = false"
              class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold py-2.5 rounded-xl text-xs transition-colors"
            >
              Hủy bỏ
            </button>
            <button 
              @click="submitRenew"
              :disabled="!activeSub || !newDueDateStr || isRenewSubmitting"
              class="flex-1 bg-primary hover:bg-primary-dark text-white font-extrabold py-2.5 rounded-xl text-xs transition-all shadow-md disabled:opacity-50"
            >
              {{ isRenewSubmitting ? 'Đang xử lý...' : 'Xác nhận gia hạn' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Custom Confirm Dialog -->
    <ConfirmModal ref="confirmModal" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../../services/api';
import { X as XIcon, Search } from '@lucide/vue';
import ConfirmModal from '../../components/ConfirmModal.vue';
import { useToastStore } from '../../stores/toast';
import {
  BORROW_RECEIPT_STATUS_FILTERS,
  getBorrowReceiptStatusClass,
  getBorrowReceiptStatusLabel,
} from '../../constants/borrowReceiptStatuses';

const confirmModal = ref(null);

const isRenewModalOpen = ref(false);
const renewingReceipt = ref(null);
const newDueDateStr = ref('');
const isRenewSubmitting = ref(false);
const activeSub = ref(null);
const loadingSub = ref(false);

const formatCurrency = (val) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
};

const fetchReaderSubscription = async (readerId) => {
  activeSub.value = null;
  loadingSub.value = true;
  try {
    const res = await api.get('/memberships/subscriptions');
    if (res.success) {
      const readerSub = res.data.find(sub => 
        sub.docGia && 
        String(sub.docGia._id) === String(readerId) && 
        sub.trangThai === 'DANG_HIEU_LUC'
      );
      activeSub.value = readerSub || null;
    }
  } catch (error) {
    console.error('Fetch reader subscription error:', error);
  } finally {
    loadingSub.value = false;
  }
};

const getMinRenewDateStr = (receipt) => {
  if (!receipt) return '';
  const date = new Date(receipt.ngayHenTra);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
};

const getMaxRenewDate = (receipt) => {
  if (!receipt || !activeSub.value || !activeSub.value.goiDocGia) return null;
  const maxDays = activeSub.value.goiDocGia.soNgayMuonToiDa || 14;
  const date = new Date(receipt.ngayMuon);
  date.setDate(date.getDate() + maxDays);
  return date;
};

const getMaxRenewDateStr = (receipt) => {
  const maxDate = getMaxRenewDate(receipt);
  return maxDate ? maxDate.toISOString().split('T')[0] : '';
};

const estimatedRenewDays = computed(() => {
  if (!renewingReceipt.value || !newDueDateStr.value) return 0;
  const newDate = new Date(newDueDateStr.value);
  const oldDate = new Date(renewingReceipt.value.ngayHenTra);
  newDate.setHours(12, 0, 0, 0);
  oldDate.setHours(12, 0, 0, 0);
  const diffTime = newDate.getTime() - oldDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

const estimatedExtraFee = computed(() => {
  if (!renewingReceipt.value || !newDueDateStr.value || !activeSub.value || !activeSub.value.goiDocGia) return 0;
  const days = estimatedRenewDays.value;
  const baseRate = activeSub.value.goiDocGia.phiMuonSachGiay || 0;
  
  let chargeableCount = 0;
  for (const item of renewingReceipt.value.chiTietMuon) {
    if (item.sach && item.sach.dauSach) {
      const title = item.sach.dauSach;
      const isGiaoTrinh = (title.tenSach || '').toLowerCase().includes('giáo trình') ||
                           (title.tenSach || '').toLowerCase().includes('bài tập') ||
                           (title.tenSach || '').toLowerCase().includes('sách giáo khoa') ||
                           (title.theLoai || '').toString().toLowerCase().includes('giáo dục') ||
                           (title.theLoai || '').toString().toLowerCase().includes('ngoại ngữ') ||
                           (title.theLoai || '').toString().toLowerCase().includes('khoa học');
      if (!isGiaoTrinh) {
        chargeableCount++;
      }
    }
  }
  return days * baseRate * chargeableCount;
});

const openRenewModal = async (receipt) => {
  renewingReceipt.value = receipt;
  isRenewModalOpen.value = true;
  await fetchReaderSubscription(receipt.docGia?._id);
  
  if (activeSub.value) {
    const minDateStr = getMinRenewDateStr(receipt);
    const maxDateStr = getMaxRenewDateStr(receipt);
    
    if (minDateStr > maxDateStr) {
      toast.show('Phiếu mượn đã đạt thời hạn tối đa của gói hội viên, không thể gia hạn thêm!', 'error');
      isRenewModalOpen.value = false;
      return;
    }
    
    newDueDateStr.value = minDateStr;
  }
};

const submitRenew = async () => {
  if (!renewingReceipt.value || !newDueDateStr.value) return;
  isRenewSubmitting.value = true;
  try {
    const res = await api.post(`/borrowing/receipts/${renewingReceipt.value._id}/renew`, {
      ngayHenTraMoi: newDueDateStr.value
    });
    if (res.success) {
      toast.show('Gia hạn phiếu mượn thành công!', 'success');
      isRenewModalOpen.value = false;
      fetchReceipts();
    }
  } catch (error) {
    toast.show(error.message || 'Lỗi khi gia hạn phiếu mượn', 'error');
  } finally {
    isRenewSubmitting.value = false;
  }
};
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

const statuses = BORROW_RECEIPT_STATUS_FILTERS;

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

const getReceiptStatusText = (status) => {
  return getBorrowReceiptStatusLabel(status);
};

const getReceiptStatusClass = (status) => {
  return getBorrowReceiptStatusClass(status);
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
