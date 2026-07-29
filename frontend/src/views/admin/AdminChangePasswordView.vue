<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden font-sans">
    <div class="absolute -top-40 -right-40 w-96 h-96 bg-primary rounded-full blur-[120px] opacity-20"></div>
    <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500 rounded-full blur-[120px] opacity-10"></div>

    <div class="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10 space-y-6">
      <div class="space-y-3 text-center">
        <div class="mx-auto h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-400/20 flex items-center justify-center">
          <ShieldCheck class="h-7 w-7 text-amber-300" />
        </div>
        <h1 class="text-2xl font-extrabold tracking-wide text-white uppercase">Đổi mật khẩu</h1>
        <p class="text-xs text-slate-400 font-medium leading-relaxed">
          {{ authStore.user?.mustChangePassword ? 'Mật khẩu hiện tại là mật khẩu dùng một lần. Vui lòng đổi mật khẩu để tiếp tục sử dụng hệ thống quản trị.' : 'Cập nhật mật khẩu tài khoản nhân viên để bảo vệ quyền truy cập quản trị.' }}
        </p>
      </div>

      <div v-if="error" class="bg-red-950/50 text-red-400 border border-red-900/50 rounded-2xl p-3.5 text-xs font-semibold">
        {{ error }}
      </div>

      <form class="space-y-4" @submit.prevent="submit">
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Mật khẩu hiện tại</label>
          <input v-model="form.matKhauCu" type="password" required class="w-full bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 text-sm font-semibold text-slate-200 focus:outline-none focus:border-primary" />
        </div>

        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Mật khẩu mới</label>
          <input v-model="form.matKhauMoi" type="password" required minlength="6" class="w-full bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 text-sm font-semibold text-slate-200 focus:outline-none focus:border-primary" />
        </div>

        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Xác nhận mật khẩu mới</label>
          <input v-model="form.xacNhanMatKhau" type="password" required minlength="6" class="w-full bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 text-sm font-semibold text-slate-200 focus:outline-none focus:border-primary" />
        </div>

        <button type="submit" :disabled="loading" class="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-all shadow-lg disabled:opacity-50 text-sm tracking-wide">
          {{ loading ? 'Đang cập nhật...' : 'Đổi mật khẩu và tiếp tục' }}
        </button>
      </form>

      <button @click="logout" class="w-full text-xs text-slate-500 hover:text-slate-300 font-semibold transition-colors">
        Đăng xuất
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ShieldCheck } from '@lucide/vue';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const error = ref('');
const form = reactive({
  matKhauCu: '',
  matKhauMoi: '',
  xacNhanMatKhau: ''
});

const submit = async () => {
  error.value = '';
  if (form.matKhauMoi !== form.xacNhanMatKhau) {
    error.value = 'Xác nhận mật khẩu mới không khớp';
    return;
  }
  if (form.matKhauMoi === form.matKhauCu) {
    error.value = 'Mật khẩu mới phải khác mật khẩu hiện tại';
    return;
  }

  loading.value = true;
  try {
    await authStore.changeStaffPassword({ ...form });
    router.push({ name: 'admin-dashboard' });
  } catch (err) {
    error.value = err.message || 'Không thể đổi mật khẩu';
  } finally {
    loading.value = false;
  }
};

const logout = async () => {
  await authStore.logout();
  router.push({ name: 'admin-login' });
};
</script>
