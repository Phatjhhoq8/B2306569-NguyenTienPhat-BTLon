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
        <!-- Select All Checkbox Card -->
        <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
          <label class="flex items-center space-x-3 cursor-pointer select-none">
            <input 
              type="checkbox" 
              :checked="isAllSelected" 
              @change="toggleSelectAll" 
              class="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4 transition-all"
            />
            <span class="text-xs font-bold text-slate-700">Chọn tất cả ({{ cartStore.items.length }} đầu sách / {{ cartStore.totalItems }} bản)</span>
          </label>
          <button 
            v-if="selectedBookIds.length > 0" 
            @click="confirmRemoveSelected" 
            class="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded-lg transition-all"
          >
            <Trash2 class="h-4 w-4" /> Xóa mục đã chọn
          </button>
        </div>

        <div 
          v-for="book in cartStore.items" 
          :key="book._id"
          class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex space-x-4 items-center relative group"
        >
          <!-- Checkbox -->
          <input 
            type="checkbox" 
            :value="book._id" 
            v-model="selectedBookIds" 
            class="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4 cursor-pointer transition-all"
          />

          <!-- Cover -->
          <div class="h-20 w-14 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
            <img :src="getImageUrl(book.hinhAnh)" :alt="book.tenSach" class="h-full w-full object-cover" />
          </div>

          <!-- Info -->
          <div class="flex-grow min-w-0 space-y-1">
            <h3 class="font-bold text-sm text-slate-800 truncate">{{ book.tenSach }}</h3>
            <p class="text-xs text-slate-500 truncate">Tác giả: {{ book.tacGia?.map(t => t.tenTacGia).join(', ') }}</p>
            <p class="text-[11px] font-bold text-slate-750 flex flex-wrap gap-x-2 gap-y-1 items-center">
              <span>Giá gốc: {{ formatCurrency(book.giaBia) }}</span>
              <span class="text-slate-300">|</span>
              <span>Phí mượn: <span class="text-emerald-600 font-extrabold">{{ getBookBorrowFee(book, authStore.user?.subscriptionPlan) > 0 ? formatCurrency(getBookBorrowFee(book, authStore.user?.subscriptionPlan)) : 'Miễn phí' }}</span></span>
              <span class="text-slate-300">|</span>
              <span>Phạt trễ: <span class="text-red-655 font-extrabold">{{ formatCurrency(getBookOverdueFee(authStore.user?.subscriptionPlan)) }}/ngày</span></span>
            </p>
            <div class="flex items-center gap-2 pt-1">
              <span class="text-[10px] font-bold text-slate-500 uppercase">Số lượng</span>
              <div class="inline-flex items-center rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                <button
                  @click="changeQuantity(book, -1)"
                  :disabled="(book.soLuongMuon || 1) <= 1"
                  class="h-7 w-7 text-xs font-black text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >-</button>
                <input
                  :value="book.soLuongMuon || 1"
                  type="number"
                  min="1"
                  :max="book.soLuongKhaDung || 1"
                  @input="setQuantity(book, $event.target.value)"
                  class="h-7 w-12 bg-white border-x border-slate-200 text-center text-xs font-extrabold text-slate-800 focus:outline-none"
                />
                <button
                  @click="changeQuantity(book, 1)"
                  :disabled="(book.soLuongMuon || 1) >= (book.soLuongKhaDung || 1)"
                  class="h-7 w-7 text-xs font-black text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >+</button>
              </div>
              <span class="text-[10px] font-semibold text-slate-400">Còn {{ book.soLuongKhaDung || 1 }} bản</span>
            </div>
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
            <span>Phí mượn tạm tính ({{ selectedCopiesCount }} bản)</span>
            <span>{{ formatCurrency(phiMuon) }}</span>
          </div>
          <div class="flex justify-between text-slate-600">
            <span>Tiền đặt cọc tạm tính</span>
            <span :class="tienCoc === 0 ? 'text-emerald-600 font-extrabold' : ''">{{ tienCoc > 0 ? formatCurrency(tienCoc) : 'Miễn cọc' }}</span>
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
const selectedBookIds = ref([]); // ID của các sách được chọn mượn

const getImageUrl = (path) => {
  if (!path) return '/placeholder_book.png';
  if (path.startsWith('http') || path.startsWith('data:image')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `http://localhost:3000${cleanPath}`;
};

const formatCurrency = (val) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
};

const formatBorrowDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const getBookBorrowFee = (book, plan) => {
  if (!plan) return 5000;
  
  // Nhận diện Giáo trình
  const name = (book.tenSach || '').toLowerCase();
  const categoryName = (book.theLoai?.tenTheLoai || book.theLoai || '').toString().toLowerCase();
  const isGiaoTrinh = categoryName.includes('giáo dục') || 
                       categoryName.includes('ngoại ngữ') || 
                       categoryName.includes('khoa học') ||
                       name.includes('giáo trình') || 
                       name.includes('bài tập') ||
                       name.includes('sách giáo khoa') ||
                       name.includes('tài liệu học tập');
                       
  if (isGiaoTrinh) return 0;
  return plan.phiMuonSachGiay !== undefined ? plan.phiMuonSachGiay : 5000;
};

const getBookOverdueFee = (plan) => {
  if (!plan) return 5000;
  return plan.phiPhatTreHan !== undefined ? plan.phiPhatTreHan : 5000;
};

const getBorrowQuantity = (item) => Math.max(1, Number(item.soLuongMuon) || 1);

