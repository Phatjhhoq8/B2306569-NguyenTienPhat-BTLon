<template>
  <div class="space-y-8">
    <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b pb-4">
      <div class="space-y-1.5">
        <h1 class="font-sans text-3xl font-extrabold text-slate-900">Thống Kê Tài Chính</h1>
        <p class="text-sm text-slate-500 font-medium">Theo dõi tổng quan doanh thu và chi tiết ai mua gói gì, ai mượn sách gì, phiếu phạt nào đã thu.</p>
      </div>
      <button @click="loadData" class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-xs font-black shadow">
        Làm mới dữ liệu
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="lg:col-span-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-3xl p-6 shadow-sm flex items-center justify-between">
        <div class="space-y-1">
          <span class="text-xs uppercase tracking-wider font-black opacity-80">Tổng doanh thu hệ thống</span>
          <p class="text-4xl font-black">{{ formatCurrency(financials.tongDoanhThu) }}</p>
          <span class="text-xs opacity-80">Không bao gồm tiền phạt chưa thu và tiền cọc đang giữ</span>
        </div>
        <Banknote class="h-14 w-14 opacity-35" />
      </div>
      <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-2">
        <span class="text-xs uppercase tracking-wider font-black text-slate-400">So sánh tháng</span>
        <p class="text-2xl font-black text-slate-900">{{ formatCurrency(financials.comparison?.month?.current || 0) }}</p>
        <span class="text-sm font-bold" :class="getTrendClass(financials.comparison?.month)">
          {{ formatDiff(financials.comparison?.month) }} ({{ formatPercent(financials.comparison?.month?.percent) }})
        </span>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
      <div v-for="item in summaryCards" :key="item.label" class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
        <span class="text-[10px] uppercase tracking-wider font-black" :class="item.tone">{{ item.label }}</span>
        <p class="text-2xl font-black text-slate-900">{{ formatCurrency(item.amount) }}</p>
        <span class="text-[10px] text-slate-500 font-bold">{{ item.caption }}</span>
      </div>
    </div>

    <div class="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-4">
      <div class="flex flex-col xl:flex-row gap-3 xl:items-center justify-between">
        <div class="flex flex-wrap gap-2">
          <button v-for="tab in tabs" :key="tab.value" @click="activeTab = tab.value" class="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all" :class="activeTab === tab.value ? 'bg-primary text-white shadow' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'">
            {{ tab.label }}
          </button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 xl:w-[680px]">
          <input v-model="searchQuery" type="text" placeholder="Tìm độc giả, mã phiếu, tên sách, tên gói..." class="sm:col-span-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary" />
          <select v-model="timeFilter" class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none">
            <option value="">Tất cả thời gian</option>
            <option value="7d">7 ngày gần đây</option>
            <option value="30d">30 ngày gần đây</option>
            <option value="this_month">Tháng này</option>
            <option value="this_year">Năm nay</option>
          </select>
        </div>
      </div>

      <div v-if="activeTab === 'overview'" class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div v-for="item in revenueShare" :key="item.label" class="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-3">
          <div class="flex justify-between text-xs font-black uppercase tracking-wider text-slate-500">
            <span>{{ item.label }}</span>
            <span>{{ item.percent }}%</span>
          </div>
          <div class="h-3 bg-white rounded-full overflow-hidden border border-slate-100">
            <div class="h-full rounded-full" :class="item.bar" :style="{ width: `${item.percent}%` }"></div>
          </div>
          <p class="text-xl font-black text-slate-900">{{ formatCurrency(item.amount) }}</p>
        </div>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-100 text-xs font-black text-slate-400 uppercase tracking-wider">
              <th v-for="col in activeColumns" :key="col" class="pb-3 whitespace-nowrap">{{ col }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50 text-sm font-medium text-slate-700">
            <tr v-for="row in activeRows" :key="row.id" class="hover:bg-slate-50/70">
              <template v-if="activeTab === 'memberships'">
                <td class="py-4 font-black text-slate-900">{{ row.maDangKy }}</td>
                <td class="py-4">{{ row.docGia?.hoTen }}<span class="block text-[10px] text-slate-400">{{ row.docGia?.maDocGia }} · {{ row.docGia?.email }}</span></td>
                <td class="py-4 font-bold">{{ row.goiDocGia?.tenGoi || 'Không rõ' }}</td>
                <td class="py-4 font-black text-indigo-700">{{ formatCurrency(row.tongTien) }}</td>
                <td class="py-4 text-xs">{{ paymentText(row.phuongThucThanhToan) }}</td>
                <td class="py-4"><StatusPill :text="row.tuDongGiaHan ? 'Tự động' : 'Thủ công'" :tone="row.tuDongGiaHan ? 'green' : 'slate'" /></td>
                <td class="py-4 text-xs">{{ formatDate(row.createdAt || row.ngayBatDau) }}</td>
              </template>
              <template v-else-if="activeTab === 'borrows'">
                <td class="py-4 font-black text-slate-900">{{ row.maPhieu }}</td>
                <td class="py-4">{{ row.docGia?.hoTen }}<span class="block text-[10px] text-slate-400">{{ row.docGia?.maDocGia }} · {{ row.docGia?.dienThoai }}</span></td>
                <td class="py-4 min-w-72"><span class="block font-bold text-xs text-slate-700">{{ bookSummary(row.books) }}</span><span class="block text-[10px] text-slate-400">{{ row.soCuon }} cuốn</span></td>
                <td class="py-4 font-black text-blue-700">{{ formatCurrency(row.tongTienThanhToan) }}</td>
                <td class="py-4 text-xs">Cọc {{ formatCurrency(row.tienCoc) }}<span class="block text-slate-400">Giảm {{ formatCurrency(row.soTienGiam) }}</span></td>
                <td class="py-4"><StatusPill :text="receiptStatusText(row.trangThai)" :tone="receiptStatusTone(row.trangThai)" /></td>
                <td class="py-4 text-xs">{{ formatDate(row.ngayMuon) }}</td>
              </template>
              <template v-else>
                <td class="py-4 font-black text-slate-900">{{ row.maPhieuPhat }}</td>
                <td class="py-4">{{ row.docGia?.hoTen || 'Không rõ' }}<span class="block text-[10px] text-slate-400">{{ row.docGia?.maDocGia }} · {{ row.phieuMuon?.maPhieu }}</span></td>
                <td class="py-4 min-w-80 text-xs font-bold">{{ row.lyDoPhat }}</td>
                <td class="py-4 font-black text-red-700">{{ formatCurrency(row.soTienPhat) }}</td>
                <td class="py-4"><StatusPill :text="row.daThanhToan ? 'Đã thu' : 'Chưa thu'" :tone="row.daThanhToan ? 'green' : 'red'" /></td>
                <td class="py-4 text-xs">{{ row.nhanVien?.hoTenNV || 'Hệ thống' }}</td>
                <td class="py-4 text-xs">{{ formatDate(row.ngayLap || row.createdAt) }}</td>
              </template>
            </tr>
          </tbody>
        </table>
        <div v-if="activeRows.length === 0" class="text-center py-10 text-sm text-slate-400 font-bold">Không có dữ liệu phù hợp.</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, ref } from 'vue';
