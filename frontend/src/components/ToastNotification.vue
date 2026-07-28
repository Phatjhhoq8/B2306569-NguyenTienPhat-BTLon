<template>
  <Transition
    enter-active-class="transform ease-out duration-300 transition"
    enter-from-class="translate-y-4 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div 
      v-if="toastStore.isVisible" 
      class="fixed bottom-6 right-6 z-[10000] max-w-md w-[90%] sm:w-[420px] bg-white rounded-3xl shadow-2xl border border-slate-100 p-5 flex items-center space-x-4 pointer-events-auto transition-all"
    >
      <div 
        class="p-2.5 rounded-xl flex-shrink-0"
        :class="{
          'bg-green-50 text-green-500': toastStore.type === 'success',
          'bg-amber-50 text-amber-500': toastStore.type === 'warning',
          'bg-red-50 text-red-500': toastStore.type !== 'success' && toastStore.type !== 'warning'
        }"
      >
        <CheckCircle v-if="toastStore.type === 'success'" class="h-6 w-6" />
        <AlertTriangle v-else-if="toastStore.type === 'warning'" class="h-6 w-6" />
        <AlertCircle v-else class="h-6 w-6" />
      </div>
      <div class="flex-grow">
        <p class="text-sm font-extrabold text-slate-900 leading-tight">
          {{ toastStore.type === 'success' ? 'Thành công' : (toastStore.type === 'warning' ? 'Cảnh báo' : 'Thông báo') }}
        </p>
        <p class="text-xs font-bold text-slate-500 mt-1 leading-snug">
          {{ toastStore.message }}
        </p>
      </div>
      <button 
        @click="toastStore.isVisible = false" 
        class="text-slate-400 hover:text-slate-600 flex-shrink-0"
      >
        <X class="h-5 w-5" />
      </button>
    </div>
  </Transition>
</template>

<script setup>
import { useToastStore } from '../stores/toast';
import { CheckCircle, AlertCircle, AlertTriangle, X } from '@lucide/vue';

const toastStore = useToastStore();
</script>
