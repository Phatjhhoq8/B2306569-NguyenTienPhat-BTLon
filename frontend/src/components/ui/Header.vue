<template>
  <header class="bg-primary text-white shadow-md sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <router-link to="/" class="flex items-center space-x-2 text-white hover:opacity-90">
          <img src="/src/assets/logo.jpg" alt="Logo" class="h-8 w-8 rounded-lg object-cover border border-slate-700 bg-white" />
          <span class="font-serif text-base md:text-lg font-bold tracking-wide">CTU eLibrary</span>
        </router-link>

        <!-- Navigation Links -->
        <nav class="hidden md:flex space-x-4 lg:space-x-8 text-[13px] lg:text-sm font-bold tracking-wide">
          <router-link to="/" class="hover:text-secondary transition-all py-1.5 border-b-2 border-transparent hover:border-secondary/30" exact-active-class="text-secondary !border-secondary">Trang chủ</router-link>
          <router-link to="/about" class="hover:text-secondary transition-all py-1.5 border-b-2 border-transparent hover:border-secondary/30" exact-active-class="text-secondary !border-secondary">Giới thiệu</router-link>
          <router-link to="/books" class="hover:text-secondary transition-all py-1.5 border-b-2 border-transparent hover:border-secondary/30" active-class="text-secondary !border-secondary">Danh mục sách</router-link>
          <router-link to="/memberships" class="hover:text-secondary transition-all py-1.5 border-b-2 border-transparent hover:border-secondary/30" active-class="text-secondary !border-secondary">Gói hội viên</router-link>
          <router-link to="/contact" class="hover:text-secondary transition-all py-1.5 border-b-2 border-transparent hover:border-secondary/30" exact-active-class="text-secondary !border-secondary">Liên hệ</router-link>
        </nav>

        <!-- Right Menu Controls -->
        <div class="flex items-center space-x-4">
          <button
            @click="handleChatClick"
            class="relative p-2 hover:bg-primary-dark rounded-full transition-colors group"
            title="Mở trợ lý AI"
          >
            <Bot class="h-6 w-6 text-white group-hover:text-secondary transition-colors" />
          </button>

          <!-- Cart Link (Chỉ độc giả đã đăng nhập mới thấy) -->
          <router-link 
            v-if="authStore.isAuthenticated && authStore.isReader"
            to="/cart" 
            class="relative p-2 hover:bg-primary-dark rounded-full transition-colors group"
          >
            <ShoppingBag class="h-6 w-6 text-white group-hover:text-secondary transition-colors" />
            <span 
              v-if="cartStore.totalItems > 0"
              class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse"
            >
              {{ cartStore.totalItems }}
            </span>
          </router-link>

          <!-- User Menu -->
          <div v-if="authStore.isAuthenticated" class="relative group">
            <button class="flex items-center space-x-2 bg-primary-dark px-2 lg:px-3.5 py-1.5 lg:py-2 rounded-xl hover:bg-opacity-80 hover:border-secondary transition-all border border-slate-600 shadow-sm">
              <User class="h-4 w-4 text-secondary" />
              <span class="hidden sm:inline text-[11px] lg:text-xs font-bold text-white">{{ authStore.user?.ten || authStore.user?.hoTenNV }}</span>
            </button>
            
            <!-- Dropdown Menu Wrapper (Giải quyết khoảng hở mất hover) -->
            <div class="absolute right-0 top-full pt-2 w-56 hidden group-hover:block hover:block z-50">
              <!-- Styled Menu Box -->
              <div class="bg-white rounded-2xl shadow-xl p-1.5 text-slate-800 border border-slate-150 flex flex-col space-y-0.5">
                <!-- Admin Link nếu là nhân viên -->
                <router-link 
                  v-if="authStore.isStaff" 
                  to="/admin" 
                  class="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-primary/10 hover:text-primary transition-all duration-150 rounded-xl font-bold group"
                >
                  <LayoutDashboard class="h-4 w-4 mr-2.5 text-slate-400 group-hover:text-primary group-hover:scale-105 transition-all duration-150" />
                  Trang quản trị
                </router-link>

                <!-- Profile Link nếu là độc giả -->
                <router-link 
                  v-else
                  to="/profile" 
                  class="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-primary/10 hover:text-primary transition-all duration-150 rounded-xl font-bold group"
                >
                  <UserCheck class="h-4 w-4 mr-2.5 text-slate-400 group-hover:text-primary group-hover:scale-105 transition-all duration-150" />
                  Hồ sơ độc giả
                </router-link>

                <div class="border-t border-slate-100 my-1 mx-1.5"></div>
                
                <button 
                  @click="handleLogout"
                  class="w-full text-left flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-red-100 hover:text-red-600 transition-all duration-150 rounded-xl font-bold group"
                >
                  <LogOut class="h-4 w-4 mr-2.5 text-slate-400 group-hover:text-red-600 group-hover:scale-105 transition-all duration-150" />
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>

          <!-- Chưa đăng nhập -->
          <div v-else class="flex items-center space-x-3">
            <router-link 
              to="/login" 
              class="px-2.5 lg:px-4 py-2 text-[13px] lg:text-sm font-bold text-white hover:text-secondary hover:bg-white/5 rounded-xl transition-all"
            >
              Đăng nhập
            </router-link>
            <router-link 
              to="/register" 
              class="bg-secondary hover:bg-amber-100 text-primary-dark font-extrabold px-3.5 lg:px-5 py-1.5 lg:py-2 text-[13px] lg:text-sm rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md shadow-secondary/10"
            >
              Đăng ký
            </router-link>
          </div>

          <!-- Hamburger Button (Mobile Only) -->
          <button 
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="md:hidden p-2 hover:bg-primary-dark rounded-xl transition-colors text-white focus:outline-none"
            title="Menu di động"
          >
            <Menu v-if="!isMobileMenuOpen" class="h-6 w-6 text-white" />
            <X v-else class="h-6 w-6 text-white" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu Dropdown (Hiển thị khi click nút Hamburger ở màn hình < md) -->
    <div 
      v-if="isMobileMenuOpen" 
      class="md:hidden bg-primary-dark border-t border-slate-700/80 px-4 py-3 space-y-1.5 shadow-inner"
    >
      <router-link 
        to="/" 
        class="block py-2.5 px-4 rounded-xl text-sm font-bold text-white hover:bg-white/10 hover:text-secondary transition-all"
        exact-active-class="bg-white/10 text-secondary"
        @click="isMobileMenuOpen = false"
      >
        Trang chủ
      </router-link>
      <router-link 
        to="/about" 
        class="block py-2.5 px-4 rounded-xl text-sm font-bold text-white hover:bg-white/10 hover:text-secondary transition-all"
        exact-active-class="bg-white/10 text-secondary"
        @click="isMobileMenuOpen = false"
      >
        Giới thiệu
      </router-link>
      <router-link 
        to="/books" 
        class="block py-2.5 px-4 rounded-xl text-sm font-bold text-white hover:bg-white/10 hover:text-secondary transition-all"
        active-class="bg-white/10 text-secondary"
        @click="isMobileMenuOpen = false"
      >
        Danh mục sách
      </router-link>
      <router-link 
        to="/memberships" 
        class="block py-2.5 px-4 rounded-xl text-sm font-bold text-white hover:bg-white/10 hover:text-secondary transition-all"
        active-class="bg-white/10 text-secondary"
        @click="isMobileMenuOpen = false"
      >
        Gói hội viên
      </router-link>
      <router-link 
        to="/contact" 
        class="block py-2.5 px-4 rounded-xl text-sm font-bold text-white hover:bg-white/10 hover:text-secondary transition-all"
        exact-active-class="bg-white/10 text-secondary"
        @click="isMobileMenuOpen = false"
      >
        Liên hệ
      </router-link>
    </div>
    
    <!-- Yellow Banner for staff/admin simulating client view -->
    <div 
      v-if="authStore.isStaff" 
      class="bg-yellow-400/80 backdrop-blur-md text-yellow-950 border-t border-yellow-400/20 shadow-sm"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col sm:flex-row items-center justify-center sm:space-x-2 text-center text-xs md:text-sm font-semibold">
        <div class="flex items-center space-x-1.5 justify-center">
          <Eye class="h-4 w-4 text-yellow-900 animate-pulse flex-shrink-0" />
          <span>
            Bạn đang xem giao diện với vai trò <strong class="text-yellow-950 font-bold">{{ authStore.isAdmin ? 'Quản trị viên (Admin)' : 'Nhân viên (Thủ thư)' }}</strong> (Chế độ mô phỏng giao diện độc giả).
          </span>
        </div>
        <router-link 
          to="/admin" 
          class="inline-flex items-center space-x-0.5 underline text-yellow-900 hover:text-black transition-colors font-bold whitespace-nowrap mt-1 sm:mt-0 sm:ml-2"
        >
          <span>Vào trang quản trị</span>
          <span aria-hidden="true">&rarr;</span>
        </router-link>
      </div>
    </div>

    <!-- Custom Confirm Dialog -->
    <ConfirmModal ref="confirmModal" />
  </header>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useCartStore } from '../../stores/cart';
import { useChatStore } from '../../stores/chat';
import { Eye, ShoppingBag, User, LogOut, LayoutDashboard, UserCheck, Menu, X, Bot } from '@lucide/vue';
import ConfirmModal from '../ConfirmModal.vue';

const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();
const chatStore = useChatStore();

const isMobileMenuOpen = ref(false);
const confirmModal = ref(null);

const handleChatClick = () => {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath, reason: 'agent' } });
    return;
  }
  chatStore.toggleChat();
};

const handleLogout = async () => {
  const ok = await confirmModal.value.ask({
    title: 'Đăng xuất tài khoản',
    message: 'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống thư viện không?',
    confirmText: 'Đăng xuất',
    cancelText: 'Hủy bỏ'
  });
  if (!ok) return;

  await authStore.logout();
  chatStore.clearSession();
  cartStore.clearCart(); // Xóa sạch giỏ mượn khi đăng xuất
  router.push('/login');
};
</script>
