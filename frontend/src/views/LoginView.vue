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
          {{ mode === 'login' ? 'ĐĂNG NHẬP ĐỘC GIẢ' : (mode === 'forgot' ? 'QUÊN MẬT KHẨU' : (mode === 'otp' ? 'XÁC NHẬN MÃ OTP' : 'MẬT KHẨU MỚI')) }}
        </h2>
        <p class="text-xs text-slate-400 font-medium">
          {{ mode === 'login' ? 'Truy cập tài khoản để mượn sách và nhận ưu đãi' : (mode === 'forgot' ? 'Nhập email tài khoản để nhận mã xác nhận đổi mật khẩu' : (mode === 'otp' ? 'Nhập mã xác nhận vừa được gửi đến email (mô phỏng)' : 'Thiết lập mật khẩu mới cho tài khoản của bạn')) }}
        </p>
      </div>

      <!-- Error Alert -->
      <div v-if="error" class="bg-red-950/50 text-red-400 border border-red-900/50 rounded-2xl p-3.5 text-xs font-semibold flex items-start space-x-2">
        <AlertTriangle class="h-5 w-5 flex-shrink-0 text-red-500" />
        <span class="leading-relaxed">{{ error }}</span>
      </div>

      <!-- Login Mode -->
      <form v-if="mode === 'login'" class="space-y-5" @submit.prevent="handleLogin">
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
          <div class="flex justify-between items-center">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Mật khẩu</label>
            <button 
              type="button"
              @click="changeMode('forgot')" 
              class="text-xs text-primary hover:underline font-semibold"
            >
              Quên mật khẩu?
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
          <span v-if="loading">Đang đăng nhập...</span>
          <span v-else>Đăng nhập</span>
        </button>
      </form>

      <!-- Forgot Mode -->
      <form v-else-if="mode === 'forgot'" class="space-y-5" @submit.prevent="handleSendOtp">
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Email tài khoản</label>
          <div class="flex items-center space-x-3 bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 focus-within:border-primary transition-all">
            <Mail class="h-4 w-4 text-slate-500" />
            <input 
              v-model="forgotEmail" 
              type="email" 
              required 
              placeholder="Nhập địa chỉ email của bạn" 
              class="w-full bg-transparent focus:outline-none text-sm font-semibold text-slate-200 placeholder-slate-600"
            />
          </div>
        </div>

        <button 
          type="submit" 
          :disabled="loading"
          class="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 text-sm tracking-wide"
        >
          <span v-if="loading">Đang gửi mã...</span>
          <span v-else>Gửi mã xác nhận</span>
        </button>
        <button 
          type="button" 
          @click="changeMode('login')"
          class="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3.5 rounded-xl transition-all text-sm tracking-wide"
        >
          Quay lại đăng nhập
        </button>
      </form>

      <!-- OTP Verify Mode -->
      <form v-else-if="mode === 'otp'" class="space-y-5" @submit.prevent="handleVerifyOtp">
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Mã xác nhận (OTP)</label>
          <div class="flex items-center space-x-3 bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 focus-within:border-primary transition-all">
            <Lock class="h-4 w-4 text-slate-500" />
            <input 
              v-model="inputOtp" 
              type="text" 
              required 
              :placeholder="'Nhập mã OTP (Mã của bạn: ' + generatedOtp + ')'" 
              class="w-full bg-transparent focus:outline-none text-sm font-semibold text-slate-200 placeholder-slate-500"
            />
          </div>
        </div>

        <button 
          type="submit" 
          class="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 text-sm tracking-wide"
        >
          Xác nhận mã OTP
        </button>
        <button 
          type="button" 
          @click="changeMode('forgot')"
          class="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3.5 rounded-xl transition-all text-sm tracking-wide"
        >
          Quay lại nhập email
        </button>
      </form>

      <!-- Reset Password Mode -->
      <form v-else-if="mode === 'reset'" class="space-y-5" @submit.prevent="handleResetPassword">
        <!-- Mật khẩu mới -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Mật khẩu mới</label>
          <div class="flex items-center space-x-3 bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 focus-within:border-primary transition-all">
            <Lock class="h-4 w-4 text-slate-500" />
            <input 
              v-model="newPassword" 
              type="password" 
              required 
              placeholder="Nhập mật khẩu mới" 
              class="w-full bg-transparent focus:outline-none text-sm font-semibold text-slate-200 placeholder-slate-600"
            />
          </div>
        </div>

        <!-- Xác nhận mật khẩu mới -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Xác nhận mật khẩu</label>
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

      <!-- Bottom Links -->
      <div class="flex flex-col items-center space-y-3 pt-4 border-t border-slate-800">
        <div class="text-sm font-semibold text-center">
          <span class="text-slate-400">Chưa có tài khoản?</span>
          <router-link to="/register" class="text-primary hover:underline ml-1">Đăng ký độc giả</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { User, Lock, AlertTriangle, Mail } from '@lucide/vue';
import { useToastStore } from '../stores/toast';
import api from '../services/api';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToastStore();

const mode = ref('login'); // 'login' | 'forgot' | 'otp' | 'reset'

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

// State cho quên mật khẩu
const forgotEmail = ref('');
const generatedOtp = ref('');
const inputOtp = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

const changeMode = (newMode) => {
  mode.value = newMode;
  error.value = '';
  if (newMode === 'login') {
    password.value = '';
  } else if (newMode === 'forgot') {
    forgotEmail.value = email.value;
  } else if (newMode === 'otp') {
    inputOtp.value = '';
  } else if (newMode === 'reset') {
    newPassword.value = '';
    confirmPassword.value = '';
  }
};

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

const handleSendOtp = async () => {
  error.value = '';
  if (!forgotEmail.value) {
    error.value = 'Vui lòng nhập địa chỉ email';
    return;
  }
  loading.value = true;
  try {
    generatedOtp.value = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Đợi 800ms mô phỏng gửi email thật
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    toast.show('Mã xác nhận (OTP) đã được gửi (mô phỏng)!', 'success');
    changeMode('otp');
  } catch (err) {
    error.value = err.message || 'Có lỗi xảy ra khi gửi mã';
  } finally {
    loading.value = false;
  }
};

const handleVerifyOtp = () => {
  error.value = '';
  if (!inputOtp.value) {
    error.value = 'Vui lòng nhập mã xác nhận';
    return;
  }
  if (inputOtp.value.trim() !== generatedOtp.value) {
    error.value = 'Mã xác nhận không đúng, vui lòng kiểm tra lại!';
    return;
  }
  changeMode('reset');
};

const handleResetPassword = async () => {
  error.value = '';
  if (!newPassword.value || !confirmPassword.value) {
    error.value = 'Vui lòng nhập đầy đủ mật khẩu';
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
    const res = await api.post('/auth/reader/reset-password', {
      email: forgotEmail.value,
      matKhauMoi: newPassword.value
    });
    if (res.success) {
      toast.show('Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.', 'success');
      email.value = forgotEmail.value;
      changeMode('login');
    }
  } catch (err) {
    error.value = err.message || 'Lỗi khi đặt lại mật khẩu';
  } finally {
    loading.value = false;
  }
};
</script>
