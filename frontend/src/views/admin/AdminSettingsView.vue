<template>
  <div class="space-y-12">
    <!-- Tab selector -->
    <div class="flex bg-white p-1 rounded-2xl border border-slate-200 w-full sm:w-80 shadow-sm">
      <button 
        @click="activeTab = 'plans'"
        class="flex-1 text-center py-2 text-xs font-bold rounded-xl transition-all"
        :class="activeTab === 'plans' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'"
      >
        Gói hội viên
      </button>
      <button 
        @click="activeTab = 'discounts'"
        class="flex-1 text-center py-2 text-xs font-bold rounded-xl transition-all"
        :class="activeTab === 'discounts' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'"
      >
        Mã giảm giá
      </button>
    </div>

    <!-- ==================== GÓI HỘI VIÊN ==================== -->
    <section v-if="activeTab === 'plans'" class="space-y-6">
      <div class="flex justify-between items-center border-b pb-3">
        <div>
          <h2 class="font-serif text-2xl font-bold text-slate-900">Quản Lý Gói Hội Viên</h2>
          <p class="text-sm text-slate-500 font-medium">Tạo lập, sửa đổi các gói cước độc giả</p>
        </div>
        <button 
          @click="openPlanModal"
          class="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-xl text-xs transition-all shadow-md"
        >
          Thêm gói mới
        </button>
      </div>

      <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <th class="pb-3">Tên gói</th>
              <th class="pb-3">Mã gói</th>
              <th class="pb-3">Giá tiền</th>
              <th class="pb-3">Thời hạn sử dụng</th>
              <th class="pb-3 text-center">Sách tối đa</th>
              <th class="pb-3 text-center">Ngày mượn tối đa</th>
              <th class="pb-3 text-center">Miễn cọc sách</th>
              <th class="pb-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50 text-sm font-medium text-slate-700">
            <tr v-for="plan in plans" :key="plan._id" class="hover:bg-slate-50/55 transition-colors">
              <td class="py-4 font-bold text-slate-950">{{ plan.tenGoi }}</td>
              <td class="py-4 font-mono text-xs text-slate-400">{{ plan.maGoi }}</td>
              <td class="py-4">{{ formatCurrency(plan.giaTien) }}</td>
              <td class="py-4">{{ plan.soNgayHieuLuc }} ngày</td>
              <td class="py-4 text-center font-bold text-slate-800">{{ plan.soSachToiDa }} cuốn</td>
              <td class="py-4 text-center font-bold text-slate-800">{{ plan.soNgayMuonToiDa }} ngày</td>
              <td class="py-4 text-center">
                <span class="text-xs font-bold" :class="plan.mienTienCoc ? 'text-green-600' : 'text-slate-400'">
                  {{ plan.mienTienCoc ? 'Có' : 'Không' }}
                </span>
              </td>
              <td class="py-4 text-right space-x-2">
                <button @click="editPlan(plan)" class="text-xs font-bold text-primary hover:underline">Sửa</button>
                <button @click="deletePlan(plan._id)" class="text-xs font-bold text-red-600 hover:text-red-800 transition-colors">Xóa</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- ==================== MÃ GIẢM GIÁ ==================== -->
    <section v-if="activeTab === 'discounts'" class="space-y-6">
      <div class="flex justify-between items-center border-b pb-3">
        <div>
          <h2 class="font-serif text-2xl font-bold text-slate-900">Quản Lý Mã Giảm Giá</h2>
          <p class="text-sm text-slate-500 font-medium">Cấu hình mã khuyến mãi cho phí mượn sách</p>
        </div>
        <button 
          @click="openDiscountModal"
          class="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-xl text-xs transition-all shadow-md"
        >
          Tạo mã mới
        </button>
      </div>

      <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <th class="pb-3">Mã Code</th>
              <th class="pb-3">Tên chiến dịch</th>
              <th class="pb-3">Giá trị giảm</th>
              <th class="pb-3">Đơn tối thiểu</th>
              <th class="pb-3">Số lượng tối đa</th>
              <th class="pb-3">Đã dùng</th>
              <th class="pb-3">Hạn sử dụng</th>
              <th class="pb-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50 text-sm font-medium text-slate-700">
            <tr v-for="code in discounts" :key="code._id" class="hover:bg-slate-50/55 transition-colors">
              <td class="py-4 font-mono font-bold text-slate-950 uppercase">{{ code.maCode }}</td>
              <td class="py-4">{{ code.tenKhuyenMai }}</td>
              <td class="py-4 text-green-600 font-bold">- {{ formatCurrency(code.giaTriGiam) }}</td>
              <td class="py-4">{{ formatCurrency(code.giaTriDonToiThieu) }}</td>
              <td class="py-4 text-center">{{ code.soLuongMaToiDa }}</td>
              <td class="py-4 text-center font-bold">{{ code.soLuotDaDung }}</td>
              <td class="py-4 text-xs text-slate-500">
                {{ formatDate(code.ngayBatDau) }} - {{ formatDate(code.ngayKetThuc) }}
              </td>
              <td class="py-4 text-right space-x-2">
                <button @click="editDiscount(code)" class="text-xs font-bold text-primary hover:underline">Sửa</button>
                <button @click="deleteDiscount(code._id)" class="text-xs font-bold text-red-600 hover:text-red-800 transition-colors">Xóa</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Plans Modal -->
    <div v-if="showPlanModal" class="fixed inset-0 bg-slate-900 bg-opacity-65 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button @click="showPlanModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X class="h-6 w-6" />
        </button>

        <h2 class="font-serif text-xl font-bold text-slate-900 border-b pb-2">
          {{ isPlanEdit ? 'SỬA GÓI HỘI VIÊN' : 'THÊM GÓI HỘI VIÊN MỚI' }}
        </h2>

        <form class="space-y-4 text-sm" @submit.prevent="savePlan">
          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-600 uppercase">Tên gói</label>
            <input v-model="planForm.tenGoi" type="text" required placeholder="Gói VIP Mới" class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-600 uppercase">Giá tiền (VND)</label>
              <input v-model="planForm.giaTien" type="number" required placeholder="99000" class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" />
            </div>
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-600 uppercase">Thời hạn (ngày)</label>
              <input v-model="planForm.soNgayHieuLuc" type="number" required placeholder="30" class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-600 uppercase">Sách mượn tối đa</label>
              <input v-model="planForm.soSachToiDa" type="number" required placeholder="10" class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" />
            </div>
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-600 uppercase">Ngày mượn tối đa</label>
              <input v-model="planForm.soNgayMuonToiDa" type="number" required placeholder="30" class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" />
            </div>
          </div>

          <div class="flex items-center space-x-2 pt-2">
            <input type="checkbox" v-model="planForm.mienTienCoc" id="mienTienCoc" class="h-4 w-4 rounded text-primary focus:ring-primary" />
            <label for="mienTienCoc" class="text-xs font-bold text-slate-600 uppercase">Miễn tiền đặt cọc sách</label>
          </div>

          <button type="submit" class="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition-all shadow-md">
            Lưu gói
          </button>
        </form>
      </div>
    </div>

    <!-- Discounts Modal -->
    <div v-if="showDiscountModal" class="fixed inset-0 bg-slate-900 bg-opacity-65 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button @click="showDiscountModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X class="h-6 w-6" />
        </button>

        <h2 class="font-serif text-xl font-bold text-slate-900 border-b pb-2">
          {{ isDiscountEdit ? 'SỬA MÃ GIẢM GIÁ' : 'TẠO MÃ GIẢM GIÁ MỚI' }}
        </h2>

        <form class="space-y-4 text-sm" @submit.prevent="saveDiscount">
          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-600 uppercase">Mã code</label>
            <input v-model="discountForm.maCode" type="text" :disabled="isDiscountEdit" required placeholder="KM2026..." class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none uppercase" />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-600 uppercase">Tên khuyến mại</label>
            <input v-model="discountForm.tenKhuyenMai" type="text" required placeholder="Giảm giá mượn hè" class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-600 uppercase">Số tiền giảm (VND)</label>
              <input v-model="discountForm.giaTriGiam" type="number" required placeholder="10000" class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" />
            </div>
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-600 uppercase">Số lượng mã tối đa</label>
              <input v-model="discountForm.soLuongMaToiDa" type="number" required placeholder="100" class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" />
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-600 uppercase">Đơn tối thiểu áp dụng (VND)</label>
            <input v-model="discountForm.giaTriDonToiThieu" type="number" required placeholder="50000" class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-600 uppercase">Ngày bắt đầu</label>
              <input v-model="discountForm.ngayBatDau" type="date" required class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" />
            </div>
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-600 uppercase">Ngày kết thúc</label>
              <input v-model="discountForm.ngayKetThuc" type="date" required class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" />
            </div>
          </div>

          <button type="submit" class="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition-all shadow-md">
            Lưu mã giảm
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../services/api';
import { X } from '@lucide/vue';

