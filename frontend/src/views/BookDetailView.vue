<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <div v-if="book" class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      <!-- Cột trái: Thông tin tác phẩm & Bình luận (8/12) -->
      <div class="lg:col-span-8 space-y-8">
        <!-- Main Card -->
        <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-8">
          <div class="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
            <!-- Cover image (5/12) -->
            <div class="md:col-span-5">
              <div class="bg-slate-100 rounded-2xl overflow-hidden shadow-md pt-[135%] relative border border-slate-200">
                <img 
                  :src="getImageUrl(book.hinhAnh)" 
                  :alt="book.tenSach" 
                  class="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>
            
            <!-- Book title & info (7/12) -->
            <div class="md:col-span-7 flex flex-col justify-between space-y-4">
              <div class="space-y-4">
                <span class="bg-primary-light text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide inline-block">
                  {{ book.theLoai?.tenTheLoai }}
                </span>
                <h1 class="font-sans text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
                  {{ book.tenSach }}
                </h1>
                <p class="text-xs text-slate-500 font-bold">
                  Tác giả: <span class="text-slate-800 font-extrabold">{{ book.tacGia?.map(t => t.tenTacGia).join(', ') }}</span>
                </p>
                
                <!-- Ratings -->
                <div class="flex items-center space-x-3 text-xs font-bold">
                  <span class="flex items-center px-2.5 py-1 rounded-lg" :class="book.rating > 0 ? 'text-amber-500 bg-amber-50' : 'text-slate-400 bg-slate-50'">
                    <Star class="h-3.5 w-3.5 mr-1" :class="book.rating > 0 ? 'fill-amber-500 text-amber-550' : 'text-slate-350'" /> {{ book.rating > 0 ? book.rating.toFixed(1) : 'Chưa có đánh giá' }}
                  </span>
                  <span class="text-slate-300">|</span>
                  <span class="text-slate-500">{{ book.soLuotMuon || 0 }} lượt mượn</span>
                </div>
              </div>

              <!-- General Info Small Metadata list -->
              <div class="text-xs space-y-1.5 border-t border-slate-100 pt-4 text-slate-500 font-medium">
                <div>Nhà xuất bản: <span class="text-slate-800 font-bold">{{ book.nhaXuatBan?.tenNXB }}</span></div>
                <div>Năm sản xuất: <span class="text-slate-800 font-bold">{{ book.namSanXuat }}</span></div>
              </div>
            </div>
          </div>
          
          <!-- Specifications (Thông số chi tiết) -->
          <div class="pt-6 border-t border-slate-100 space-y-4">
            <h2 class="font-sans text-base font-extrabold text-slate-900 flex items-center">
              <Layers class="h-4.5 w-4.5 mr-2 text-primary" /> Thông số chi tiết
            </h2>
            
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
              <div class="bg-slate-50 p-2.5 rounded-2xl border border-slate-150 flex flex-col items-center justify-center space-y-1 shadow-sm">
                <BookOpen class="h-5 w-5 text-slate-500" />
                <span class="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Số trang</span>
                <span class="text-xs font-extrabold text-slate-800">{{ (book.tenSach ? book.tenSach.length * 5 + 150 : 250) }} trang</span>
              </div>

              <div class="bg-slate-50 p-2.5 rounded-2xl border border-slate-150 flex flex-col items-center justify-center space-y-1 shadow-sm">
                <Globe class="h-5 w-5 text-slate-500" />
                <span class="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Ngôn ngữ</span>
                <span class="text-xs font-extrabold text-slate-800">Tiếng Việt</span>
              </div>

              <div class="bg-slate-50 p-2.5 rounded-2xl border border-slate-150 flex flex-col items-center justify-center space-y-1 shadow-sm">
                <Layers class="h-5 w-5 text-slate-500" />
                <span class="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Nhà xuất bản</span>
                <span class="text-[10px] font-extrabold text-slate-800 truncate max-w-full px-1">{{ book.nhaXuatBan?.tenNXB || 'CTU Publisher' }}</span>
              </div>

              <div class="bg-slate-50 p-2.5 rounded-2xl border border-slate-150 flex flex-col items-center justify-center space-y-1 shadow-sm">
                <Calendar class="h-5 w-5 text-slate-500" />
                <span class="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Năm sản xuất</span>
                <span class="text-xs font-extrabold text-slate-800">{{ book.namSanXuat || '2022' }}</span>
              </div>

              <div class="bg-slate-50 p-2.5 rounded-2xl border border-slate-150 flex flex-col items-center justify-center space-y-1 shadow-sm">
                <Bookmark class="h-5 w-5 text-slate-500" />
                <span class="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Kích thước</span>
                <span class="text-xs font-extrabold text-slate-800">14.5 x 20.5 cm</span>
              </div>

              <div class="bg-slate-50 p-2.5 rounded-2xl border border-slate-150 flex flex-col items-center justify-center space-y-1 shadow-sm">
                <Bookmark class="h-5 w-5 text-slate-500" />
                <span class="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Hình thức</span>
                <span class="text-xs font-extrabold text-slate-800">Bìa mềm</span>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="pt-6 border-t border-slate-100 space-y-3">
            <h2 class="font-sans text-base font-extrabold text-slate-900 flex items-center">
              <BookOpen class="h-4.5 w-4.5 mr-2 text-primary" /> Mô tả tóm tắt
            </h2>
            <p class="text-slate-600 text-xs leading-relaxed whitespace-pre-line">
              {{ book.moTa || 'Chưa có mô tả tóm tắt cho đầu sách này.' }}
            </p>
          </div>
        </div>

        <!-- Reviews & Comments -->
        <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
          <div class="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 class="font-sans text-base font-extrabold text-slate-900 flex items-center">
              <Star class="h-4.5 w-4.5 mr-2 text-amber-500 fill-amber-500" /> Đánh giá & Bình luận
            </h2>
            <span class="text-xs text-slate-400 font-bold">({{ book.soLuotDanhGia || 0 }} lượt đánh giá)</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <div class="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 pb-5 md:pb-0">
              <span class="text-4xl font-black text-slate-900 leading-none">{{ book.rating > 0 ? book.rating.toFixed(1) : '0.0' }}</span>
              <div class="flex items-center mt-2">
                <Star 
                  v-for="star in 5" 
                  :key="star" 
                  class="h-3.5 w-3.5" 
                  :class="book.rating > 0 && star <= Math.round(book.rating) ? 'text-amber-500 fill-amber-500' : 'text-slate-300'"
                />
              </div>
              <span class="text-[9px] text-slate-400 font-bold mt-2 uppercase tracking-wide">Điểm đánh giá trung bình</span>
            </div>

            <div class="md:col-span-8 space-y-3">
              <div v-if="book.binhLuan && book.binhLuan.length > 0" class="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                <div 
                  v-for="(rv, index) in book.binhLuan" 
                  :key="index"
                  class="bg-white p-3.5 rounded-xl border border-slate-150 shadow-sm space-y-1.5 hover:border-slate-350 transition-colors"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex items-center space-x-2">
                      <div class="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        {{ rv.hoTen?.charAt(0).toUpperCase() || 'D' }}
                      </div>
                      <div>
                        <span class="font-bold text-slate-900 text-xs block">{{ rv.hoTen }}</span>
                        <span class="text-[9px] text-slate-400 font-medium block">{{ formatDate(rv.ngayTao) }}</span>
                      </div>
                    </div>
                    <div class="flex items-center">
                      <Star 
                        v-for="star in 5" 
                        :key="star" 
                        class="h-3 w-3" 
                        :class="star <= rv.soSao ? 'text-amber-500 fill-amber-500' : 'text-slate-200'"
                      />
                    </div>
                  </div>
                  <p class="text-slate-650 text-xs leading-relaxed pl-9 whitespace-pre-line">{{ rv.noiDung }}</p>
                </div>
              </div>
              <div v-else class="h-full flex flex-col items-center justify-center text-center py-4 text-slate-400 space-y-1">
                <span class="text-xs font-semibold text-slate-400">Chưa có bình luận hay đánh giá nào cho đầu sách này.</span>
              </div>
            </div>
          </div>

          <!-- Write a Review Form -->
          <div class="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
            <h3 class="font-bold text-slate-900 text-xs flex items-center">
              Viết đánh giá của bạn
            </h3>

            <div v-if="authStore.isAuthenticated" class="space-y-3">
              <div class="flex items-center space-x-2">
                <span class="text-xs text-slate-500 font-bold">Chọn số sao:</span>
                <div class="flex items-center space-x-1">
                  <button 
                    v-for="star in 5" 
                    :key="star" 
                    type="button"
                    @click="userRating = star"
                    class="text-slate-350 hover:scale-110 transition-transform focus:outline-none"
                  >
                    <Star 
                      class="h-4.5 w-4.5" 
                      :class="star <= userRating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'"
                    />
                  </button>
                </div>
                <span class="text-xs text-slate-600 font-bold ml-2">({{ userRating }}/5 sao)</span>
              </div>

              <div class="space-y-1">
                <textarea 
                  v-model="userComment" 
                  rows="2" 
                  placeholder="Chia sẻ cảm nhận thực tế của bạn..."
                  class="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder-slate-400"
                ></textarea>
              </div>

              <div v-if="reviewError" class="text-red-650 text-[10px] font-bold bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg">
                {{ reviewError }}
              </div>
              <div v-if="reviewSuccess" class="text-green-655 text-[10px] font-bold bg-green-50 border border-green-100 px-3 py-1.5 rounded-lg">
                {{ reviewSuccess }}
              </div>

              <div class="flex justify-end">
                <button 
                  @click="submitReview"
                  :disabled="submittingReview"
                  class="bg-primary hover:bg-primary-dark text-white font-bold py-1.5 px-4 rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50"
                >
                  <span>{{ submittingReview ? 'Đang gửi...' : 'Gửi đánh giá' }}</span>
                </button>
              </div>
            </div>
            <div v-else class="text-center py-3 bg-white border border-dashed border-slate-200 rounded-xl">
              <p class="text-xs text-slate-500 font-semibold">
                Vui lòng <router-link :to="{ name: 'login' }" class="text-primary hover:underline font-bold">đăng nhập</router-link> để viết đánh giá.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Cột phải: Sidebar Action Box (4/12) -->
      <div class="lg:col-span-4">
        <div class="sticky top-6 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <!-- Book Price Header -->
          <div class="space-y-1">
            <span class="text-xs text-slate-400 font-bold uppercase tracking-wider block">Giá gốc / Giá thuê</span>
            <span class="text-2xl font-black text-slate-900 block">
              {{ formatCurrency(book.giaBia) }} 
              <span class="text-slate-300 font-normal">/</span> 
              <span class="text-primary">{{ formatCurrency(book.giaBia * 0.02) }}</span>
            </span>
            <span class="text-[10px] text-slate-400 block font-medium leading-relaxed">* Được miễn phí cọc nếu gói thẻ của bạn có hỗ trợ miễn cọc.</span>
          </div>
          
          <hr class="border-slate-100" />
          
          <!-- Stock status -->
          <div class="space-y-2">
            <div class="flex justify-between items-center text-xs">
              <span class="text-slate-500 font-bold">Tình trạng kho:</span>
              <span 
                class="font-extrabold"
                :class="book.soLuongKhaDung > 0 && book.trangThai === 'ACTIVE' ? 'text-green-600' : 'text-amber-600'"
              >
                {{ getStatusText() }}
              </span>
            </div>
            <div class="flex justify-between items-center text-xs">
              <span class="text-slate-500 font-bold">Vị trí kệ:</span>
              <span class="font-extrabold text-slate-800 flex items-center">
                <MapPin class="h-3.5 w-3.5 mr-1 text-primary" /> {{ book.viTriKe || 'Kệ trống' }}
              </span>
            </div>
          </div>
          
          <hr class="border-slate-100" />
          
          <!-- Date Picker for Quick Borrow -->
          <div v-if="book.trangThai === 'ACTIVE' && book.soLuongKhaDung > 0" class="space-y-4">
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-500 flex items-center">
                <Calendar class="h-3.5 w-3.5 mr-1.5 text-primary" /> Ngày hẹn trả sách
              </label>
              <input 
                type="date" 
                v-model="ngayHenTra" 
                :min="minDate"
                :max="maxDate"
                class="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
              />
              <span class="text-[9px] text-slate-400 block font-medium leading-relaxed">Hạn trả tối đa: {{ maxBorrowDays }} ngày (theo gói thẻ của bạn).</span>
            </div>
            
            <!-- Quick Borrow Alert -->
            <div v-if="quickBorrowError" class="text-red-600 text-[10px] font-bold bg-red-50 border border-red-100 px-3 py-2 rounded-xl">
              {{ quickBorrowError }}
            </div>
            <div v-if="quickBorrowSuccess" class="text-green-600 text-[10px] font-bold bg-green-50 border border-green-100 px-3 py-2 rounded-xl">
              {{ quickBorrowSuccess }}
            </div>

            <!-- Action buttons -->
            <div class="space-y-3 pt-2">
              <!-- Mượn ngay -->
              <button 
                @click="handleQuickBorrow"
                :disabled="submittingQuickBorrow"
                class="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold py-3 px-6 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 text-xs"
              >
                <span>{{ submittingQuickBorrow ? 'Đang đăng ký mượn...' : 'Mượn Ngay' }}</span>
              </button>

              <!-- Thêm vào giỏ -->
              <button 
                v-if="!cartStore.hasBook(book._id)"
                @click="addToCart"
                class="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 text-xs"
              >
                <ShoppingBag class="h-4.5 w-4.5" />
                <span>Thêm vào giỏ mượn</span>
              </button>
              <button 
                v-else
                @click="goToCart"
                class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 text-xs"
              >
                <Check class="h-4.5 w-4.5" />
                <span>Đã có trong giỏ - Xem giỏ</span>
              </button>
            </div>
          </div>
          
          <div v-else class="bg-red-50 text-red-700 border border-red-100 rounded-xl p-3 text-xs text-center font-medium">
            Hiện tại không thể mượn sách này (Hết bản sao khả dụng hoặc sách đã ngừng phục vụ).
          </div>
        </div>
      </div>

    </div>

    <div v-else-if="loading" class="text-center py-20 text-slate-400 font-medium">Đang tải chi tiết sách...</div>
    <div v-else class="text-center py-20 text-slate-400 font-medium bg-white rounded-3xl border border-slate-200">
      Đầu sách không tồn tại hoặc đã bị xóa.
    </div>

    <!-- Custom Auth Redirect Modal -->
    <div v-if="showAuthModal" class="fixed inset-0 bg-slate-900 bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div class="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full space-y-6 shadow-2xl relative text-center">
        <button @click="showAuthModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X class="h-6 w-6" />
        </button>

        <div class="space-y-3">
          <div class="bg-primary-light text-primary h-12 w-12 rounded-full flex items-center justify-center mx-auto text-xl">
            <Lock class="h-6 w-6 text-primary" />
          </div>
          <h3 class="font-sans text-lg font-bold text-slate-900">Yêu Cầu Đăng Nhập</h3>
          <p class="text-xs text-slate-500 font-medium leading-relaxed">
            Vui lòng đăng nhập tài khoản Độc giả để bắt đầu thực hiện mượn sách.
          </p>
        </div>

        <div class="flex space-x-3 pt-2">
          <button 
            @click="showAuthModal = false"
            class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2.5 rounded-xl text-xs transition-colors"
          >
            Đóng
          </button>
          <button 
            @click="goToLogin"
            class="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 rounded-xl text-xs transition-colors shadow-md"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart';
