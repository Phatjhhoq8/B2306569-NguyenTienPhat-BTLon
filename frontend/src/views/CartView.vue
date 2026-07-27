<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
    <h1 class="font-serif text-3xl font-bold text-slate-900 border-b pb-3">Giỏ Mượn Sách</h1>

    <div v-if="cartStore.isEmpty" class="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
      <ShoppingBag class="h-16 w-16 mx-auto text-slate-300" />
      <p class="text-slate-400 font-medium">Giỏ mượn sách của bạn đang trống.</p>
      <router-link to="/books" class="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-6 rounded-lg text-sm transition-all inline-block shadow-md">
        Khám phá sách ngay
      </router-link>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Left: Cart Items List (7/12) -->
      <div class="lg:col-span-7 space-y-4">
        <div 
          v-for="book in cartStore.items" 
          :key="book._id"
          class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex space-x-4 items-center relative group"
        >
          <!-- Cover -->
          <div class="h-20 w-14 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
            <img :src="getImageUrl(book.hinhAnh)" :alt="book.tenSach" class="h-full w-full object-cover" />
          </div>

          <!-- Info -->
          <div class="flex-grow min-w-0 space-y-1">
            <h3 class="font-bold text-sm text-slate-800 truncate">{{ book.tenSach }}</h3>
            <p class="text-xs text-slate-500 truncate">Tác giả: {{ book.tacGia?.map(t => t.tenTacGia).join(', ') }}</p>
            <p class="text-xs font-bold text-slate-700">Giá gốc / Thuê: {{ formatCurrency(book.giaBia) }} <span class="text-slate-300 font-normal">/</span> <span class="text-primary">{{ formatCurrency(book.giaBia * 0.02) }}</span></p>
          </div>

          <!-- Actions -->
          <button 
            @click="confirmRemove(book)"
            class="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-all"
            title="Xóa khỏi giỏ"
          >
            <Trash2 class="h-5 w-5" />
          </button>
        </div>
      </div>

      <!-- Right: Borrow details & Checkout Panel (5/12) -->
      <aside class="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
        <h2 class="font-serif text-xl font-bold text-slate-900 border-b pb-2">Thông tin mượn</h2>

        <!-- Date Picker -->
        <div class="space-y-1">
          <label class="text-xs font-semibold text-slate-600 uppercase flex items-center">
            <Calendar class="h-4 w-4 mr-1 text-primary" /> Ngày hẹn trả sách
          </label>
          <input 
            v-model="ngayHenTra" 
            type="date" 
            required 
            :min="minDate"
            :max="maxDate"
            class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none text-sm font-medium"
          />
          <span class="text-[10px] text-slate-400 block">
            Gói hội viên của bạn cho phép mượn tối đa {{ maxBorrowDays }} ngày.
          </span>
        </div>

        <!-- Coupon code -->
        <div class="space-y-2">
          <label class="text-xs font-semibold text-slate-600 uppercase">Mã giảm giá (nếu có)</label>
          <div class="flex space-x-2">
            <input 
              v-model="couponCode" 
              type="text" 
              placeholder="KM2026..." 
              class="flex-grow bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none text-sm font-medium uppercase"
            />
            <button 
              @click="applyCoupon"
              class="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-4 py-2 text-xs rounded-xl transition-colors"
            >
              Áp dụng
            </button>
          </div>
          <!-- Coupon status msg -->
          <p v-if="couponMsg" class="text-xs font-medium" :class="couponSuccess ? 'text-green-600' : 'text-red-600'">
            {{ couponMsg }}
          </p>
        </div>

        <hr class="border-slate-100" />

        <!-- Price breakdowns -->
        <div class="space-y-3 text-sm font-semibold">
          <div class="flex justify-between text-slate-600">
            <span>Phí mượn tạm tính</span>
            <span>{{ formatCurrency(phiMuon) }}</span>
          </div>
          <div class="flex justify-between text-green-600">
            <span>Số tiền được giảm</span>
            <span>- {{ formatCurrency(soTienGiam) }}</span>
          </div>
          <hr class="border-slate-100" />
          <div class="flex justify-between text-lg text-slate-900 font-black">
            <span>Tổng thanh toán</span>
            <span>{{ formatCurrency(tongTienThanhToan) }}</span>
          </div>
        </div>

        <button 
          @click="submitBorrowRequest"
          :disabled="submitting"
          class="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <span v-if="submitting">Đang xử lý đăng ký...</span>
          <span v-else>Đăng ký mượn ngay</span>
        </button>
      </aside>
    </div>
    <!-- Custom Confirm Dialog -->
    <ConfirmModal ref="confirmModal" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart';