const activeTab = ref('plans');
const plans = ref([]);
const discounts = ref([]);

const showPlanModal = ref(false);
const isPlanEdit = ref(false);
const planEditId = ref(null);
const planForm = ref({
  tenGoi: '',
  giaTien: 0,
  soNgayHieuLuc: 30,
  soSachToiDa: 10,
  soNgayMuonToiDa: 30,
  mienTienCoc: true
});

const showDiscountModal = ref(false);
const isDiscountEdit = ref(false);
const discountEditId = ref(null);
const discountForm = ref({
  maCode: '',
  tenKhuyenMai: '',
  giaTriGiam: 10000,
  giaTriDonToiThieu: 50000,
  soLuongMaToiDa: 100,
  ngayBatDau: '',
  ngayKetThuc: ''
});

const formatCurrency = (val) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

const fetchPlans = async () => {
  try {
    const res = await api.get('/memberships/plans');
    if (res.success) plans.value = res.data;
  } catch (error) {
    console.error('Fetch plans settings error:', error);
  }
};

const fetchDiscounts = async () => {
  try {
    const res = await api.get('/discounts');
    if (res.success) discounts.value = res.data;
  } catch (error) {
    console.error('Fetch discounts settings error:', error);
  }
};

// Plan Operations
const openPlanModal = () => {
  isPlanEdit.value = false;
  planEditId.value = null;
  planForm.value = { tenGoi: '', giaTien: 99000, soNgayHieuLuc: 30, soSachToiDa: 10, soNgayMuonToiDa: 30, mienTienCoc: true };
  showPlanModal.value = true;
};

