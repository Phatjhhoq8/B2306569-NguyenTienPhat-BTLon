<template>
  <footer class="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Logo & Slogan -->
        <div class="space-y-4 col-span-1 md:col-span-2">
          <div class="flex items-center space-x-2 text-white">
            <img src="/src/assets/logo.jpg" alt="Logo" class="h-8 w-8 rounded-lg object-cover border border-slate-700 bg-white" />
            <span class="font-serif text-xl font-bold tracking-wide text-white">CTU eLibrary</span>
          </div>
          <p class="text-sm max-w-sm">
            Khám phá thế giới tri thức vô tận. Nền tảng mượn sách giấy online hàng đầu giúp kết nối độc giả với hàng ngàn đầu sách hay nhất.
          </p>
        </div>

        <!-- Links -->
        <div>
          <h3 class="text-sm font-semibold text-white tracking-wider uppercase mb-4">Danh mục</h3>
          <ul class="space-y-2 text-sm">
            <li><router-link to="/" class="hover:text-white transition-colors">Trang chủ</router-link></li>
            <li><router-link to="/about" class="hover:text-white transition-colors">Giới thiệu</router-link></li>
            <li><router-link to="/books" class="hover:text-white transition-colors">Danh mục sách</router-link></li>
            <li><router-link to="/memberships" class="hover:text-white transition-colors">Gói hội viên</router-link></li>
            <li><router-link to="/contact" class="hover:text-white transition-colors">Liên hệ</router-link></li>
          </ul>
        </div>

        <!-- Contact Info -->
        <div>
          <h3 class="text-sm font-semibold text-white tracking-wider uppercase mb-4">Liên hệ</h3>
          <ul class="space-y-2 text-sm">
            <li class="flex items-center"><Mail class="h-4 w-4 mr-2 text-secondary" /> support@ctu.edu.vn</li>
            <li class="flex items-center"><Phone class="h-4 w-4 mr-2 text-secondary" /> +84 1900 1234</li>
            <li class="flex items-center"><MapPin class="h-4 w-4 mr-2 text-secondary" /> Đại học Cần Thơ, Ninh Kiều, Cần Thơ</li>
          </ul>
        </div>
      </div>
      
      <div class="mt-12 pt-8 border-t border-slate-800 text-center text-xs">
        <p>© 2026 CTU eLibrary - Hệ Thống Mượn Sách Online. Đồ án môn học CT449 Phát triển ứng dụng Web.</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { BookOpen, Mail, Phone, MapPin } from '@lucide/vue';
</script>
