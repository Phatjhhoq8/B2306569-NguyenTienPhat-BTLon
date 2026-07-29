<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
    <div class="bg-gradient-to-r from-slate-950 via-primary to-indigo-900 rounded-[2rem] p-6 md:p-8 text-white shadow-xl overflow-hidden relative">
      <div class="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/10"></div>
      <div class="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="flex items-center gap-4">
          <div class="h-20 w-20 rounded-3xl bg-white/15 border border-white/20 flex items-center justify-center text-3xl font-black">
            {{ authStore.user?.ten?.charAt(0) }}
          </div>
          <div class="space-y-1">
            <span class="text-xs uppercase tracking-[0.25em] text-white/60 font-black">Hồ sơ độc giả</span>
            <h1 class="font-serif text-3xl font-bold">{{ authStore.user?.hoLot }} {{ authStore.user?.ten }}</h1>
            <p class="text-sm text-white/70 font-semibold">{{ authStore.user?.maDocGia }} · {{ activeSub?.goiDocGia?.tenGoi || 'Chưa có gói hội viên' }}</p>
          </div>
        </div>
        <router-link to="/memberships" class="bg-white text-slate-950 hover:bg-secondary transition-all text-sm font-black py-3 px-5 rounded-2xl shadow-lg text-center">
          Quản lý hội viên
        </router-link>
      </div>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div v-for="stat in profileStats" :key="stat.label" class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <span class="text-[10px] uppercase tracking-wider font-black text-slate-400">{{ stat.label }}</span>
        <p class="text-2xl font-black text-slate-900 mt-1">{{ stat.value }}</p>
        <span class="text-[10px] font-bold" :class="stat.tone">{{ stat.caption }}</span>
      </div>
    </div>

    <div class="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm flex flex-wrap gap-2">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        @click="activeTab = tab.value"
        class="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
        :class="activeTab === tab.value ? 'bg-primary text-white shadow' : 'text-slate-500 hover:bg-slate-50'"
      >
        {{ tab.label }}
      </button>
    </div>

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
                  :disabled="renewLoading"
                  class="mt-1 w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-1.5 px-3 rounded-xl text-[10px] transition-colors border border-red-200"
                >
                  {{ renewLoading ? 'Đang xử lý...' : 'Hủy tự động gia hạn' }}
                </button>
                <button
                  v-else-if="activeSub.phuongThucThanhToan === 'THE_TIN_DUNG' && !activeSub.tuDongGiaHan && activeSub.trangThai === 'DANG_HIEU_LUC'"
                  @click="enableAutoRenew"
                  :disabled="renewLoading"
                  class="mt-1 w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold py-1.5 px-3 rounded-xl text-[10px] transition-colors border border-emerald-200"
                >
                  {{ renewLoading ? 'Đang xử lý...' : 'Bật lại tự động gia hạn' }}
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
        <div v-show="activeTab === 'loans'" class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          <h2 class="font-serif text-xl font-bold text-slate-800 border-b pb-2 flex items-center">
            <BookOpen class="h-5 w-5 mr-2 text-primary" /> Sách Đang Mượn & Lịch sử
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            <input
              v-model="borrowSearchQuery"
              type="text"
              placeholder="Tìm mã phiếu, tên sách, mã sách..."
              class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-primary"
            />
            <select v-model="borrowStatusFilter" class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none">
              <option value="">Tất cả trạng thái</option>
              <option value="CHO_DUYET">Chờ duyệt</option>
              <option value="SAN_SANG">Sẵn sàng lấy sách</option>
              <option value="DANG_MUON">Đang mượn</option>
              <option value="DA_TRA">Đã trả sách</option>
              <option value="QUA_HAN">Quá hạn trả</option>
              <option value="HUY">Đã hủy</option>
            </select>
            <select v-model="borrowReturnFilter" class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none">
              <option value="">Tất cả tình trạng trả</option>
              <option value="has_unreturned">Có sách chưa trả</option>
              <option value="all_returned">Đã trả toàn bộ</option>
              <option value="has_late">Có sách trả trễ</option>
            </select>
            <div class="flex gap-2">
              <select v-model="borrowTimeFilter" class="min-w-0 flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none">
                <option value="">Tất cả thời gian</option>
                <option value="7d">7 ngày gần đây</option>
                <option value="30d">30 ngày gần đây</option>
                <option value="this_month">Tháng này</option>
                <option value="this_year">Năm nay</option>
              </select>
              <button v-if="hasBorrowFilters" @click="resetBorrowFilters" class="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black whitespace-nowrap">
                Đặt lại
              </button>
            </div>
          </div>

          <div v-if="receipts.length > 0" class="space-y-6">
            <div 
              v-for="receipt in filteredReceipts" 
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
                    :class="receipt.trangThai === 'HUY' ? 'bg-slate-100 text-slate-500' : 
                            (item.daTraChua ? 
                              (item.ngayTraThucTe && new Date(item.ngayTraThucTe) > new Date(receipt.ngayHenTra) ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700') 
                              : 'bg-amber-100 text-amber-700')"
                  >
                    {{ receipt.trangThai === 'HUY' ? 'Đã hủy' : 
                       (item.daTraChua ? 
                         (item.ngayTraThucTe && new Date(item.ngayTraThucTe) > new Date(receipt.ngayHenTra) ? 'Trả trễ' : 'Đã trả') 
                         : 'Chưa trả') }}
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
            <div v-if="filteredReceipts.length === 0" class="text-center py-8 text-sm text-slate-400 font-medium">
              Không tìm thấy phiếu mượn phù hợp với bộ lọc.
            </div>
          </div>
          
          <div v-else class="text-center py-8 text-sm text-slate-400 font-medium">
            Bạn chưa thực hiện phiếu mượn sách nào.
          </div>
        </div>

        <!-- Thống kê tài chính cá nhân -->
        <div v-show="activeTab === 'financial'" class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 class="font-serif text-xl font-bold text-slate-800 border-b pb-2 flex items-center">
            <Banknote class="h-5 w-5 mr-2 text-green-600" /> Thống Kê Tài Chính Cá Nhân
          </h2>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <!-- Tiền mượn sách đã trả -->
            <div class="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-2xl p-4 space-y-0.5">
              <span class="text-[10px] text-blue-400 uppercase font-bold tracking-wider block">Phí mượn sách</span>
              <p class="text-lg font-black text-blue-700">{{ formatCurrency(myFinancials.tongPhiMuon) }}</p>
              <span class="text-[10px] text-slate-400 font-medium">{{ myFinancials.soPhieuDaTra }} phiếu đã trả</span>
            </div>
            <!-- Tiền phạt -->
            <div class="bg-gradient-to-br from-red-50 to-white border border-red-100 rounded-2xl p-4 space-y-0.5">
              <span class="text-[10px] text-red-400 uppercase font-bold tracking-wider block">Tiền phạt</span>
              <p class="text-lg font-black text-red-700">{{ formatCurrency(myFinancials.tongTienPhat) }}</p>
              <span class="text-[10px] text-slate-400 font-medium">Chưa trả: {{ formatCurrency(myFinancials.tienPhatChuaTra) }}</span>
            </div>
            <!-- Tiền cọc đang giữ -->
            <div class="bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-2xl p-4 space-y-0.5">
              <span class="text-[10px] text-amber-400 uppercase font-bold tracking-wider block">Tiền cọc</span>
              <p class="text-lg font-black text-amber-700">{{ formatCurrency(myFinancials.tongTienCoc) }}</p>
              <span class="text-[10px] text-slate-400 font-medium">{{ myFinancials.soPhieuDangMuon }} phiếu đang mượn</span>
            </div>
            <!-- Tiền hội viên -->
            <div class="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl p-4 space-y-0.5">
              <span class="text-[10px] text-indigo-400 uppercase font-bold tracking-wider block">Hội viên</span>
              <p class="text-lg font-black text-indigo-700">{{ formatCurrency(myFinancials.doanhThuHoiVien) }}</p>
              <span class="text-[10px] text-slate-400 font-medium">{{ myFinancials.soGoiDaMua }} gói đã mua</span>
            </div>
            <!-- Tổng chi phí -->
            <div class="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-2xl p-4 space-y-0.5">
              <span class="text-[10px] text-emerald-400 uppercase font-bold tracking-wider block">Tổng đã chi</span>
              <p class="text-lg font-black text-emerald-700">{{ formatCurrency(myFinancials.tongDaChi) }}</p>
              <span class="text-[10px] text-slate-400 font-medium">Phí mượn + phạt đã trả + hội viên</span>
            </div>
          </div>
        </div>

        <!-- Penalty Tickets Section -->
        <div v-show="activeTab === 'penalties'" class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
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
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import api from '../services/api';
import { User, Mail, Phone, MapPin, Calendar, Award, BookOpen, AlertTriangle, Banknote } from '@lucide/vue';
import { useToastStore } from '../stores/toast';
import ConfirmModal from '../components/ConfirmModal.vue';

const authStore = useAuthStore();
const toast = useToastStore();
const confirmModal = ref(null);

const activeSub = ref(null);
const receipts = ref([]);
const penalties = ref([]);
const myFinancials = ref({
  tongPhiMuon: 0,
  soPhieuDaTra: 0,
  tongTienPhat: 0,
  tienPhatDaTra: 0,
  tienPhatChuaTra: 0,
  doanhThuHoiVien: 0,
  soGoiDaMua: 0,
  tongTienCoc: 0,
  soPhieuDangMuon: 0,
  tongDaChi: 0
});
const renewLoading = ref(false);
const activeTab = ref('loans');
const borrowSearchQuery = ref('');
const borrowStatusFilter = ref('');
const borrowReturnFilter = ref('');
const borrowTimeFilter = ref('');

const tabs = [
  { label: 'Lịch sử mượn', value: 'loans' },
  { label: 'Tài chính', value: 'financial' },
  { label: 'Phiếu phạt', value: 'penalties' }
];

const profileStats = computed(() => {
  const activeLoans = receipts.value.filter(r => ['DANG_MUON', 'QUA_HAN', 'SAN_SANG'].includes(r.trangThai)).length;
  const overdue = receipts.value.filter(r => r.trangThai === 'QUA_HAN').length;
  const unpaidFine = penalties.value.filter(p => !p.daThanhToan).reduce((sum, p) => sum + (p.soTienPhat || 0), 0);
  return [
    { label: 'Phiếu đang xử lý', value: activeLoans, caption: overdue > 0 ? `${overdue} phiếu quá hạn` : 'Không có quá hạn', tone: overdue > 0 ? 'text-red-600' : 'text-emerald-600' },
    { label: 'Tổng phiếu mượn', value: receipts.value.length, caption: 'Toàn bộ lịch sử', tone: 'text-slate-500' },
    { label: 'Phạt chưa trả', value: formatCurrency(unpaidFine), caption: unpaidFine > 0 ? 'Cần thanh toán' : 'Đã hoàn tất', tone: unpaidFine > 0 ? 'text-red-600' : 'text-emerald-600' },
    { label: 'Tổng đã chi', value: formatCurrency(myFinancials.value.tongDaChi), caption: 'Phí mượn + phạt + hội viên', tone: 'text-primary' }
  ];
});

const hasBorrowFilters = computed(() => {
  return !!(borrowSearchQuery.value.trim() || borrowStatusFilter.value || borrowReturnFilter.value || borrowTimeFilter.value);
});

const isReceiptInTimeRange = (receipt) => {
  if (!borrowTimeFilter.value) return true;
  const borrowedAt = receipt.ngayMuon ? new Date(receipt.ngayMuon) : null;
  if (!borrowedAt || Number.isNaN(borrowedAt.getTime())) return false;

  const now = new Date();
  if (borrowTimeFilter.value === '7d') return borrowedAt >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (borrowTimeFilter.value === '30d') return borrowedAt >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  if (borrowTimeFilter.value === 'this_month') return borrowedAt.getFullYear() === now.getFullYear() && borrowedAt.getMonth() === now.getMonth();
  if (borrowTimeFilter.value === 'this_year') return borrowedAt.getFullYear() === now.getFullYear();
  return true;
};

const receiptMatchesReturnFilter = (receipt) => {
  if (!borrowReturnFilter.value) return true;
  const details = receipt.chiTietMuon || [];
  const hasUnreturned = details.some(item => !item.daTraChua);
  const allReturned = details.length > 0 && details.every(item => item.daTraChua);
  const hasLate = details.some(item => item.daTraChua && item.ngayTraThucTe && new Date(item.ngayTraThucTe) > new Date(receipt.ngayHenTra));

  if (borrowReturnFilter.value === 'has_unreturned') return hasUnreturned;
  if (borrowReturnFilter.value === 'all_returned') return allReturned;
  if (borrowReturnFilter.value === 'has_late') return hasLate;
  return true;
};

const filteredReceipts = computed(() => {
  const keyword = borrowSearchQuery.value.trim().toLowerCase();
  return receipts.value.filter((receipt) => {
    const matchStatus = !borrowStatusFilter.value || receipt.trangThai === borrowStatusFilter.value;
    const matchTime = isReceiptInTimeRange(receipt);
    const matchReturn = receiptMatchesReturnFilter(receipt);
    let matchKeyword = true;

    if (keyword) {
      const books = (receipt.chiTietMuon || []).map(item => [
        item.sach?.dauSach?.tenSach,
        item.sach?.maSach,
        item.sach?.viTriKe
      ].filter(Boolean).join(' ')).join(' ');
      const searchable = [receipt.maPhieu, books].filter(Boolean).join(' ').toLowerCase();
      matchKeyword = searchable.includes(keyword);
    }

    return matchStatus && matchTime && matchReturn && matchKeyword;
  });
});

const resetBorrowFilters = () => {
  borrowSearchQuery.value = '';
  borrowStatusFilter.value = '';
  borrowReturnFilter.value = '';
  borrowTimeFilter.value = '';
};

const cancelSubscription = async () => {
  const ok = await confirmModal.value.ask({
    title: 'Xác nhận hủy tự động gia hạn',
    message: 'Bạn có chắc chắn muốn hủy tự động gia hạn cho gói dịch vụ này? Gói vẫn sẽ hoạt động cho đến ngày hết hạn và không tự động trừ tiền kỳ tiếp theo.',
    confirmText: 'Hủy gia hạn',
    cancelText: 'Quay lại'
  });
  if (!ok) return;

  renewLoading.value = true;
  try {
    const res = await api.post('/memberships/cancel-auto-renew');
    if (res.success) {
      toast.show('Đã hủy tự động gia hạn thành công! Gói hội viên của bạn sẽ hết hạn khi tới hạn.', 'success');
      await loadData();
    }
  } catch (error) {
    toast.show(error.message || 'Có lỗi xảy ra khi hủy gia hạn.', 'error');
  } finally {
    renewLoading.value = false;
  }
};

const enableAutoRenew = async () => {
  const ok = await confirmModal.value.ask({
    title: 'Bật lại tự động gia hạn',
    message: 'Bạn muốn bật lại tự động gia hạn cho gói hội viên hiện tại? Hệ thống sẽ dùng thông tin thẻ đã lưu để gia hạn khi đến hạn.',
    confirmText: 'Bật lại',
    cancelText: 'Quay lại'
  });
  if (!ok) return;

  renewLoading.value = true;
  try {
    const res = await api.post('/memberships/enable-auto-renew');
    if (res.success) {
      toast.show('Đã bật lại tự động gia hạn thành công!', 'success');
      await loadData();
    }
  } catch (error) {
    toast.show(error.message || 'Có lỗi xảy ra khi bật lại tự động gia hạn.', 'error');
  } finally {
    renewLoading.value = false;
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
    'CHO_DUYET': 'Chờ duyệt',
    'SAN_SANG': 'Sẵn sàng lấy sách',
    'DANG_MUON': 'Đang mượn',
    'DA_TRA': 'Đã trả sách',
    'QUA_HAN': 'Quá hạn trả',
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

const payPenalty = async (ticket) => {
  const ok = await confirmModal.value.ask({
    title: 'Xác nhận thanh toán phạt',
    message: `Bạn muốn thực hiện mô phỏng thanh toán số tiền ${formatCurrency(ticket.soTienPhat)} cho phiếu phạt ${ticket.maPhieuPhat}?`,
    confirmText: 'Mô phỏng thanh toán',
    cancelText: 'Hủy bỏ'
  });
  if (!ok) return;

  try {
    const res = await api.post(`/borrowing/penalties/${ticket._id}/pay`);
    if (res.success) {
      toast.show('Thanh toán tiền phạt thành công!', 'success');
      loadData();
    }
  } catch (error) {
    toast.show(error.message || 'Lỗi khi thanh toán phạt', 'error');
  }
};

const loadData = async () => {
  try {
    const [subRes, receiptRes, penaltyRes, financialRes] = await Promise.all([
      api.get('/memberships/my-subscriptions'),
      api.get('/borrowing/my-receipts'),
      api.get('/borrowing/my-penalties'),
      api.get('/borrowing/my-financial-stats')
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
    if (financialRes.success) {
      myFinancials.value = financialRes.data;
    }
  } catch (error) {
    console.error('Profile load error:', error);
  }
};

onMounted(() => {
  loadData();
});
</script>
