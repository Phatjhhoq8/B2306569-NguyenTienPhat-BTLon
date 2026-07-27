<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div v-if="book" class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-10 space-y-10">
      <!-- Info Header Grid -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
        <!-- Cover Image Column (4/12) -->
        <div class="md:col-span-5 space-y-4">
          <div class="bg-slate-100 rounded-2xl overflow-hidden shadow-md pt-[135%] relative border border-slate-200">
            <img 
              :src="getImageUrl(book.hinhAnh)" 
              :alt="book.tenSach" 
              class="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>

        <!-- Details Column (7/12) -->
        <div class="md:col-span-7 flex flex-col justify-between space-y-6">
          <div class="space-y-4">
            <span class="bg-primary-light text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide inline-block">
              {{ book.theLoai?.tenTheLoai }}
            </span>
            <h1 class="font-sans text-2xl md:text-4xl font-extrabold text-slate-900 leading-tight">
              {{ book.tenSach }}
            </h1>
            <p class="text-sm text-slate-500 font-medium">
              Tác giả: <span class="text-slate-800 font-semibold">{{ book.tacGia?.map(t => t.tenTacGia).join(', ') }}</span>
            </p>
            
            <!-- Ratings and stats -->
            <div class="flex items-center space-x-4 text-sm font-semibold">
              <span class="flex items-center text-amber-500">
                <Star class="h-4 w-4 fill-amber-500 mr-1" /> {{ book.rating?.toFixed(1) || '5.0' }}
              </span>
              <span class="text-slate-300">|</span>
              <span class="text-slate-600">{{ book.soLuotMuon || 0 }} lượt mượn</span>
            </div>

            <hr class="border-slate-100" />

            <!-- Stock Availability Badge -->
            <div class="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span class="text-xs text-slate-400 block font-medium">Tình trạng kho</span>
                <span 
                  class="text-sm font-bold block"
                  :class="book.soLuongKhaDung > 0 && book.trangThai === 'ACTIVE' ? 'text-green-600' : 'text-amber-600'"
                >
                  {{ getStatusText() }}
                </span>
              </div>
              <div>
                <span class="text-xs text-slate-400 block font-medium">Vị trí kệ sách</span>
                <span class="text-sm font-bold text-slate-800 flex items-center">
                  <MapPin class="h-4 w-4 mr-1 text-primary" /> {{ book.viTriKe || 'Kệ trống' }}
                </span>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <div class="flex items-baseline space-x-2">
              <span class="text-xs text-slate-400 font-medium">Giá trị sách:</span>
              <span class="text-2xl font-bold text-slate-950">{{ formatCurrency(book.giaBia) }}</span>
            </div>

            <!-- Action Buttons -->
            <div v-if="book.trangThai === 'ACTIVE' && book.soLuongKhaDung > 0" class="flex flex-col sm:flex-row gap-3">
              <button 
                v-if="!cartStore.hasBook(book._id)"
                @click="addToCart"
                class="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2"
              >
                <ShoppingBag class="h-5 w-5" />
                <span>Thêm vào giỏ mượn</span>
              </button>
              <button 
                v-else
                @click="goToCart"
                class="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2"
              >
                <Check class="h-5 w-5" />
                <span>Đã có trong giỏ - Xem giỏ</span>
              </button>
            </div>
            <div v-else class="bg-red-50 text-red-700 border border-red-100 rounded-xl p-3 text-sm text-center font-medium">
              Hiện tại không thể mượn sách này (Hết bản sao khả dụng hoặc sách đã ngừng phục vụ).
            </div>
          </div>
        </div>
      </div>

      <!-- Description Section -->
      <div class="space-y-4 pt-6 border-t border-slate-100">
        <h2 class="font-sans text-xl font-extrabold text-slate-900 flex items-center">
          <BookOpen class="h-5 w-5 mr-2 text-primary" /> Mô tả tóm tắt
        </h2>
        <p class="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
          {{ book.moTa || 'Chưa có mô tả tóm tắt cho đầu sách này.' }}
        </p>
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
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart';
import { useAuthStore } from '../stores/auth';
import api from '../services/api';
import { Star, MapPin, ShoppingBag, Check, BookOpen, X, Lock } from '@lucide/vue';

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();

const book = ref(null);
const loading = ref(true);
const showAuthModal = ref(false);

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
    alert('Tài khoản nhân viên không có quyền đăng ký mượn sách.');
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

onMounted(async () => {
  loading.value = true;
  try {
    const res = await api.get(`/books/${route.params.id}`);
    if (res.success) {
      book.value = res.data.book;
    }
  } catch (error) {
    console.error('Fetch book error:', error);
  } finally {
    loading.value = false;
  }
});
</script>
