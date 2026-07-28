<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden font-sans">
    <!-- Decorative background elements -->
    <div class="absolute -top-40 -right-40 w-96 h-96 bg-primary rounded-full filter blur-[120px] opacity-20 animate-pulse"></div>
    <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500 rounded-full filter blur-[120px] opacity-10 animate-pulse"></div>

    <div class="max-w-xl w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10 space-y-6">
      <div class="text-center space-y-3">
        <h2 class="font-sans text-2xl font-extrabold tracking-wide text-white uppercase pt-2">ĐĂNG KÝ ĐỘC GIẢ</h2>
        <p class="text-xs text-slate-400 font-medium">Trở thành hội viên để bắt đầu mượn sách</p>
      </div>

      <!-- Error Alert -->
      <div v-if="error" class="bg-red-950/50 text-red-400 border border-red-900/50 rounded-2xl p-3.5 text-xs font-semibold flex items-start space-x-2">
        <AlertTriangle class="h-5 w-5 flex-shrink-0 text-red-500" />
        <span class="leading-relaxed">{{ error }}</span>
      </div>

      <!-- Form -->
      <form class="space-y-4" @submit.prevent="handleRegister">
        <div class="grid grid-cols-2 gap-4">
          <!-- Họ lót -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Họ lót</label>
            <input 
              v-model="hoLot" 
              type="text" 
              required 
              placeholder="Nguyễn Văn" 
              class="w-full bg-slate-950 px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-primary text-sm font-semibold text-slate-200 placeholder-slate-600 transition-all"
            />
          </div>
          <!-- Tên -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Tên</label>
            <input 
              v-model="ten" 
              type="text" 
              required 
              placeholder="Hùng" 
              class="w-full bg-slate-950 px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-primary text-sm font-semibold text-slate-200 placeholder-slate-600 transition-all"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Email -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</label>
            <input 
              v-model="email" 
              type="email" 
              required 
              placeholder="hung@gmail.com" 
              class="w-full bg-slate-950 px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-primary text-sm font-semibold text-slate-200 placeholder-slate-600 transition-all"
            />
          </div>
          <!-- Số điện thoại -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Số điện thoại</label>
            <input 
              v-model="dienThoai" 
              type="text" 
              required 
              placeholder="0912345678" 
              class="w-full bg-slate-950 px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-primary text-sm font-semibold text-slate-200 placeholder-slate-600 transition-all"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Ngày sinh -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Ngày sinh</label>
            <input 
              v-model="ngaySinh" 
              type="date" 
              required 
              class="w-full bg-slate-950 px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-primary text-sm font-semibold text-slate-200 transition-all"
            />
          </div>
          <!-- Giới tính -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Giới tính</label>
            <select 
              v-model="gioiTinh" 
              class="w-full bg-slate-950 px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-primary text-sm font-semibold text-slate-200 transition-all"
            >
              <option value="Nam" class="bg-slate-900 text-slate-200">Nam</option>
              <option value="Nữ" class="bg-slate-900 text-slate-200">Nữ</option>
              <option value="Khác" class="bg-slate-900 text-slate-200">Khác</option>
            </select>
          </div>
        </div>

        <!-- Địa chỉ -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Địa chỉ</label>
          <input 
            v-model="diachi" 
            type="text" 
            required 
            placeholder="Số 1 Lý Tự Trọng, Cần Thơ" 
            class="w-full bg-slate-950 px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-primary text-sm font-semibold text-slate-200 placeholder-slate-600 transition-all"
          />
        </div>

        <!-- Mật khẩu -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Mật khẩu</label>
          <input 
            v-model="password" 
            type="password" 
            required 
            placeholder="Tối thiểu 6 ký tự" 
            class="w-full bg-slate-950 px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-primary text-sm font-semibold text-slate-200 placeholder-slate-600 transition-all"
          />
        </div>

        <button 
          type="submit" 
          :disabled="loading"
          class="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 text-sm tracking-wide mt-2"
        >
          <span v-if="loading">Đang đăng ký...</span>
          <span v-else>Đăng ký hội viên</span>
        </button>
      </form>

      <div class="text-center text-sm font-semibold border-t border-slate-800 pt-4">
        <span class="text-slate-400">Đã có tài khoản?</span>
        <router-link to="/login" class="text-primary hover:underline ml-1">Đăng nhập</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { AlertTriangle } from '@lucide/vue';

const router = useRouter();
const authStore = useAuthStore();

const hoLot = ref('');
const ten = ref('');
const email = ref('');
const dienThoai = ref('');
const ngaySinh = ref('');
const gioiTinh = ref('Nam');
const diachi = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const handleRegister = async () => {
  error.value = '';
  loading.value = true;
  try {
    const payload = {
      hoLot: hoLot.value,
      ten: ten.value,
      email: email.value,
      matKhau: password.value,
      ngaySinh: ngaySinh.value,
      diachi: diachi.value,
      dienThoai: dienThoai.value,
      gioiTinh: gioiTinh.value
    };
    const res = await authStore.registerReader(payload);
    if (res.success) {
      // Đăng nhập luôn hoặc điều hướng sang trang login
      await authStore.loginReader(email.value, password.value);
      router.push({ name: 'home' });
    }
  } catch (err) {
    error.value = err.message || 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.';
  } finally {
    loading.value = false;
  }
};
</script>
