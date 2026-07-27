<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 bg-slate-900/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-300"
  >
    <div 
      class="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-150 transform scale-100 transition-all duration-300"
    >
      <div class="flex items-center space-x-3 text-amber-500">
        <div class="bg-amber-50 p-2.5 rounded-xl">
          <HelpCircle class="h-6 w-6" />
        </div>
        <h3 class="font-sans font-extrabold text-slate-900 text-sm uppercase tracking-wide">
          {{ title || 'Xác nhận hành động' }}
        </h3>
      </div>
      
      <p class="text-slate-600 text-xs font-bold leading-relaxed">
        {{ message }}
      </p>
      
      <div class="flex space-x-3 pt-2">
        <button 
          @click="cancel"
          class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold py-2.5 rounded-xl text-xs transition-colors"
        >
          {{ cancelText || 'Hủy bỏ' }}
        </button>
        <button 
          @click="confirm"
          class="flex-1 bg-primary hover:bg-primary-dark text-white font-extrabold py-2.5 rounded-xl text-xs transition-all shadow-md"
        >
          {{ confirmText || 'Đồng ý' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { HelpCircle } from '@lucide/vue';

const isOpen = ref(false);
const title = ref('');
const message = ref('');
const confirmText = ref('');
const cancelText = ref('');

let resolvePromise;

const ask = (opts) => {
  title.value = opts.title || 'Xác nhận hành động';
  message.value = opts.message || 'Bạn có chắc chắn muốn thực hiện hành động này không?';
  confirmText.value = opts.confirmText || 'Xác nhận';
  cancelText.value = opts.cancelText || 'Hủy bỏ';
  isOpen.value = true;
  
  return new Promise((resolve) => {
    resolvePromise = resolve;
  });
};

const confirm = () => {
  isOpen.value = false;
  resolvePromise(true);
};

const cancel = () => {
  isOpen.value = false;
  resolvePromise(false);
};

defineExpose({
  ask
});
</script>
