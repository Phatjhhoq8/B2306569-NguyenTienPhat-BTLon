<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
    <h1 class="font-serif text-3xl font-bold text-slate-900 border-b pb-3 flex items-center">
      <User class="h-8 w-8 mr-2 text-primary" /> Hồ Sơ Độc Giả
    </h1>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Left Info Column (4/12) -->
      <aside class="lg:col-span-4 space-y-6">
        <!-- Personal Info Card -->
        <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div class="flex items-center space-x-3">
            <div class="bg-primary text-white h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg">
              {{ authStore.user?.ten?.charAt(0) }}
            </div>
            <div>
              <h3 class="font-bold text-slate-800">{{ authStore.user?.hoLot }} {{ authStore.user?.ten }}</h3>
              <span class="text-xs font-semibold text-slate-400">ĐỘC GIẢ ({{ authStore.user?.maDocGia }})</span>
            </div>
          </div>

          <hr class="border-slate-100" />

          <ul class="space-y-3 text-sm text-slate-600 font-medium">
            <li class="flex items-center"><Mail class="h-4 w-4 mr-2 text-primary" /> {{ authStore.user?.email }}</li>
            <li class="flex items-center"><Phone class="h-4 w-4 mr-2 text-primary" /> {{ authStore.user?.dienThoai }}</li>
            <li class="flex items-center"><MapPin class="h-4 w-4 mr-2 text-primary" /> {{ authStore.user?.diachi }}</li>
            <li class="flex items-center"><Calendar class="h-4 w-4 mr-2 text-primary" /> Sinh ngày: {{ formatDate(authStore.user?.ngaySinh) }}</li>
          </ul>
        </div>

        <!-- Membership Active Subscription card -->
        <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 class="font-serif text-lg font-bold text-slate-800 flex items-center">
            <Award class="h-5 w-5 mr-2 text-primary" /> Thẻ hội viên
          </h3>
          
          <div v-if="activeSub" class="space-y-3">
            <div class="bg-gradient-to-r from-primary to-indigo-900 text-white p-4 rounded-2xl space-y-2 relative overflow-hidden">
              <div class="absolute -right-6 -bottom-6 w-16 h-16 bg-white/10 rounded-full"></div>
              <span class="text-[10px] uppercase font-bold tracking-widest block opacity-70">Gói hoạt động</span>
              <h4 class="font-bold text-lg text-secondary">{{ activeSub.goiDocGia?.tenGoi || 'Standard' }}</h4>
              <span class="text-[10px] block opacity-90">Hạn dùng: {{ formatDate(activeSub.ngayKetThuc) }}</span>
            </div>
            <ul class="text-xs space-y-1 text-slate-500 font-medium pt-2">
              <li>• Mượn tối đa: {{ activeSub.goiDocGia?.soSachToiDa }} cuốn</li>
              <li>• Thời gian mượn: {{ activeSub.goiDocGia?.soNgayMuonToiDa }} ngày</li>
              <li class="pt-2 text-slate-700 flex flex-col gap-1.5 border-t border-slate-100 mt-2">
                <span class="block">
                  <strong>Thanh toán:</strong> 
                  {{ activeSub.phuongThucThanhToan === 'THE_TIN_DUNG' ? 'Thẻ tín dụng/Ghi nợ' : 'Chuyển khoản VietQR' }}
                </span>
                
                <span v-if="activeSub.phuongThucThanhToan === 'THE_TIN_DUNG'" class="flex items-center gap-1.5">
                  <span class="h-2 w-2 rounded-full" :class="activeSub.tuDongGiaHan ? 'bg-green-500 animate-pulse' : 'bg-slate-400'"></span>
                  <span>Tự động gia hạn: <strong>{{ activeSub.tuDongGiaHan ? 'Đang bật' : 'Đã tắt' }}</strong></span>
                </span>
                <span v-else class="text-slate-500 italic text-[11px] block">Thanh toán từng kỳ (Không tự động gia hạn)</span>

                <button 
                  v-if="activeSub.phuongThucThanhToan === 'THE_TIN_DUNG' && activeSub.tuDongGiaHan && activeSub.trangThai === 'DANG_HIEU_LUC'"
                  @click="cancelSubscription"
                  :disabled="cancelling"
                  class="mt-1 w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-1.5 px-3 rounded-xl text-[10px] transition-colors border border-red-200"
                >
                  {{ cancelling ? 'Đang hủy gia hạn...' : 'Hủy tự động gia hạn' }}
                </button>
              </li>
            </ul>
          </div>
          
          <div v-else class="text-center py-4 space-y-3">
            <p class="text-xs text-slate-400 font-medium">Bạn chưa đăng ký gói hội viên VIP nào.</p>
            <router-link to="/memberships" class="bg-primary-light text-primary hover:bg-primary hover:text-white transition-all text-xs font-semibold py-2 px-4 rounded-xl inline-block">
              Nâng cấp gói ngay
            </router-link>
          </div>
        </div>
      </aside>

      <!-- Right Tab Content Column (8/12) -->
      <div class="lg:col-span-8 space-y-8">
        <!-- Loan History Section -->
        <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          <h2 class="font-serif text-xl font-bold text-slate-800 border-b pb-2 flex items-center">
            <BookOpen class="h-5 w-5 mr-2 text-primary" /> Sách Đang Mượn & Lịch sử
          </h2>

          <div v-if="receipts.length > 0" class="space-y-6">
            <div 
              v-for="receipt in receipts" 
              :key="receipt._id"
              class="border border-slate-100 rounded-2xl p-5 bg-slate-50 space-y-4"
            >
              <div class="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <span class="text-xs text-slate-400 font-bold">MÃ PHIẾU: {{ receipt.maPhieu }}</span>
                  <span class="text-[10px] text-slate-500 block">Mượn ngày: {{ formatDate(receipt.ngayMuon) }} | Hẹn trả: {{ formatDate(receipt.ngayHenTra) }}</span>
                </div>
                <span 
                  class="text-xs font-bold px-3 py-1 rounded-full uppercase"
                  :class="getReceiptStatusClass(receipt.trangThai)"
                >
                  {{ getReceiptStatusText(receipt.trangThai) }}
                </span>
              </div>

              <!-- Books inside Receipt -->
              <div class="space-y-3">
                <div 
                  v-for="item in receipt.chiTietMuon" 
                  :key="item._id"
                  class="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200"
                >
                  <div class="flex items-center space-x-3">
                    <div class="h-12 w-8 bg-slate-100 rounded overflow-hidden flex-shrink-0 border border-slate-200">
                      <img :src="getImageUrl(item.sach?.dauSach?.hinhAnh)" class="h-full w-full object-cover" />
                    </div>
                    <div>
                      <span class="font-bold text-xs text-slate-800 line-clamp-1 max-w-[200px]">{{ item.sach?.dauSach?.tenSach }}</span>
                      <span class="text-[9px] text-slate-400 block font-medium">Bản Specimen: {{ item.sach?.maSach }} | Vị trí: {{ item.sach?.viTriKe }}</span>
                    </div>
                  </div>
                  <span 
                    class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    :class="item.daTraChua ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'"
                  >
                    {{ item.daTraChua ? 'Đã trả' : 'Chưa trả' }}
                  </span>
                </div>
              </div>

              <!-- Receipt checkout breakdown -->
              <div class="flex justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-medium">
                <span>Phí thanh toán: {{ formatCurrency(receipt.tongTienThanhToan) }}</span>
                <span v-if="receipt.fineAmount > 0" class="text-red-600 font-bold">
                  Phạt trễ hạn: {{ formatCurrency(receipt.fineAmount) }}
                </span>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-8 text-sm text-slate-400 font-medium">
            Bạn chưa thực hiện phiếu mượn sách nào.
          </div>
        </div>

        <!-- Penalty Tickets Section -->
        <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          <h2 class="font-serif text-xl font-bold text-slate-800 border-b pb-2 flex items-center">
            <AlertTriangle class="h-5 w-5 mr-2 text-red-500" /> Danh sách Phiếu Phạt
          </h2>

          <div v-if="penalties.length > 0" class="space-y-4">
            <div 
              v-for="ticket in penalties" 
              :key="ticket._id"
              class="border border-slate-100 rounded-2xl p-4 bg-red-50/30 flex justify-between items-center flex-wrap gap-4"
            >
              <div>
                <span class="text-xs text-slate-400 font-bold">MÃ PHIẾU PHẠT: {{ ticket.maPhieuPhat }}</span>
                <p class="text-sm font-semibold text-slate-700 mt-1">Lỗi phạt: {{ ticket.lyDoPhat }}</p>
                <span class="text-xs text-red-600 font-bold block">Số tiền: {{ formatCurrency(ticket.soTienPhat) }}</span>
              </div>
              <div>
                <span 
                  v-if="ticket.daThanhToan"
                  class="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase"
                >
                  Đã thanh toán
                </span>
                <button 
                  v-else
                  @click="payPenalty(ticket)"
                  class="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-1.5 px-4 rounded-xl transition-colors shadow"
                >
                  Mô phỏng thanh toán
                </button>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-8 text-sm text-slate-400 font-medium">
            Tuyệt vời! Bạn không có phiếu phạt chưa thanh toán.
          </div>
        </div>
      </div>
    </div>
    <!-- Custom Confirm Dialog -->
    <ConfirmModal ref="confirmModal" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import api from '../services/api';
