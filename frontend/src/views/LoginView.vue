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
        <h2 class="font-sans text-2xl font-extrabold tracking-wide text-white uppercase pt-2">ĐĂNG NHẬP ĐỘC GIẢ</h2>
        <p class="text-xs text-slate-400 font-medium">Truy cập tài khoản để mượn sách và nhận ưu đãi</p>
      </div>

      <!-- Error Alert -->
      <div v-if="error" class="bg-red-950/50 text-red-400 border border-red-900/50 rounded-2xl p-3.5 text-xs font-semibold flex items-start space-x-2">
        <AlertTriangle class="h-5 w-5 flex-shrink-0 text-red-500" />
        <span class="leading-relaxed">{{ error }}</span>
      </div>

      <!-- Form -->
      <form class="space-y-5" @submit.prevent="handleLogin">
        <!-- Tài khoản -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Tài khoản</label>
          <div class="flex items-center space-x-3 bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 focus-within:border-primary transition-all">
            <User class="h-4 w-4 text-slate-500" />
            <input 
              v-model="email" 
              type="text" 
              required 
              placeholder="Email hoặc Số điện thoại" 
              class="w-full bg-transparent focus:outline-none text-sm font-semibold text-slate-200 placeholder-slate-600"
            />
          </div>
        </div>

        <!-- Mật khẩu -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Mật khẩu</label>
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
          <span v-if="loading">Đang đăng nhập...</span>
          <span v-else>Đăng nhập</span>
        </button>
      </form>

      <!-- Bottom Links -->
      <div class="flex flex-col items-center space-y-3 pt-4 border-t border-slate-800">
        <div class="text-sm font-semibold text-center">
          <span class="text-slate-400">Chưa có tài khoản?</span>
          <router-link to="/register" class="text-primary hover:underline ml-1">Đăng ký độc giả</router-link>
        </div>
        <router-link to="/admin/login" class="text-xs text-slate-500 hover:text-slate-300 font-semibold transition-colors">
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
import { User, Lock, AlertTriangle } from '@lucide/vue';

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
