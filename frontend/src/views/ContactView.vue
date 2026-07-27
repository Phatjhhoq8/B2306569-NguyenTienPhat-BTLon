<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans">
    <!-- Breadcrumb -->
    <div class="text-sm text-slate-500">
      <router-link to="/" class="hover:text-primary transition-colors">Trang chủ</router-link>
      <span class="mx-2">/</span>
      <span class="text-primary font-semibold">Thông tin liên hệ</span>
    </div>

    <!-- Title Header -->
    <div class="text-center max-w-3xl mx-auto space-y-4 py-4">
      <h1 class="font-sans text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-none">
        Liên hệ với chúng tôi
      </h1>
      <p class="text-slate-500 text-sm md:text-base max-w-2xl mx-auto font-medium leading-relaxed">
        Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ mọi nhu cầu học tập, mượn trả tài liệu của bạn.
      </p>
    </div>

    <!-- Google Map Section (Full Width in Middle) -->
    <div class="w-full h-96 rounded-3xl border border-slate-200 shadow-md overflow-hidden">
      <iframe 
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3928.847525380536!2d105.76632497464796!3d10.029452072517865!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a0895a535749f7%3A0xe54d37537b020a1c!2zVGjGsCB2aeG7h24gVHJ1bmcgdMOibSDEkOG6oWkgaOG7jWMgQ-G6p24gVGjGoQ!5e0!3m2!1svi!2s!4v1711200000000!5m2!1svi!2s" 
        width="100%" 
        height="100%" 
        style="border:0;" 
        allowfullscreen="" 
        loading="lazy">
      </iframe>
    </div>

    <!-- Bottom Info Grid (Two columns) -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Left Column: Primary Contact (Gray Box) -->
      <div class="bg-slate-100 rounded-3xl p-8 space-y-4 shadow-sm hover:shadow-md transition-shadow">
        <h2 class="font-sans text-xl md:text-2xl font-extrabold text-slate-900">
          Thư viện Trung tâm ĐH Cần Thơ
        </h2>
        <div class="space-y-3 text-sm text-slate-600 leading-relaxed">
          <p><strong>Địa chỉ:</strong> Khu II, Đường 3/2, Phường Xuân Khánh, Quận Ninh Kiều, TP. Cần Thơ</p>
          <p><strong>Hotline:</strong> <a href="tel:02923832663" class="text-primary font-bold hover:underline">0292 3832 663</a></p>
          <p><strong>Email:</strong> <a href="mailto:support@ctu.edu.vn" class="text-primary font-bold hover:underline">support@ctu.edu.vn</a></p>
        </div>
      </div>

      <!-- Right Column: More Info (Blue Box) -->
      <div class="bg-primary text-white rounded-3xl p-8 space-y-4 shadow-sm hover:shadow-md transition-shadow">
        <h2 class="font-sans text-xl md:text-2xl font-extrabold text-secondary">
          Thông Tin Thêm
        </h2>
        <div class="space-y-3 text-sm text-slate-100 leading-relaxed">
          <p><strong>Giờ làm việc:</strong> 7:30 – 21:00 (Tất cả các ngày trong tuần, kể cả Thứ Bảy, Chủ Nhật, trừ các ngày nghỉ lễ Tết theo quy định).</p>
          <p>Độc giả vui lòng xuất trình thẻ độc giả (hoặc mã QR thẻ hội viên trên ứng dụng di động) khi thực hiện giao dịch mượn trả tại quầy thủ thư.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Không cần import thêm icon gì khác cho bố cục này
</script>
