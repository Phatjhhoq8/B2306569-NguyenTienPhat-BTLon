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
              @blur="validateField('hoLot')"
              @input="errors.hoLot = ''"
              class="w-full bg-slate-950 px-3 py-2.5 rounded-xl border focus:outline-none text-sm font-semibold text-slate-200 placeholder-slate-600 transition-all"
              :class="errors.hoLot ? 'border-red-500/80 focus:border-red-500' : 'border-slate-800 focus:border-primary'"
            />
            <span v-if="errors.hoLot" class="text-[10px] text-red-500 font-semibold mt-1 block">
              {{ errors.hoLot }}
            </span>
          </div>
          <!-- Tên -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Tên</label>
            <input 
              v-model="ten" 
              type="text" 
              required 
              placeholder="Hùng" 
              @blur="validateField('ten')"
              @input="errors.ten = ''"
              class="w-full bg-slate-950 px-3 py-2.5 rounded-xl border focus:outline-none text-sm font-semibold text-slate-200 placeholder-slate-600 transition-all"
              :class="errors.ten ? 'border-red-500/80 focus:border-red-500' : 'border-slate-800 focus:border-primary'"
            />
            <span v-if="errors.ten" class="text-[10px] text-red-500 font-semibold mt-1 block">
              {{ errors.ten }}
            </span>
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
              @blur="validateField('email')"
              @input="errors.email = ''"
              class="w-full bg-slate-950 px-3 py-2.5 rounded-xl border focus:outline-none text-sm font-semibold text-slate-200 placeholder-slate-600 transition-all"
              :class="errors.email ? 'border-red-500/80 focus:border-red-500' : 'border-slate-800 focus:border-primary'"
            />
            <span v-if="errors.email" class="text-[10px] text-red-500 font-semibold mt-1 block">
              {{ errors.email }}
            </span>
          </div>
          <!-- Số điện thoại -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Số điện thoại</label>
            <input 
              v-model="dienThoai" 
              type="text" 
              required 
              placeholder="0912345678" 
              @blur="validateField('dienThoai')"
              @input="errors.dienThoai = ''"
              class="w-full bg-slate-950 px-3 py-2.5 rounded-xl border focus:outline-none text-sm font-semibold text-slate-200 placeholder-slate-600 transition-all"
              :class="errors.dienThoai ? 'border-red-500/80 focus:border-red-500' : 'border-slate-800 focus:border-primary'"
            />
            <span v-if="errors.dienThoai" class="text-[10px] text-red-500 font-semibold mt-1 block leading-relaxed">
              {{ errors.dienThoai }}
            </span>
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
              @blur="validateField('ngaySinh')"
              @input="errors.ngaySinh = ''"
              class="w-full bg-slate-950 px-3 py-2.5 rounded-xl border focus:outline-none text-sm font-semibold text-slate-200 transition-all"
              :class="errors.ngaySinh ? 'border-red-500/80 focus:border-red-500' : 'border-slate-800 focus:border-primary'"
            />
            <span v-if="errors.ngaySinh" class="text-[10px] text-red-500 font-semibold mt-1 block">
              {{ errors.ngaySinh }}
            </span>
          </div>
          <!-- Giới tính -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Giới tính</label>
            <select 
              v-model="gioiTinh" 
              class="w-full bg-slate-950 px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-primary text-sm font-semibold text-slate-200 transition-all"
            >
              <option value="NAM" class="bg-slate-900 text-slate-200">Nam</option>
              <option value="NU" class="bg-slate-900 text-slate-200">Nữ</option>
              <option value="KHAC" class="bg-slate-900 text-slate-200">Khác</option>
            </select>
          </div>
        </div>

        <!-- Địa chỉ -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Địa chỉ</label>
          <input 
            v-model="diachi" 
            type="text" 
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
            @blur="validateField('password')"
            @input="errors.password = ''"
            class="w-full bg-slate-950 px-3 py-2.5 rounded-xl border focus:outline-none text-sm font-semibold text-slate-200 placeholder-slate-600 transition-all"
            :class="errors.password ? 'border-red-500/80 focus:border-red-500' : 'border-slate-800 focus:border-primary'"
          />
          <span v-if="errors.password" class="text-[10px] text-red-500 font-semibold mt-1 block">
            {{ errors.password }}
          </span>
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
const gioiTinh = ref('NAM');
const diachi = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const errors = ref({
  hoLot: '',
  ten: '',
  email: '',
  dienThoai: '',
  ngaySinh: '',
  password: ''
});

const validateField = (field) => {
  errors.value[field] = '';
  
  if (field === 'hoLot') {
    if (!hoLot.value.trim()) {
      errors.value.hoLot = 'Họ lót là bắt buộc';
    }
  }
  
  if (field === 'ten') {
    if (!ten.value.trim()) {
      errors.value.ten = 'Tên độc giả là bắt buộc';
    }
  }
  
  if (field === 'email') {
    if (!email.value.trim()) {
      errors.value.email = 'Email là bắt buộc';
    } else {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
      if (!emailRegex.test(email.value)) {
        errors.value.email = 'Email không hợp lệ';
      }
    }
  }
  
  if (field === 'dienThoai') {
    if (!dienThoai.value.trim()) {
      errors.value.dienThoai = 'Số điện thoại là bắt buộc';
    } else {
      const phoneRegex = /^0[0-9]{9}$/;
      if (!phoneRegex.test(dienThoai.value)) {
        errors.value.dienThoai = 'Số điện thoại phải bắt đầu bằng số 0 và có đúng 10 chữ số';
      }
    }
  }
  
  if (field === 'ngaySinh') {
    if (!ngaySinh.value) {
      errors.value.ngaySinh = 'Ngày sinh là bắt buộc';
    } else {
      const birthDate = new Date(ngaySinh.value);
      const now = new Date();
      const minDate = new Date();
      minDate.setFullYear(now.getFullYear() - 150);
      
      if (birthDate > now) {
        errors.value.ngaySinh = 'Ngày sinh không thể là ngày trong tương lai';
      } else if (birthDate < minDate) {
        errors.value.ngaySinh = 'Ngày sinh không được vượt quá 150 năm so với hiện tại';
      }
    }
  }

  
  if (field === 'password') {
    if (!password.value) {
      errors.value.password = 'Mật khẩu là bắt buộc';
    } else if (password.value.length < 6) {
      errors.value.password = 'Mật khẩu phải có tối thiểu 6 ký tự';
    }
  }
};

const handleRegister = async () => {
  error.value = '';
  
  // Validate toàn bộ các trường trước khi submit
  validateField('hoLot');
  validateField('ten');
  validateField('email');
  validateField('dienThoai');
  validateField('ngaySinh');
  validateField('password');

  const hasErrors = Object.values(errors.value).some(err => err !== '');
  if (hasErrors) {
    error.value = 'Vui lòng kiểm tra lại thông tin điền trong form.';
    return;
  }

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
