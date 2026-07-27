<template>
  <div class="h-screen w-screen flex bg-slate-50 font-sans overflow-hidden">
    <!-- Backdrop for mobile sidebar -->
    <div 
      v-if="isSidebarOpen" 
      @click="isSidebarOpen = false" 
      class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
    ></div>

    <aside 
      class="fixed inset-y-0 left-0 w-64 bg-slate-900 text-slate-400 flex flex-col justify-between z-50 shadow-xl border-r border-slate-800 transition-transform duration-300 transform md:static md:translate-x-0 h-full flex-shrink-0"
      :class="[isSidebarOpen ? 'translate-x-0' : '-translate-x-full']"
    >
      <div class="space-y-6 pt-6">
        <!-- Logo -->
        <div class="px-6 flex items-center space-x-2 text-white">
          <img src="/src/assets/logo.jpg" alt="Logo" class="h-8 w-8 rounded-lg object-cover border border-slate-700 bg-white" />
          <span class="font-sans text-base font-extrabold tracking-wider">CTU eLibrary ADMIN</span>
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
    <div class="flex-grow flex flex-col h-full overflow-hidden min-w-0">
      <!-- Top header bar -->
      <header class="bg-white h-16 border-b border-slate-200 px-4 md:px-8 flex items-center justify-between shadow-sm flex-shrink-0">
        <div class="flex items-center space-x-2 md:space-x-4">
          <!-- Toggle button for mobile -->
          <button 
            @click="isSidebarOpen = !isSidebarOpen"
            class="md:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600 focus:outline-none"
            title="Mở Sidebar"
          >
            <Menu class="h-5.5 w-5.5" />
          </button>
          <span class="text-slate-400 text-sm font-medium hidden sm:inline">Hệ thống Quản lý Thư viện / Portal</span>
          <span class="text-slate-400 text-xs font-medium sm:hidden">Portal</span>
        </div>
        <div class="flex items-center space-x-3 md:space-x-4">
          <span class="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase border border-slate-200 shadow-sm flex items-center">
            Mã: {{ authStore.user?.maSoNV }}
          </span>
          <router-link to="/" class="flex items-center space-x-1 text-xs md:text-sm font-semibold text-primary hover:text-primary-dark transition-all">
            <Home class="h-3.5 w-3.5" />
            <span class="hidden xs:inline">Về Trang chủ độc giả</span>
            <span class="xs:hidden">Trang chủ</span>
          </router-link>
        </div>
      </header>

      <!-- Views wrapper -->
      <main class="flex-grow p-4 md:p-8 overflow-y-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
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
  UserCheck,
  Home,
  Menu
} from '@lucide/vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const isSidebarOpen = ref(false);

watch(() => route.path, () => {
  isSidebarOpen.value = false;
});

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
