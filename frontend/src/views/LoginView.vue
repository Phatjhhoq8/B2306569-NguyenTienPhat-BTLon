<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50 font-sans">
    <div class="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
      <div class="text-center space-y-2">
        <!-- Logo -->
        <div class="flex justify-center">
          <div class="bg-slate-50 p-2 rounded-2xl border border-slate-100">
            <img src="/src/assets/logo.jpg" alt="Logo" class="h-10 w-10 rounded-xl object-cover" />
          </div>
        </div>
        <h2 class="font-sans text-2xl md:text-3xl font-extrabold text-slate-900">ĐĂNG NHẬP ĐỘC GIẢ</h2>
        <p class="text-sm text-slate-500 font-medium">Truy cập tài khoản để mượn sách và nhận ưu đãi</p>
      </div>

      <!-- Error Alert -->
      <div v-if="error" class="bg-red-50 text-red-700 border border-red-100 rounded-xl p-3 text-sm font-medium flex items-center">
        <AlertTriangle class="h-5 w-5 mr-2 flex-shrink-0" />
        <span>{{ error }}</span>
      </div>

      <!-- Form -->
      <form class="space-y-4" @submit.prevent="handleLogin">
        <!-- Địa chỉ Email -->
        <div class="space-y-1">
          <label class="text-xs font-semibold text-slate-600 uppercase">Địa chỉ Email</label>
          <div class="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <Mail class="h-4 w-4 text-slate-400" />
            <input 
              v-model="email" 
              type="email" 
              required 
              placeholder="example@gmail.com" 
              class="w-full bg-transparent focus:outline-none text-sm font-medium"
            />
          </div>
        </div>

        <!-- Mật khẩu -->
        <div class="space-y-1">
          <label class="text-xs font-semibold text-slate-600 uppercase">Mật khẩu</label>
          <div class="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <Lock class="h-4 w-4 text-slate-400" />
            <input 
              v-model="password" 
              type="password" 
              required 
              placeholder="••••••" 
              class="w-full bg-transparent focus:outline-none text-sm font-medium"
            />
          </div>
        </div>

        <!-- Submit Button -->
        <button 
          type="submit" 
          :disabled="loading"
          class="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <span v-if="loading">Đang đăng nhập...</span>
          <span v-else>Đăng nhập</span>
        </button>
      </form>

      <!-- Bottom Links -->
      <div class="flex flex-col items-center space-y-2 pt-2 border-t border-slate-100">
        <div class="text-sm font-medium text-center">
          <span class="text-slate-500">Chưa có tài khoản?</span>
          <router-link to="/register" class="text-primary hover:underline ml-1">Đăng ký độc giả</router-link>
        </div>
        <router-link to="/admin/login" class="text-xs text-slate-400 hover:text-slate-600 transition-colors">
          Cổng đăng nhập dành cho thủ thư & quản trị &rarr;
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { Mail, Lock, AlertTriangle } from '@lucide/vue';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const handleLogin = async () => {
  error.value = '';
  loading.value = true;
  try {
    await authStore.loginReader(email.value, password.value);
    router.push({ name: 'home' });
  } catch (err) {
    error.value = err.message || 'Tài khoản hoặc mật khẩu không chính xác';
  } finally {
    loading.value = false;
  }
};
</script>
