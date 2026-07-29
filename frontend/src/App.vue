<template>
  <div class="flex flex-col min-h-screen">
    <!-- Hiển thị Header nếu không nằm trong trang Admin -->
    <Header v-if="!isAdminRoute" />

    <!-- Nội dung chính -->
    <main class="flex-grow">
      <router-view />
    </main>

    <!-- Hiển thị Footer nếu không nằm trong trang Admin -->
    <Footer v-if="!isAdminRoute" />
    
    <!-- Toast Notification Global -->
    <ToastNotification />

    <ChatWidget v-if="!isAdminRoute" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Header from './components/ui/Header.vue';
import Footer from './components/ui/Footer.vue';
import ToastNotification from './components/ToastNotification.vue';
import ChatWidget from './components/ui/ChatWidget.vue';

const route = useRoute();
const isAdminRoute = computed(() => route.path.startsWith('/admin'));
</script>