import { useAuthStore } from '../stores/auth';
import api from '../services/api';
import { Star, MapPin, ShoppingBag, Check, BookOpen, X, Lock, Layers, Globe, Calendar, Bookmark } from '@lucide/vue';
import { useToastStore } from '../stores/toast';

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();
const toast = useToastStore();

const book = ref(null);
const loading = ref(true);
const showAuthModal = ref(false);

// State cho đánh giá và bình luận
const userRating = ref(5);
const userComment = ref('');
const submittingReview = ref(false);
const reviewError = ref('');
const reviewSuccess = ref('');

// State cho mượn lẻ nhanh (Quick Borrow)
const ngayHenTra = ref('');
const submittingQuickBorrow = ref(false);
const quickBorrowError = ref('');
const quickBorrowSuccess = ref('');

// Computed properties cho ngayHenTra min/max
const minDate = computed(() => {
  const today = new Date();
  today.setDate(today.getDate() + 1); // Trả ít nhất ngày mai
  return today.toISOString().split('T')[0];
});

const maxBorrowDays = computed(() => {
  return authStore.user?.subscriptionPlan?.soNgayMuonToiDa || 14;
});

const maxDate = computed(() => {
  const max = new Date();
  max.setDate(max.getDate() + maxBorrowDays.value);
  return max.toISOString().split('T')[0];
});

