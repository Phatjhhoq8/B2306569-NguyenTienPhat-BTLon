import { defineStore } from 'pinia';
import api from '../services/api';
import { useAuthStore } from './auth';

const AGENT_API_BASE = import.meta.env.VITE_AGENT_API_URL || 'http://localhost:8088/api';

export const useChatStore = defineStore('chat', {
  state: () => ({
    isOpen: false,
    loading: false,
    state: {},
    messages: [],
  }),
  actions: {
    toggleChat() {
      this.isOpen = !this.isOpen;
    },
    closeChat() {
      this.isOpen = false;
    },
    newConversation() {
      this.state = {};
      this.messages = [];
    },
    clearSession() {
      this.newConversation();
      this.isOpen = false;
    },
    async fetchBorrowedBooks() {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated || !authStore.isReader) return [];

      try {
        const res = await api.get('/borrowing/my-receipts');
        if (!res.success) return [];
        const receipts = Array.isArray(res.data) ? res.data : [];
        const seen = new Set();
        const books = [];
        receipts.forEach((receipt) => {
          (receipt.chiTietMuon || []).forEach((item) => {
            const title = item.sach?.dauSach || item.dauSach || item.sach;
            if (!title || !title._id || seen.has(title._id)) return;
            seen.add(title._id);
            books.push({
              _id: title._id,
              tenSach: title.tenSach,
              moTa: title.moTa,
              theLoai: title.theLoai,
              tacGia: title.tacGia,
              hinhAnh: title.hinhAnh,
            });
          });
        });
        return books.slice(-30);
      } catch (error) {
        return [];
      }
    },
    async sendMessage(content) {
      const text = content.trim();
      if (!text || this.loading) return;

      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) {
        this.messages.push({ role: 'assistant', content: 'Bạn cần đăng nhập để sử dụng trợ lý AI.' });
        return;
      }

      this.messages.push({ role: 'user', content: text });
      this.loading = true;

      try {
        const borrowedBooks = await this.fetchBorrowedBooks();
        const recentMessages = this.messages
          .slice(0, -1)
          .slice(-4)
          .map(({ role, content }) => ({ role, content }));
        const compactState = {
          ...this.state,
          messages: recentMessages,
        };

        const response = await fetch(`${AGENT_API_BASE}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            raw_query: text,
            user_id: authStore.user?._id || authStore.user?.maDocGia || authStore.user?.maSoNV,
            state: compactState,
            borrowed_books: borrowedBooks,
          }),
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Agent không phản hồi được');
        }
        this.state = data.state || {};
        this.messages.push({
          role: 'assistant',
          content: data.draft_answer || 'Mình chưa có câu trả lời phù hợp.',
          intent: data.intent,
          suggested_books: data.suggested_books || [],
          external_suggestions: data.external_suggestions || [],
          membership_plans: data.membership_plans || [],
          plan_comparison: data.plan_comparison || null,
          action: data.action || null,
          ui_payload: data.ui_payload || null,
          selectedBookIds: [],
          selectedPlanId: null,
        });
      } catch (error) {
        this.messages.push({ role: 'assistant', content: `Xin lỗi, hiện mình chưa kết nối được agent: ${error.message}` });
      } finally {
        this.loading = false;
      }
    },
  },
});