import { useAuthStore } from '../stores/auth';
import api from '../services/api';
import { ShoppingBag, Trash2, Calendar } from '@lucide/vue';
import { useToastStore } from '../stores/toast';
import ConfirmModal from '../components/ConfirmModal.vue';

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();
const toast = useToastStore();
const confirmModal = ref(null);

const ngayHenTra = ref('');
const couponCode = ref('');
const couponSuccess = ref(false);
const couponMsg = ref('');
const discountInfo = ref(null);
const submitting = ref(false);

const getImageUrl = (path) => {
  if (!path) return '/placeholder_book.png';
  if (path.startsWith('http') || path.startsWith('data:image')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `http://localhost:3000${cleanPath}`;
};

const formatCurrency = (val) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
};

// Phí mượn tạm tính = 2% giá trị bìa sách
const phiMuon = computed(() => {
  return cartStore.items.reduce((acc, item) => acc + (item.giaBia * 0.02), 0);
});

const soTienGiam = computed(() => {
  if (!discountInfo.value) return 0;
  return discountInfo.value.giaTriGiam || 0;
});

const tongTienThanhToan = computed(() => {
  const total = phiMuon.value - soTienGiam.value;
  return total < 0 ? 0 : total;
});

// Giới hạn ngày mượn tối đa theo Membership Plan
const maxBorrowDays = computed(() => {
  return authStore.user?.subscriptionPlan?.soNgayMuonToiDa || 14;
});

const minDate = computed(() => {
  const today = new Date();
  today.setDate(today.getDate() + 1); // Trả ít nhất ngày mai
  return today.toISOString().split('T')[0];
});

const maxDate = computed(() => {
  const max = new Date();
  max.setDate(max.getDate() + maxBorrowDays.value);
  return max.toISOString().split('T')[0];
});

const applyCoupon = async () => {
  couponMsg.value = '';
  couponSuccess.value = false;
  discountInfo.value = null;

  if (!couponCode.value.trim()) return;

  try {
    const res = await api.post('/discounts/validate', {
      code: couponCode.value.trim().toUpperCase(),
      orderAmount: phiMuon.value
    });
    if (res.success) {
      discountInfo.value = res.data;
      couponSuccess.value = true;
      couponMsg.value = `Áp dụng mã giảm giá thành công! Giảm ${formatCurrency(res.data.giaTriGiam)}`;
    }
  } catch (error) {
    couponMsg.value = error.message || 'Mã giảm giá không hợp lệ.';
  }
};

const confirmRemove = async (book) => {
  const ok = await confirmModal.value.ask({
    title: 'Xóa sách khỏi giỏ',
    message: `Bạn có chắc chắn muốn xóa cuốn sách "${book.tenSach}" ra khỏi giỏ mượn không?`,
    confirmText: 'Xóa bỏ',
    cancelText: 'Hủy'
  });
  if (ok) {
    cartStore.removeBook(book._id);
    toast.show('Đã xóa sách khỏi giỏ mượn.', 'success');
  }
};

const submitBorrowRequest = async () => {
  if (!ngayHenTra.value) {
    toast.show('Vui lòng chọn ngày hẹn trả sách!', 'warning');
    return;
  }

  const ok = await confirmModal.value.ask({
    title: 'Xác nhận đăng ký mượn',
    message: `Bạn có chắc chắn muốn đăng ký mượn ${cartStore.totalItems} cuốn sách này không? Tổng chi phí mượn là ${formatCurrency(tongTienThanhToan.value)}.`,
    confirmText: 'Đăng ký',
    cancelText: 'Quay lại'
  });
  if (!ok) return;
  
  submitting.value = true;
  try {
    // Chi tiết mượn sách ánh xạ danh sách id bản sao
    // Do hệ thống tự tìm bản sao khả dụng ở backend, chúng ta chỉ cần gửi ID đầu sách (BookTitle ID)
    const chiTietMuon = cartStore.items.map(item => ({
      sach: item._id, // Gửi book title ID
      soLuong: 1
    }));

    const payload = {
      chiTietMuon,
      ngayHenTra: ngayHenTra.value,
      phiMuon: phiMuon.value,
      soTienGiam: soTienGiam.value,
      tongTienThanhToan: tongTienThanhToan.value
    };

    const res = await api.post('/borrowing/receipts', payload);
    if (res.success) {
      toast.show('Đăng ký phiếu mượn sách thành công! Vui lòng đến thư viện nhận sách.', 'success');
      cartStore.clearCart();
      router.push('/profile');
    }
  } catch (error) {
    toast.show(error.message || 'Gặp lỗi trong quá trình tạo phiếu mượn.', 'error');
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  // Set default ngày hẹn trả = 14 ngày sau
  const defDate = new Date();
  defDate.setDate(defDate.getDate() + 14);
  ngayHenTra.value = defDate.toISOString().split('T')[0];
});
</script>
