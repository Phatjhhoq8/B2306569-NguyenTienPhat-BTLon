<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden font-sans">
    <!-- Decorative background elements -->
    <div class="absolute -top-40 -right-40 w-96 h-96 bg-primary rounded-full filter blur-[120px] opacity-20 animate-pulse"></div>
    <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500 rounded-full filter blur-[120px] opacity-10 animate-pulse"></div>

    <div class="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10 space-y-6">
      <div class="text-center space-y-3">
        <!-- Logo -->
        <div class="flex justify-center">
          <div class="bg-slate-800 p-3 rounded-2xl border border-slate-700">
            <img src="/src/assets/logo.jpg" alt="Logo" class="h-12 w-12 rounded-xl object-cover" />
          </div>
        </div>
        
        <h2 class="font-sans text-2xl font-extrabold tracking-wide text-white uppercase pt-2">
          {{ mode === 'login' ? 'CỔNG QUẢN TRỊ VIÊN' : 'ĐỔI MẬT KHẨU QUẢN TRỊ' }}
        </h2>
        <p class="text-xs text-slate-400 font-medium">
          {{ mode === 'login' ? 'Hệ thống mượn sách CTU eLibrary' : 'Nhập mã số nhân viên và mật khẩu hiện tại để đổi mật khẩu' }}
        </p>
      </div>

      <!-- Error Alert -->
      <div v-if="error" class="bg-red-950/50 text-red-400 border border-red-900/50 rounded-2xl p-3.5 text-xs font-semibold flex items-start space-x-2">
        <AlertTriangle class="h-5 w-5 flex-shrink-0 text-red-500" />
        <span class="leading-relaxed">{{ error }}</span>
      </div>

      <!-- Login Form -->
      <form v-if="mode === 'login'" class="space-y-5" @submit.prevent="handleLogin">
        <!-- Mã số nhân viên -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Mã số nhân viên</label>
          <div class="flex items-center space-x-3 bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 focus-within:border-primary transition-all">
            <Key class="h-4 w-4 text-slate-500" />
            <input 
              v-model="maSoNV" 
              type="text" 
              required 
              placeholder="Nhập mã số nhân viên" 
              class="w-full bg-transparent focus:outline-none text-sm font-semibold text-slate-200 placeholder-slate-600"
            />
          </div>
        </div>

        <!-- Mật khẩu -->
        <div class="space-y-1.5">
          <div class="flex justify-between items-center">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Mật khẩu bảo mật</label>
            <button 
              type="button"
              @click="changeMode('change')" 
              class="text-xs text-blue-400 hover:text-blue-300 font-bold transition-colors"
            >
              Đổi mật khẩu?
            </button>
          </div>
          <div class="flex items-center space-x-3 bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 focus-within:border-primary transition-all">
            <Lock class="h-4 w-4 text-slate-500" />
            <input 
              v-model="password" 
              type="password" 
              required 
              placeholder="••••••" 
              class="w-full bg-transparent focus:outline-none text-sm font-semibold text-slate-200 placeholder-slate-600"
            />
          </div>
        </div>

        <!-- Submit Button -->
        <button 
          type="submit" 
          :disabled="loading"
          class="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 text-sm tracking-wide mt-2"
        >
          <span v-if="loading">Đang xác thực thông tin...</span>
          <span v-else>Đăng nhập hệ thống</span>
        </button>
      </form>

      <!-- Change Password Form (Know Old Password) -->
      <form v-else class="space-y-5" @submit.prevent="handleChangePassword">
        <!-- Mã số nhân viên -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Mã số nhân viên</label>
          <div class="flex items-center space-x-3 bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 focus-within:border-primary transition-all">
            <Key class="h-4 w-4 text-slate-500" />
            <input 
              v-model="changeMaSoNV" 
              type="text" 
              required 
              placeholder="Ví dụ: NV001" 
              class="w-full bg-transparent focus:outline-none text-sm font-semibold text-slate-200 placeholder-slate-600"
            />
          </div>
        </div>

        <!-- Mật khẩu cũ -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Mật khẩu cũ</label>
          <div class="flex items-center space-x-3 bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 focus-within:border-primary transition-all">
            <Lock class="h-4 w-4 text-slate-500" />
            <input 
              v-model="oldPassword" 
              type="password" 
              required 
              placeholder="Nhập mật khẩu hiện tại" 
              class="w-full bg-transparent focus:outline-none text-sm font-semibold text-slate-200 placeholder-slate-600"
            />
          </div>
        </div>

        <!-- Mật khẩu mới -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Mật khẩu mới</label>
          <div class="flex items-center space-x-3 bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 focus-within:border-primary transition-all">
            <Lock class="h-4 w-4 text-slate-500" />
            <input 
              v-model="newPassword" 
              type="password" 
              required 
              placeholder="Tối thiểu 6 ký tự" 
              class="w-full bg-transparent focus:outline-none text-sm font-semibold text-slate-200 placeholder-slate-600"
            />
          </div>
        </div>

        <!-- Xác nhận mật khẩu mới -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Xác nhận mật khẩu mới</label>
          <div class="flex items-center space-x-3 bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 focus-within:border-primary transition-all">
            <Lock class="h-4 w-4 text-slate-500" />
            <input 
              v-model="confirmPassword" 
              type="password" 
              required 
              placeholder="Nhập lại mật khẩu mới" 
              class="w-full bg-transparent focus:outline-none text-sm font-semibold text-slate-200 placeholder-slate-600"
            />
          </div>
        </div>

        <button 
          type="submit" 
          :disabled="loading"
          class="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 text-sm tracking-wide"
        >
          <span v-if="loading">Đang cập nhật...</span>
          <span v-else>Đổi mật khẩu</span>
        </button>
        <button 
          type="button" 
          @click="changeMode('login')"
          class="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3.5 rounded-xl transition-all text-sm tracking-wide"
        >
          Hủy bỏ
        </button>
      </form>

      <!-- Back to Public Link -->
      <div class="text-center pt-2">
        <router-link to="/" class="text-xs text-slate-500 hover:text-slate-300 font-semibold transition-colors">
          &larr; Quay lại trang chủ độc giả
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { Key, Lock, AlertTriangle } from '@lucide/vue';
import { useToastStore } from '../../stores/toast';
import api from '../../services/api';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToastStore();