const editPlan = (plan) => {
  isPlanEdit.value = true;
  planEditId.value = plan._id;
  planForm.value = { ...plan };
  showPlanModal.value = true;
};

const savePlan = async () => {
  try {
    if (isPlanEdit.value) {
      await api.put(`/memberships/plans/${planEditId.value}`, planForm.value);
    } else {
      await api.post('/memberships/plans', planForm.value);
    }
    showPlanModal.value = false;
    fetchPlans();
  } catch (error) {
    alert(error.message);
  }
};

const deletePlan = async (id) => {
  if (!confirm('Bạn có chắc muốn xóa gói này?')) return;
  try {
    await api.delete(`/memberships/plans/${id}`);
    fetchPlans();
  } catch (error) {
    alert(error.message);
  }
};

// Discount Operations
const openDiscountModal = () => {
  isDiscountEdit.value = false;
  discountEditId.value = null;
  discountForm.value = {
    maCode: '',
    tenKhuyenMai: '',
    giaTriGiam: 10000,
    giaTriDonToiThieu: 50000,
    soLuongMaToiDa: 100,
    ngayBatDau: new Date().toISOString().split('T')[0],
    ngayKetThuc: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  };
  showDiscountModal.value = true;
};

const editDiscount = (code) => {
  isDiscountEdit.value = true;
  discountEditId.value = code._id;
  discountForm.value = {
    ...code,
    ngayBatDau: new Date(code.ngayBatDau).toISOString().split('T')[0],
    ngayKetThuc: new Date(code.ngayKetThuc).toISOString().split('T')[0]
  };
  showDiscountModal.value = true;
};

const saveDiscount = async () => {
  try {
    if (isDiscountEdit.value) {
      await api.put(`/discounts/${discountEditId.value}`, discountForm.value);
    } else {
      await api.post('/discounts', discountForm.value);
    }
    showDiscountModal.value = false;
    fetchDiscounts();
  } catch (error) {
    alert(error.message);
  }
};

const deleteDiscount = async (id) => {
  if (!confirm('Bạn có chắc muốn xóa mã giảm giá này?')) return;
  try {
    await api.delete(`/discounts/${id}`);
    fetchDiscounts();
  } catch (error) {
    alert(error.message);
  }
};

onMounted(() => {
  fetchPlans();
  fetchDiscounts();
});
</script>
