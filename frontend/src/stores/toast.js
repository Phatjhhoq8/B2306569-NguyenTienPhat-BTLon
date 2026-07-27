import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useToastStore = defineStore('toast', () => {
  const isVisible = ref(false);
  const message = ref('');
  const type = ref('success'); // 'success' | 'error'
  let timeoutId = null;

  const show = (msg, toastType = 'success') => {
    message.value = msg;
    type.value = toastType;
    isVisible.value = true;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      isVisible.value = false;
    }, 3000); // Tự động ẩn sau 3 giây
  };

  return {
    isVisible,
    message,
    type,
    show
  };
});
