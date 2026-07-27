import { defineStore } from 'pinia';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
    error: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
    isStaff: (state) => state.user?.role === 'STAFF' || !!state.user?.maSoNV,
    isReader: (state) => state.user?.role === 'READER' || !!state.user?.maDocGia,
    isAdmin: (state) => (state.user?.role === 'STAFF' || !!state.user?.maSoNV) && state.user?.chucVu === 'QUAN_LY',
    isLibrarian: (state) => (state.user?.role === 'STAFF' || !!state.user?.maSoNV) && state.user?.chucVu === 'THU_THU',
  },
  actions: {
    async fetchUser() {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.get('/auth/me');
        if (res.success) {
          const u = res.data.user;
          if (u) {
            u.role = u.maSoNV ? 'STAFF' : 'READER';
          }
          this.user = u;
        }
      } catch (err) {
        this.user = null;
        // Độc giả chưa đăng nhập, không xem là lỗi nghiêm trọng ở client
      } finally {
        this.loading = false;
      }
    },
    async loginReader(email, matKhau) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.post('/auth/reader/login', { email, matKhau });
        if (res.success) {
          const u = res.data.reader;
          if (u) u.role = 'READER';
          this.user = u;
          return { success: true };
        }
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async loginStaff(maSoNV, matKhau) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.post('/auth/staff/login', { maSoNV, matKhau });
        if (res.success) {
          const u = res.data.staff;
          if (u) u.role = 'STAFF';
          this.user = u;
          return { success: true };
        }
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async registerReader(payload) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.post('/auth/reader/register', payload);
        return res;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async logout() {
      try {
        await api.post('/auth/logout');
      } catch (err) {
        console.error('Logout error:', err);
      } finally {
        this.user = null;
      }
    }
  }
});
