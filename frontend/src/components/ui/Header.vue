<template>
  <header class="bg-primary text-white shadow-md sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <router-link to="/" class="flex items-center space-x-2 text-white hover:opacity-90">
          <img src="/src/assets/logo.jpg" alt="Logo" class="h-8 w-8 rounded-lg object-cover border border-slate-700 bg-white" />
          <span class="font-serif text-xl font-bold tracking-wide">CTU eLibrary</span>
        </router-link>

        <!-- Navigation Links -->
        <nav class="hidden md:flex space-x-8 text-sm font-bold tracking-wide">
          <router-link to="/" class="hover:text-secondary transition-all py-1.5 border-b-2 border-transparent hover:border-secondary/30" exact-active-class="text-secondary !border-secondary">Trang chủ</router-link>
          <router-link to="/about" class="hover:text-secondary transition-all py-1.5 border-b-2 border-transparent hover:border-secondary/30" exact-active-class="text-secondary !border-secondary">Giới thiệu</router-link>
          <router-link to="/books" class="hover:text-secondary transition-all py-1.5 border-b-2 border-transparent hover:border-secondary/30" active-class="text-secondary !border-secondary">Danh mục sách</router-link>
          <router-link to="/memberships" class="hover:text-secondary transition-all py-1.5 border-b-2 border-transparent hover:border-secondary/30" active-class="text-secondary !border-secondary">Gói hội viên</router-link>
          <router-link to="/contact" class="hover:text-secondary transition-all py-1.5 border-b-2 border-transparent hover:border-secondary/30" exact-active-class="text-secondary !border-secondary">Liên hệ</router-link>
        </nav>

        <!-- Right Menu Controls -->
        <div class="flex items-center space-x-4">
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
            <button class="flex items-center space-x-2 bg-primary-dark px-3.5 py-2 rounded-xl hover:bg-opacity-80 transition-all border border-slate-600 shadow-sm">
              <User class="h-4 w-4 text-secondary" />
              <span class="hidden sm:inline text-xs font-bold text-white">{{ authStore.user?.ten || authStore.user?.hoTenNV }}</span>
            </button>
            
            <!-- Dropdown Menu Wrapper (Giải quyết khoảng hở mất hover) -->
            <div class="absolute right-0 top-full pt-2 w-48 hidden group-hover:block hover:block z-50">
              <!-- Styled Menu Box -->
              <div class="bg-white rounded-xl shadow-xl py-1 text-slate-800 border border-slate-100">
                <!-- Admin Link nếu là nhân viên -->
                <router-link 
                  v-if="authStore.isStaff" 
                  to="/admin" 
                  class="flex items-center px-4 py-2 text-sm hover:bg-slate-50 transition-colors font-bold"
                >
                  <LayoutDashboard class="h-4 w-4 mr-2 text-primary" />
                  Trang quản trị
                </router-link>

                <!-- Profile Link nếu là độc giả -->
                <router-link 
                  v-else
                  to="/profile" 
                  class="flex items-center px-4 py-2 text-sm hover:bg-slate-50 transition-colors font-bold"
                >
                  <UserCheck class="h-4 w-4 mr-2 text-primary" />
                  Hồ sơ độc giả
                </router-link>

                <hr class="my-1 border-slate-100" />
                
                <button 
                  @click="handleLogout"
                  class="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-bold"
                >
                  <LogOut class="h-4 w-4 mr-2" />
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>

          <!-- Chưa đăng nhập -->
          <div v-else class="flex items-center space-x-3">
            <router-link 
              to="/login" 
              class="px-4 py-2 text-sm font-bold text-white hover:text-secondary hover:bg-white/5 rounded-xl transition-all"
            >
              Đăng nhập
            </router-link>
            <router-link 
              to="/register" 
              class="bg-secondary hover:bg-amber-100 text-primary-dark font-extrabold px-5 py-2 text-sm rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md shadow-secondary/10"
            >
              Đăng ký
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useCartStore } from '../../stores/cart';
import { BookOpen, ShoppingBag, User, LogOut, LayoutDashboard, UserCheck } from '@lucide/vue';

const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();

const handleLogout = async () => {
  await authStore.logout();
  cartStore.clearCart(); // Xóa sạch giỏ mượn khi đăng xuất
  router.push('/login');
};
</script>