const mode = ref('login'); // 'login' | 'change'

const maSoNV = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

// State cho đổi mật khẩu
const changeMaSoNV = ref('');
const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

const changeMode = (newMode) => {
  mode.value = newMode;
  error.value = '';
  if (newMode === 'login') {
    password.value = '';
  } else if (newMode === 'change') {
    changeMaSoNV.value = maSoNV.value;
    oldPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
  }
};

const handleLogin = async () => {
  error.value = '';
  loading.value = true;
  try {
    await authStore.loginStaff(maSoNV.value.toUpperCase().trim(), password.value);
    router.push({ name: authStore.user?.mustChangePassword ? 'admin-change-password' : 'admin-dashboard' });
  } catch (err) {
    error.value = err.message || 'Mã nhân viên hoặc mật khẩu quản trị không đúng';
  } finally {
    loading.value = false;
  }
};

const handleChangePassword = async () => {
  error.value = '';
  if (!changeMaSoNV.value || !oldPassword.value || !newPassword.value || !confirmPassword.value) {
    error.value = 'Vui lòng nhập đầy đủ thông tin';
    return;
  }
  if (newPassword.value.length < 6) {
    error.value = 'Mật khẩu phải có tối thiểu 6 ký tự';
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Mật khẩu xác nhận không khớp!';
    return;
  }
  
  loading.value = true;
  try {
    const res = await api.post('/auth/staff/change-password', {
      maSoNV: changeMaSoNV.value,
      matKhauCu: oldPassword.value,
      matKhauMoi: newPassword.value
    });
    if (res.success) {
      toast.show('Đổi mật khẩu nhân viên thành công! Vui lòng đăng nhập lại.', 'success');
      maSoNV.value = changeMaSoNV.value;
      changeMode('login');
    }
  } catch (err) {
    error.value = err.message || 'Lỗi khi đổi mật khẩu';
  } finally {
    loading.value = false;
  }
};
</script>