// Tính số ngày mượn thực tế
const borrowDaysCount = computed(() => {
  if (!ngayHenTra.value) return 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const returnD = new Date(ngayHenTra.value);
  returnD.setHours(0, 0, 0, 0);
  const diffTime = returnD.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
});

const phiMuon = computed(() => {
  const selectedItems = cartStore.items.filter(item => selectedBookIds.value.includes(item._id));
  const baseFee = selectedItems.reduce((sum, item) => sum + getBookBorrowFee(item, authStore.user?.subscriptionPlan) * getBorrowQuantity(item), 0);
  return baseFee * borrowDaysCount.value;
});

const selectedCopiesCount = computed(() => {
  return cartStore.items
    .filter(item => selectedBookIds.value.includes(item._id))
    .reduce((sum, item) => sum + getBorrowQuantity(item), 0);
});

const tienCoc = computed(() => {
  const selectedItems = cartStore.items.filter(item => selectedBookIds.value.includes(item._id));
  if (selectedItems.length === 0) return 0;
  if (!authStore.user || !authStore.user.subscriptionPlan) return 100000;
  return authStore.user.subscriptionPlan.tienDatCoc !== undefined ? authStore.user.subscriptionPlan.tienDatCoc : 0;
});

const soTienGiam = computed(() => {
  if (!discountInfo.value) return 0;
  return discountInfo.value.discountAmount || 0;
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

const isAllSelected = computed(() => {
  return cartStore.items.length > 0 && selectedBookIds.value.length === cartStore.items.length;
});

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedBookIds.value = [];
  } else {
    selectedBookIds.value = cartStore.items.map(item => item._id);
  }
};

const setQuantity = (book, value) => {
  cartStore.updateQuantity(book._id, value);
};

const changeQuantity = (book, delta) => {
  cartStore.updateQuantity(book._id, getBorrowQuantity(book) + delta);
};

const confirmRemoveSelected = async () => {
  const ok = await confirmModal.value.ask({
    title: 'Xóa sách đã chọn',
    message: `Bạn có chắc chắn muốn xóa ${selectedBookIds.value.length} cuốn sách đã chọn ra khỏi giỏ mượn không?`,
    confirmText: 'Xóa bỏ',
    cancelText: 'Hủy'
  });
  if (ok) {
    selectedBookIds.value.forEach(id => {
      cartStore.removeBook(id);
    });
    selectedBookIds.value = [];
    toast.show('Đã xóa các sách đã chọn khỏi giỏ mượn.', 'success');
  }
};

const applyCoupon = async () => {
  couponMsg.value = '';
  couponSuccess.value = false;
  discountInfo.value = null;

  if (!couponCode.value.trim()) return;

  try {
    const res = await api.post('/discounts/validate', {
      code: couponCode.value.trim().toUpperCase(),
      orderAmount: phiMuon.value,
      apDungCho: 'MUON_SACH'
    });
    if (res.success) {
      discountInfo.value = res.data;
      couponSuccess.value = true;
      couponMsg.value = `Áp dụng mã giảm giá thành công! Giảm ${formatCurrency(res.data.discountAmount)}`;
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
    selectedBookIds.value = selectedBookIds.value.filter(id => id !== book._id);
    toast.show('Đã xóa sách khỏi giỏ mượn.', 'success');
  }
};

const submitBorrowRequest = async () => {
  if (selectedBookIds.value.length === 0) {
    toast.show('Vui lòng chọn ít nhất một cuốn sách để mượn!', 'warning');
    return;
  }
  if (!ngayHenTra.value) {
    toast.show('Vui lòng chọn ngày hẹn trả sách!', 'warning');
    return;
  }

  const ok = await confirmModal.value.ask({
    title: 'Xác nhận đăng ký mượn',
    message: `Bạn có chắc chắn muốn đăng ký mượn ${selectedCopiesCount.value} bản sách đã chọn không?\n\nThời gian mượn dự kiến: ${borrowDaysCount.value} ngày, từ ${formatBorrowDate(new Date())} đến ${formatBorrowDate(ngayHenTra.value)}.`,
    confirmText: 'Đăng ký',
    cancelText: 'Quay lại'
  });
  if (!ok) return;
  
  submitting.value = true;
  try {
    const selectedItems = cartStore.items.filter(item => selectedBookIds.value.includes(item._id));
    const chiTietMuon = selectedItems.map(item => ({
      sach: item._id, // Gửi book title ID
      soLuong: item.soLuongMuon || 1
    }));

    const payload = {
      chiTietMuon,
      ngayHenTra: ngayHenTra.value,
      discountCode: couponCode.value.trim().toUpperCase() || undefined,
    };

    const res = await api.post('/borrowing/receipts', payload);
    if (res.success) {
      toast.show('Đăng ký phiếu mượn sách thành công! Vui lòng đến thư viện nhận sách.', 'success');
      // Xóa các sách đã mượn khỏi giỏ
      selectedBookIds.value.forEach(id => {
        cartStore.removeBook(id);
      });
      selectedBookIds.value = [];
      router.push('/profile');
    }
  } catch (error) {
    toast.show(error.message || 'Gặp lỗi trong quá trình tạo phiếu mượn.', 'error');
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  // Mặc định chọn tất cả các sách trong giỏ
  selectedBookIds.value = cartStore.items.map(item => item._id);

  // Set default ngày hẹn trả = số ngày mượn tối đa của gói hội viên
  const defDate = new Date();
  defDate.setDate(defDate.getDate() + maxBorrowDays.value);
  ngayHenTra.value = defDate.toISOString().split('T')[0];
});
</script>