import { User, Mail, Phone, MapPin, Calendar, Award, BookOpen, AlertTriangle } from '@lucide/vue';
import { useToastStore } from '../stores/toast';
import ConfirmModal from '../components/ConfirmModal.vue';

const authStore = useAuthStore();
const toast = useToastStore();
const confirmModal = ref(null);

const activeSub = ref(null);
const receipts = ref([]);
const penalties = ref([]);
const cancelling = ref(false);

const cancelSubscription = async () => {
  const ok = await confirmModal.value.ask({
    title: 'Xác nhận hủy tự động gia hạn',
    message: 'Bạn có chắc chắn muốn hủy tự động gia hạn cho gói dịch vụ này? Gói vẫn sẽ hoạt động cho đến ngày hết hạn và không tự động trừ tiền kỳ tiếp theo.',
    confirmText: 'Hủy gia hạn',
    cancelText: 'Quay lại'
  });
  if (!ok) return;

  cancelling.value = true;
  try {
    const res = await api.post('/memberships/cancel-auto-renew');
    if (res.success) {
      toast.show('Đã hủy tự động gia hạn thành công! Gói hội viên của bạn sẽ hết hạn khi tới hạn.', 'success');
      await loadData();
    }
  } catch (error) {
    toast.show(error.message || 'Có lỗi xảy ra khi hủy gia hạn.', 'error');
  } finally {
    cancelling.value = false;
  }
};