// Khởi tạo ngày hẹn trả mặc định (14 ngày sau hoặc max hạn của thẻ)
const setDefaultReturnDate = () => {
  const defDate = new Date();
  defDate.setDate(defDate.getDate() + Math.min(14, maxBorrowDays.value));
  ngayHenTra.value = defDate.toISOString().split('T')[0];
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const submitReview = async () => {
  reviewError.value = '';
  reviewSuccess.value = '';
  submittingReview.value = true;
  try {
    const res = await api.post(`/books/${book.value._id}/reviews`, {
      soSao: userRating.value,
      noiDung: userComment.value
    });
    if (res.success) {
      reviewSuccess.value = 'Đánh giá của bạn đã được ghi nhận thành công!';
      book.value.rating = res.data.rating;
      book.value.soLuotDanhGia = res.data.soLuotDanhGia;
      book.value.binhLuan = res.data.binhLuan;
      userComment.value = '';
      userRating.value = 5;
      
      setTimeout(() => {
        reviewSuccess.value = '';
      }, 3500);
    } else {
      reviewError.value = res.message || 'Gửi đánh giá thất bại.';
    }
  } catch (err) {
    console.error('Submit review error:', err);
    reviewError.value = err.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá.';
  } finally {
    submittingReview.value = false;
  }
};

const getImageUrl = (path) => {
  if (!path) return '/placeholder_book.png';
  if (path.startsWith('http') || path.startsWith('data:image')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `http://localhost:3000${cleanPath}`;
};

const formatCurrency = (val) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
};

const getStatusText = () => {
  if (!book.value) return '';
  if (book.value.trangThai === 'DISCONTINUED') return 'Ngừng phục vụ (Drain)';
  return book.value.soLuongKhaDung > 0 
    ? `Còn sách (${book.value.soLuongKhaDung} bản khả dụng)` 
    : 'Hết sách khả dụng';
};

const addToCart = () => {
  if (!book.value) return;
  if (!authStore.isAuthenticated) {
    showAuthModal.value = true;
    return;
  }
  if (authStore.isStaff) {
    toast.show('Tài khoản nhân viên không có quyền đăng ký mượn sách.', 'warning');
    return;
  }
  cartStore.addBook(book.value);
};

const goToLogin = () => {
  showAuthModal.value = false;
  router.push({ name: 'login' });
};

const goToCart = () => {
  router.push({ name: 'cart' });
};

const relatedBooks = ref([]);

const handleQuickBorrow = async () => {
  if (!authStore.isAuthenticated) {
    showAuthModal.value = true;
    return;
  }
  if (authStore.isStaff) {
    toast.show('Tài khoản nhân viên không có quyền đăng ký mượn sách.', 'warning');
    return;
  }
  if (!ngayHenTra.value) {
    quickBorrowError.value = 'Vui lòng chọn ngày hẹn trả sách!';
    return;
  }

  quickBorrowError.value = '';
  quickBorrowSuccess.value = '';
  submittingQuickBorrow.value = true;

  try {
    const chiTietMuon = [{
      sach: book.value._id,
      soLuong: 1
    }];

    const phi = book.value.giaBia * 0.02 || 0;
    const payload = {
      chiTietMuon,
      ngayHenTra: ngayHenTra.value,
      phiMuon: phi,
      soTienGiam: 0,
      tongTienThanhToan: phi
    };

    const res = await api.post('/borrowing/receipts', payload);
    if (res.success) {
      quickBorrowSuccess.value = 'Đăng ký mượn sách thành công! Vui lòng tới thư viện nhận sách.';
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
    }
  } catch (error) {
    quickBorrowError.value = error.response?.data?.message || error.message || 'Lỗi tạo phiếu mượn nhanh.';
  } finally {
    submittingQuickBorrow.value = false;
  }
};

const fetchBookDetail = async (id) => {
  loading.value = true;
  try {
    const res = await api.get(`/books/${id}`);
    if (res.success) {
      book.value = res.data.book;
      relatedBooks.value = res.data.relatedBooks || [];
      // Reset form reviews
      userRating.value = 5;
      userComment.value = '';
      reviewError.value = '';
      reviewSuccess.value = '';
      
      // Set default ngày hẹn trả
      setDefaultReturnDate();
    }
  } catch (error) {
    console.error('Fetch book detail error:', error);
  } finally {
    loading.value = false;
  }
};

watch(() => route.params.id, (newId) => {
  if (newId) {
    fetchBookDetail(newId);
  }
});

onMounted(() => {
  fetchBookDetail(route.params.id);
});
</script>