import { Banknote } from '@lucide/vue';
import api from '../../services/api';

const StatusPill = defineComponent({
  props: { text: String, tone: String },
  setup(props) {
    const classes = computed(() => ({
      green: 'bg-green-100 text-green-700',
      red: 'bg-red-100 text-red-700',
      amber: 'bg-amber-100 text-amber-700',
      blue: 'bg-blue-100 text-blue-700',
      slate: 'bg-slate-100 text-slate-600'
    }[props.tone] || 'bg-slate-100 text-slate-600'));
    return () => h('span', { class: `text-[10px] font-black px-2 py-1 rounded-full uppercase whitespace-nowrap ${classes.value}` }, props.text);
  }
});

const activeTab = ref('overview');
const searchQuery = ref('');
const timeFilter = ref('');
const financials = ref({
  tongDoanhThu: 0,
  tongPhiMuon: 0,
  tienPhatDaThu: 0,
  tienPhatChuaThu: 0,
  doanhThuHoiVien: 0,
  tongTienCoc: 0,
  soPhieuDaTra: 0,
  soGoiDaBan: 0,
  soPhieuDangMuon: 0,
  comparison: {},
  details: { membershipPurchases: [], borrowPayments: [], penaltyPayments: [] }
});

const tabs = [
  { label: 'Tổng quan', value: 'overview' },
  { label: 'Hội viên', value: 'memberships' },
  { label: 'Mượn sách', value: 'borrows' },
  { label: 'Phiếu phạt', value: 'penalties' }
];

