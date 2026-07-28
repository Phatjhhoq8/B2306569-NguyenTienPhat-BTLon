<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 font-sans">
    
    <!-- Title Header -->
    <div class="text-center max-w-3xl mx-auto space-y-4 py-4">
      <h1 class="font-sans text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-none">
        {{ contactSettings.title || 'Liên hệ với chúng tôi' }}
      </h1>
      <p class="text-slate-500 text-sm md:text-base max-w-2xl mx-auto font-medium leading-relaxed">
        {{ contactSettings.subtitle || 'Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ mọi nhu cầu học tập, mượn trả tài liệu của bạn.' }}
      </p>
    </div>

    <!-- Interactive Map & Branch Selector -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Map Container (Main Column) -->
      <div class="lg:col-span-2 h-[450px] rounded-3xl border border-slate-200 shadow-md overflow-hidden relative">
        <iframe 
          :src="activeMapUrl" 
          width="100%" 
          height="100%" 
          style="border:0;" 
          allowfullscreen="" 
          loading="lazy">
        </iframe>
      </div>

      <!-- Branches List (Sidebar Column) -->
      <div class="h-[450px] flex flex-col space-y-3 overflow-y-auto pr-2">
        <h3 class="font-sans text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1">
          Hệ thống chi nhánh thư viện
        </h3>
        
        <!-- Primary Branch Card -->
        <div 
          @click="selectBranch(null)"
          :class="activeBranchIndex === null ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-slate-200 hover:border-slate-300'"
          class="bg-white p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 relative text-left"
        >
          <span class="absolute top-3 right-3 text-[8px] bg-primary text-white font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Trụ sở</span>
          <h4 class="font-bold text-sm text-slate-800 pr-12">{{ contactSettings.libraryName || 'Thư viện Trung tâm ĐH Cần Thơ' }}</h4>
          <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">{{ contactSettings.address || 'Khu II, Đường 3/2, Phường Xuân Khánh, Quận Ninh Kiều, TP. Cần Thơ' }}</p>
          <div class="text-[10px] text-slate-400 font-semibold space-y-0.5">
            <div>SĐT: {{ contactSettings.hotline || '0292 3832 663' }}</div>
            <div>Email: {{ contactSettings.email || 'support@ctu.edu.vn' }}</div>
          </div>
        </div>

        <!-- Additional Branches Cards -->
        <div 
          v-for="(branch, idx) in (contactSettings.branches || [])"
          :key="idx"
          @click="selectBranch(idx)"
          :class="activeBranchIndex === idx ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-slate-200 hover:border-slate-300'"
          class="bg-white p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 relative text-left"
        >
          <span class="absolute top-3 right-3 text-[8px] bg-slate-100 text-slate-600 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Chi nhánh</span>
          <h4 class="font-bold text-sm text-slate-800 pr-16">{{ branch.name }}</h4>
          <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">{{ branch.address }}</p>
          <div class="text-[10px] text-slate-400 font-semibold space-y-0.5">
            <div v-if="branch.hotline">SĐT: {{ branch.hotline }}</div>
            <div v-if="branch.email">Email: {{ branch.email }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Info Grid (Two columns) -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Left Column: Selected Contact (Gray Box) -->
      <div class="bg-slate-100 rounded-3xl p-8 space-y-4 shadow-sm hover:shadow-md transition-shadow text-left">
        <h2 class="font-sans text-xl md:text-2xl font-extrabold text-slate-900">
          {{ selectedBranchInfo.name }}
        </h2>
        <div class="space-y-3 text-sm text-slate-600 leading-relaxed">
          <p><strong>Địa chỉ:</strong> {{ selectedBranchInfo.address }}</p>
          <p v-if="selectedBranchInfo.hotline">
            <strong>Hotline:</strong> 
            <a :href="'tel:' + selectedBranchInfo.hotline.replace(/\s+/g, '')" class="text-primary font-bold hover:underline">
              {{ selectedBranchInfo.hotline }}
            </a>
          </p>
          <p v-if="selectedBranchInfo.email">
            <strong>Email:</strong> 
            <a :href="'mailto:' + selectedBranchInfo.email" class="text-primary font-bold hover:underline">
              {{ selectedBranchInfo.email }}
            </a>
          </p>
        </div>
      </div>

      <!-- Right Column: More Info (Blue Box) -->
      <div class="bg-primary text-white rounded-3xl p-8 space-y-4 shadow-sm hover:shadow-md transition-shadow text-left">
        <h2 class="font-sans text-xl md:text-2xl font-extrabold text-secondary">
          {{ contactSettings.moreTitle || 'Thông Tin Thêm' }}
        </h2>
        <div class="space-y-3 text-sm text-slate-100 leading-relaxed">
          <p><strong>Giờ làm việc:</strong> {{ contactSettings.moreHours || '7:30 – 21:00 (Tất cả các ngày trong tuần, kể cả Thứ Bảy, Chủ Nhật, trừ các ngày nghỉ lễ Tết theo quy định).' }}</p>
          <p>{{ contactSettings.moreNote || 'Độc giả vui lòng xuất trình thẻ độc giả (hoặc mã QR thẻ hội viên trên ứng dụng di động) khi thực hiện giao dịch mượn trả tại quầy thủ thư.' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../services/api';

const contactSettings = ref({
  title: "Liên hệ với chúng tôi",
  subtitle: "Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ mọi nhu cầu học tập, mượn trả tài liệu của bạn.",
  mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3928.847525380536!2d105.76632497464796!3d10.029452072517865!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a0895a535749f7%3A0xe54d37537b020a1c!2zVGjGsCB2aeG7h24gVHJ1bmcgdMOibSDEkOG6oWkgaOG7jWMgQ-G6p24gVGjGoQ!5e0!3m2!1svi!2s!4v1711200000000!5m2!1svi!2s",
  libraryName: "Thư viện Trung tâm ĐH Cần Thơ",
  address: "Khu II, Đường 3/2, Phường Xuân Khánh, Quận Ninh Kiều, TP. Cần Thơ",
  hotline: "0292 3832 663",
  email: "support@ctu.edu.vn",
  moreTitle: "Thông Tin Thêm",
  moreHours: "Giờ làm việc: 7:30 – 21:00 (Tất cả các ngày trong tuần, kể cả Thứ Bảy, Chủ Nhật, trừ các ngày nghỉ lễ Tết theo quy định).",
  moreNote: "Độc giả vui lòng xuất trình thẻ độc giả (hoặc mã QR thẻ hội viên trên ứng dụng di động) khi thực hiện giao dịch mượn trả tại quầy thủ thư.",
  branches: []
});

const activeBranchIndex = ref(null); // null = Main headquarters

const selectBranch = (index) => {
  activeBranchIndex.value = index;
};

const activeMapUrl = computed(() => {
  if (activeBranchIndex.value === null) {
    return contactSettings.value.mapUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3928.847525380536!2d105.76632497464796!3d10.029452072517865!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a0895a535749f7%3A0xe54d37537b020a1c!2zVGjGsCB2aeG7h24gVHJ1bmcgdMOibSDEkOG6oWkgaOG7jWMgQ-G6p24gVGjGoQ!5e0!3m2!1svi!2s!4v1711200000000!5m2!1svi!2s';
  }
  const br = contactSettings.value.branches[activeBranchIndex.value];
  return br?.mapUrl || contactSettings.value.mapUrl;
});

const selectedBranchInfo = computed(() => {
  if (activeBranchIndex.value === null) {
    return {
      name: contactSettings.value.libraryName || 'Thư viện Trung tâm ĐH Cần Thơ',
      address: contactSettings.value.address || 'Khu II, Đường 3/2, Phường Xuân Khánh, Quận Ninh Kiều, TP. Cần Thơ',
      hotline: contactSettings.value.hotline || '0292 3832 663',
      email: contactSettings.value.email || 'support@ctu.edu.vn'
    };
  }
  const br = contactSettings.value.branches[activeBranchIndex.value];
  return {
    name: br?.name || '',
    address: br?.address || '',
    hotline: br?.hotline || '',
    email: br?.email || ''
  };
});

onMounted(async () => {
  try {
    const res = await api.get('/settings/contactpage');
    if (res.success && res.data && Object.keys(res.data).length > 0) {
      contactSettings.value = { branches: [], ...res.data };
      if (!contactSettings.value.branches) {
        contactSettings.value.branches = [];
      }
    }
  } catch (err) {
    console.error('Fetch contact settings failed:', err);
  }
});
</script>

