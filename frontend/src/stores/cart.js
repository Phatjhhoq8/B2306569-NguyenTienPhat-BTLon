import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: JSON.parse(localStorage.getItem('borrow_cart') || '[]'),
  }),
  getters: {
    totalItems: (state) => state.items.reduce((total, item) => total + (Number(item.soLuongMuon) || 1), 0),
    isEmpty: (state) => state.items.length === 0,
    hasBook: (state) => (bookId) => state.items.some(item => item._id === bookId),
  },
  actions: {
    normalizeQuantity(book, quantity) {
      const max = Math.max(1, Number(book.soLuongKhaDung) || 1);
      const parsed = Math.max(1, Number(quantity) || 1);
      return Math.min(parsed, max);
    },
    addBook(book, quantity = 1) {
      const existing = this.items.find(item => item._id === book._id);
      if (existing) {
        existing.soLuongMuon = this.normalizeQuantity(existing, (Number(existing.soLuongMuon) || 1) + quantity);
        this.saveCart();
        return;
      }
      this.items.push({
        ...book,
        soLuongMuon: this.normalizeQuantity(book, quantity),
      });
      this.saveCart();
    },
    updateQuantity(bookId, quantity) {
      const item = this.items.find(book => book._id === bookId);
      if (!item) return;
      item.soLuongMuon = this.normalizeQuantity(item, quantity);
      this.saveCart();
    },
    removeBook(bookId) {
      this.items = this.items.filter(item => item._id !== bookId);
      this.saveCart();
    },
    clearCart() {
      this.items = [];
      this.saveCart();
    },
    saveCart() {
      this.items = this.items.map(item => ({
        ...item,
        soLuongMuon: this.normalizeQuantity(item, item.soLuongMuon),
      }));
      localStorage.setItem('borrow_cart', JSON.stringify(this.items));
    }
  }
});
