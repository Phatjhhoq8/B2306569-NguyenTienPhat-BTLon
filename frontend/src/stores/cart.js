import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: JSON.parse(localStorage.getItem('borrow_cart') || '[]'),
  }),
  getters: {
    totalItems: (state) => state.items.length,
    isEmpty: (state) => state.items.length === 0,
    hasBook: (state) => (bookId) => state.items.some(item => item._id === bookId),
  },
  actions: {
    addBook(book) {
      if (this.hasBook(book._id)) return;
      this.items.push(book);
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
      localStorage.setItem('borrow_cart', JSON.stringify(this.items));
    }
  }
});