const getImageUrl = (path) => {
  if (!path) return '/placeholder_book.png';
  if (path.startsWith('http') || path.startsWith('data:image')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `http://localhost:3000${cleanPath}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

const formatCurrency = (val) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
};

const getReceiptStatusText = (status) => {
  const map = {
    'PENDING': 'Chờ duyệt',
    'DANG_MUON': 'Đang mượn',
    'DA_TRA': 'Đã trả sách',
    'QUA_HAN': 'Quá hạn trả',
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

const payPenalty = async (ticket) => {
  const ok = await confirmModal.value.ask({
    title: 'Xác nhận thanh toán phạt',
    message: `Bạn muốn gửi xác nhận mô phỏng thanh toán số tiền ${formatCurrency(ticket.soTienPhat)} cho phiếu phạt ${ticket.maPhieuPhat}?`,
    confirmText: 'Mô phỏng thanh toán',
    cancelText: 'Hủy bỏ'
  });
  if (!ok) return;

  try {
    toast.show(`Yêu cầu đang chờ phê duyệt. Vui lòng cung cấp mã ${ticket.maPhieuPhat} cho Thủ thư để hoàn tất.`, 'warning');
  } catch (error) {
    toast.show(error.message, 'error');
  }
};

const loadData = async () => {
  try {
    const [subRes, receiptRes, penaltyRes] = await Promise.all([
      api.get('/memberships/my-subscriptions'),
      api.get('/borrowing/my-receipts'),
      api.get('/borrowing/my-penalties')
    ]);
    
    if (subRes.success && subRes.data.length > 0) {
      activeSub.value = subRes.data.find(s => s.trangThai === 'DANG_HIEU_LUC') || subRes.data[0];
    }
    if (receiptRes.success) {
      receipts.value = receiptRes.data;
    }
    if (penaltyRes.success) {
      penalties.value = penaltyRes.data;
    }
  } catch (error) {
    console.error('Profile load error:', error);
  }
};

onMounted(() => {
  loadData();
});
</script>