const summaryCards = computed(() => [
  { label: 'Phí mượn', amount: financials.value.tongPhiMuon, caption: `${financials.value.soPhieuDaTra || 0} phiếu đã trả`, tone: 'text-blue-500' },
  { label: 'Hội viên', amount: financials.value.doanhThuHoiVien, caption: `${financials.value.soGoiDaBan || 0} gói đã bán`, tone: 'text-indigo-500' },
  { label: 'Phạt đã thu', amount: financials.value.tienPhatDaThu, caption: 'Đã ghi nhận thanh toán', tone: 'text-red-500' },
  { label: 'Phạt chưa thu', amount: financials.value.tienPhatChuaThu, caption: 'Công nợ cần theo dõi', tone: 'text-orange-500' },
  { label: 'Cọc đang giữ', amount: financials.value.tongTienCoc, caption: `${financials.value.soPhieuDangMuon || 0} phiếu đang mượn`, tone: 'text-amber-500' }
]);

const revenueShare = computed(() => {
  const total = financials.value.tongDoanhThu || 0;
  const make = (label, amount, bar) => ({ label, amount, bar, percent: total > 0 ? Number(((amount / total) * 100).toFixed(1)) : 0 });
  return [
    make('Hội viên', financials.value.doanhThuHoiVien || 0, 'bg-indigo-500'),
    make('Phí mượn', financials.value.tongPhiMuon || 0, 'bg-blue-500'),
    make('Phạt đã thu', financials.value.tienPhatDaThu || 0, 'bg-red-500')
  ];
});

const activeColumns = computed(() => {
  if (activeTab.value === 'memberships') return ['Mã đăng ký', 'Độc giả', 'Gói mua', 'Số tiền', 'Thanh toán', 'Gia hạn', 'Ngày mua'];
  if (activeTab.value === 'borrows') return ['Mã phiếu', 'Độc giả', 'Sách mượn', 'Tổng thu', 'Cọc/Giảm', 'Trạng thái', 'Ngày mượn'];
  return ['Mã phạt', 'Độc giả', 'Lý do', 'Số tiền', 'Thanh toán', 'Nhân viên', 'Ngày lập'];
});

const getRowDate = (row) => row.createdAt || row.ngayMuon || row.ngayLap || row.ngayBatDau;
const matchTime = (row) => {
  if (!timeFilter.value) return true;
  const date = getRowDate(row) ? new Date(getRowDate(row)) : null;
  if (!date || Number.isNaN(date.getTime())) return false;
  const now = new Date();
  if (timeFilter.value === '7d') return date >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (timeFilter.value === '30d') return date >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  if (timeFilter.value === 'this_month') return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  if (timeFilter.value === 'this_year') return date.getFullYear() === now.getFullYear();
  return true;
};

const searchableText = (row) => JSON.stringify(row || {}).toLowerCase();
const filterRows = (rows) => {
  const q = searchQuery.value.trim().toLowerCase();
  return rows.filter(row => (!q || searchableText(row).includes(q)) && matchTime(row));
};

const activeRows = computed(() => {
  const details = financials.value.details || {};
  if (activeTab.value === 'memberships') return filterRows(details.membershipPurchases || []);
  if (activeTab.value === 'borrows') return filterRows(details.borrowPayments || []);
  if (activeTab.value === 'penalties') return filterRows(details.penaltyPayments || []);
  return [];
});

const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
const formatDate = (value) => value ? new Date(value).toLocaleDateString('vi-VN') : '';
const formatPercent = (value) => `${Number(value || 0) > 0 ? '+' : ''}${Number(value || 0).toFixed(2)}%`;
const formatDiff = (comparison) => `${(comparison?.diff || 0) > 0 ? '+' : ''}${formatCurrency(comparison?.diff || 0)}`;
const getTrendClass = (comparison) => comparison?.trend === 'UP' ? 'text-emerald-600' : (comparison?.trend === 'DOWN' ? 'text-red-600' : 'text-slate-500');
const paymentText = (value) => value === 'THE_TIN_DUNG' ? 'Thẻ tín dụng' : 'VietQR';
const bookSummary = (books = []) => books.map(book => book.tenSach || book.maSach).filter(Boolean).slice(0, 3).join(', ') + (books.length > 3 ? ` +${books.length - 3}` : '');
const receiptStatusText = (status) => ({ CHO_DUYET: 'Chờ duyệt', SAN_SANG: 'Sẵn sàng', DANG_MUON: 'Đang mượn', DA_TRA: 'Đã trả', QUA_HAN: 'Quá hạn', HUY: 'Đã hủy' }[status] || status);
const receiptStatusTone = (status) => ({ DA_TRA: 'green', DANG_MUON: 'blue', QUA_HAN: 'red', SAN_SANG: 'amber', CHO_DUYET: 'slate', HUY: 'slate' }[status] || 'slate');

const loadData = async () => {
  try {
    const res = await api.get('/borrowing/financial-stats');
    if (res.success) financials.value = res.data;
  } catch (error) {
    console.error('Finance load error:', error);
  }
};

onMounted(loadData);
</script>
