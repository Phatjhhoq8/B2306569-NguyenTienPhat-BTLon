<template>
  <div class="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50">
    <div class="max-w-xl w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
      <div class="text-center space-y-2">
        <h2 class="font-serif text-3xl font-bold text-slate-900">ĐĂNG KÝ ĐỘC GIẢ</h2>
        <p class="text-sm text-slate-500 font-medium">Trở thành hội viên để bắt đầu mượn sách</p>
      </div>

      <!-- Error Alert -->
      <div v-if="error" class="bg-red-50 text-red-700 border border-red-100 rounded-xl p-3 text-sm font-medium flex items-center">
        <AlertTriangle class="h-5 w-5 mr-2 flex-shrink-0" />
        <span>{{ error }}</span>
      </div>

      <!-- Form -->
      <form class="space-y-4" @submit.prevent="handleRegister">
        <div class="grid grid-cols-2 gap-4">
          <!-- Họ lót -->
          <div class="space-y-1">
            <label class="text-xs font-semibold text-slate-600 uppercase">Họ lót</label>
            <input 
              v-model="hoLot" 
              type="text" 
              required 
              placeholder="Nguyễn Văn" 
              class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none text-sm font-medium"
            />
          </div>
          <!-- Tên -->
          <div class="space-y-1">
            <label class="text-xs font-semibold text-slate-600 uppercase">Tên</label>
            <input 
              v-model="ten" 
              type="text" 
              required 
              placeholder="Hùng" 
              class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none text-sm font-medium"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Email -->
          <div class="space-y-1">
            <label class="text-xs font-semibold text-slate-600 uppercase">Email</label>
            <input 
              v-model="email" 
              type="email" 
              required 
              placeholder="hung@gmail.com" 
              class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none text-sm font-medium"
            />
          </div>
          <!-- Số điện thoại -->
          <div class="space-y-1">
            <label class="text-xs font-semibold text-slate-600 uppercase">Số điện thoại</label>
            <input 
              v-model="dienThoai" 
              type="text" 
              required 
              placeholder="0912345678" 
              class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none text-sm font-medium"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Ngày sinh -->
          <div class="space-y-1">
            <label class="text-xs font-semibold text-slate-600 uppercase">Ngày sinh</label>
            <input 
              v-model="ngaySinh" 
              type="date" 
              required 
              class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none text-sm font-medium"
            />
          </div>
          <!-- Giới tính -->
          <div class="space-y-1">
            <label class="text-xs font-semibold text-slate-600 uppercase">Giới tính</label>
            <select 
              v-model="gioiTinh" 
              class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none text-sm font-medium"
            >
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
        </div>

        <!-- Địa chỉ -->
        <div class="space-y-1">
          <label class="text-xs font-semibold text-slate-600 uppercase">Địa chỉ</label>
          <input 
            v-model="diachi" 
            type="text" 
            required 
            placeholder="Số 1 Lý Tự Trọng, Cần Thơ" 
            class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none text-sm font-medium"
          />
        </div>

        <!-- Mật khẩu -->
        <div class="space-y-1">
          <label class="text-xs font-semibold text-slate-600 uppercase">Mật khẩu</label>
          <input 
            v-model="password" 
            type="password" 
            required 
            placeholder="Tối thiểu 6 ký tự" 
            class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none text-sm font-medium"
          />
        </div>

        <button 
          type="submit" 
          :disabled="loading"
          class="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <span v-if="loading">Đang đăng ký...</span>
          <span v-else>Đăng ký hội viên</span>
        </button>
      </form>

      <div class="text-center text-sm font-medium border-t border-slate-100 pt-4">
        <span class="text-slate-500">Đã có tài khoản?</span>
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
