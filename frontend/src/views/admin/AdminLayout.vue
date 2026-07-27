<template>
  <div class="min-h-screen flex bg-slate-50 font-sans">
    <!-- Sidebar (Left) -->
    <aside class="w-64 bg-slate-900 text-slate-400 flex flex-col justify-between z-30 shadow-xl border-r border-slate-800">
      <div class="space-y-6 pt-6">
        <!-- Logo -->
        <div class="px-6 flex items-center space-x-2 text-white">
          <img src="/src/assets/logo.jpg" alt="Logo" class="h-8 w-8 rounded-lg object-cover border border-slate-700 bg-white" />
          <span class="font-serif text-base font-bold tracking-wider">CTU eLibrary ADMIN</span>
        </div>

        <hr class="border-slate-800 mx-4" />

        <!-- Navigation Menu -->
        <nav class="space-y-1.5 px-4">
          <router-link 
            v-for="item in menuItems" 
            :key="item.name"
            :to="item.to" 
            class="flex items-center pl-3 pr-4 py-3 text-sm font-medium rounded-xl transition-all group border-l-4 border-transparent text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <component :is="item.icon" class="h-5 w-5 mr-3 transition-colors text-slate-500 group-hover:text-secondary" />
            <span>{{ item.label }}</span>
          </router-link>
        </nav>
      </div>

      <!-- Footer Info -->
      <div class="p-4 border-t border-slate-800 space-y-4">
        <div class="flex items-center space-x-2">
          <div class="bg-primary text-white h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm">
            {{ authStore.user?.hoTenNV?.charAt(0) }}
          </div>
          <div class="min-w-0">
            <p class="text-xs font-bold text-white truncate">{{ authStore.user?.hoTenNV }}</p>
            <span class="text-[10px] text-slate-500 font-semibold block uppercase">
              {{ authStore.user?.chucVu === 'QUAN_LY' ? 'Quản lý' : 'Thủ thư' }}
            </span>
          </div>
        </div>
        <button 
          @click="handleLogout"
          class="w-full bg-slate-800 hover:bg-red-900 hover:text-white text-slate-400 font-bold py-2 rounded-xl text-xs transition-colors flex items-center justify-center space-x-1"
        >
          <LogOut class="h-3.5 w-3.5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Panel (Right) -->
    <div class="flex-grow flex flex-col min-h-screen overflow-x-hidden">
      <!-- Top header bar -->
      <header class="bg-white h-16 border-b border-slate-200 px-8 flex items-center justify-between shadow-sm">
        <div class="flex items-center space-x-4">
          <span class="text-slate-400 text-sm font-medium">Hệ thống Quản lý Thư viện / Portal</span>
        </div>
        <div class="flex items-center space-x-4">
          <span class="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full uppercase">
            Mã: {{ authStore.user?.maSoNV }}
          </span>
          <router-link to="/" class="text-xs font-semibold text-primary hover:underline">
            Về Trang chủ độc giả
          </router-link>
        </div>
      </header>

      <!-- Views wrapper -->
      <main class="flex-grow p-8">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { 
  BookOpen, 
  LayoutDashboard, 
  BookMarked, 
  GitCompare, 
  Users, 
  Settings, 
  LogOut,
  UserCheck
} from '@lucide/vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const menuItems = computed(() => {
  const items = [
    { name: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard, to: '/admin' },
    { name: 'admin-books', label: 'Quản lý Đầu sách', icon: BookMarked, to: '/admin/books' },
    { name: 'admin-borrowing', label: 'Mượn / Trả Sách', icon: GitCompare, to: '/admin/borrowing' },
    { name: 'admin-readers', label: 'Quản lý Độc giả', icon: Users, to: '/admin/readers' },
  ];

  // Chỉ Quản lý (QUAN_LY) mới được phép xem Quản lý Nhân sự
  if (authStore.isAdmin) {
    items.push({ name: 'admin-staffs', label: 'Quản lý Nhân viên', icon: UserCheck, to: '/admin/staffs' });
  }

  // Thêm Gói & mã giảm giá ở cuối
  items.push({ name: 'admin-settings', label: 'Cấu hình & Mã giảm', icon: Settings, to: '/admin/settings' });

  return items;
});

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.router-link-exact-active {
  background-color: #0f4c81 !important; /* bg-primary */
  color: #ffffff !important;
  font-weight: 700;
  border-left-color: #fef3c7 !important; /* border-secondary */
  box-shadow: 0 10px 15px -3px rgba(15, 76, 129, 0.3), 0 4px 6px -4px rgba(15, 76, 129, 0.3);
}
.router-link-exact-active svg {
  color: #fef3c7 !important; /* text-secondary */
}
</style>
