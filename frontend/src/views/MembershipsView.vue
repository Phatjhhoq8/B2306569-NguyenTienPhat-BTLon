<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 font-sans">
    
    <!-- Hero Section (Giống Google One / Workspace) -->
    <div class="text-center space-y-4 max-w-2xl mx-auto">
      <span class="bg-primary-light text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-block">Nâng Cấp Trải Nghiệm Đọc</span>
      <h1 class="font-sans text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
        Gói Hội Viên Độc Giả CTU eLibrary
      </h1>
      <p class="text-sm text-slate-500 font-medium leading-relaxed">
        Tài khoản độc giả mặc định được cung cấp Gói Tiêu Chuẩn hoàn toàn miễn phí. Nâng cấp lên gói hội viên Premium để mượn nhiều sách hơn, thời gian lâu hơn và hưởng đặc quyền miễn ký quỹ cọc sách.
      </p>
    </div>

    <!-- Plans Cards Grid -->
    <div v-if="plans.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div 
        v-for="plan in sortedPlans" 
        :key="plan._id"
        class="bg-white rounded-3xl border-2 overflow-hidden p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-xl relative"
        :class="[
          isPlanActive(plan) 
            ? 'border-primary shadow-lg ring-1 ring-primary/25 bg-slate-50/30' 
            : 'border-slate-200 hover:border-primary/50'
        ]"
      >
        <!-- Recommended Badge -->
        <span 
          v-if="plan.tenGoi.toLowerCase().includes('gold') || plan.tenGoi.toLowerCase().includes('vàng')"
          class="absolute top-4 right-4 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm"
        >
          Khuyên dùng
        </span>

        <div class="space-y-6">
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <h3 class="text-base font-bold text-slate-800 tracking-wide uppercase">{{ plan.tenGoi }}</h3>
              <span 
                v-if="isPlanActive(plan)"
                class="bg-green-100 text-green-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase"
              >
                Đang dùng
              </span>
            </div>
            
            <div class="flex items-baseline space-x-1">
              <span class="text-3xl font-black text-slate-900">{{ formatPrice(plan.giaTien) }}</span>
              <span class="text-slate-400 text-xs">/ {{ plan.soNgayHieuLuc }} ngày</span>
            </div>
            <p class="text-xs text-slate-400 font-medium">
              {{ plan.giaTien === 0 ? 'Gói mặc định áp dụng sẵn cho tất cả độc giả.' : 'Gói Premium nâng cấp thời hạn và giới hạn mượn.' }}
            </p>
          </div>

          <hr class="border-slate-100" />

          <!-- Perks List -->
          <ul class="space-y-4">
            <li class="flex items-start text-xs font-semibold text-slate-600">
              <CheckCircle class="h-4.5 w-4.5 text-green-500 mr-2.5 flex-shrink-0 mt-0.5" />
              <span>Mượn cùng lúc: <strong class="text-slate-900">{{ plan.soSachToiDa }} cuốn sách</strong></span>
            </li>
            <li class="flex items-start text-xs font-semibold text-slate-600">
              <CheckCircle class="h-4.5 w-4.5 text-green-500 mr-2.5 flex-shrink-0 mt-0.5" />
              <span>Thời hạn giữ sách: <strong class="text-slate-900">{{ plan.soNgayMuonToiDa }} ngày</strong></span>
            </li>
            <li class="flex items-start text-xs font-semibold text-slate-600">
              <CheckCircle class="h-4.5 w-4.5 text-green-500 mr-2.5 flex-shrink-0 mt-0.5" />
              <span>Yêu cầu ký quỹ cọc: <strong class="text-slate-900">{{ plan.mienTienCoc ? 'Miễn đặt cọc 100%' : 'Cần đặt cọc' }}</strong></span>
            </li>
          </ul>
        </div>

        <!-- Action Button (KISS, Google style logic) -->
        <div class="mt-8">
          <!-- TH1: Gói miễn phí / tiêu chuẩn -->
          <button 
            v-if="plan.giaTien === 0"
            disabled
            class="w-full font-bold py-3 rounded-xl text-xs transition-all border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed flex items-center justify-center space-x-1"
          >
            <span v-if="isPlanActive(plan)">Gói mặc định đang dùng</span>
            <span v-else>Gói mặc định của tài khoản</span>
          </button>

          <!-- TH2: Gói trả phí đang sử dụng -->
          <button 
            v-else-if="isPlanActive(plan)"
            disabled
            class="w-full font-bold py-3 rounded-xl text-xs transition-all bg-green-500 text-white cursor-not-allowed flex items-center justify-center space-x-1 shadow-sm"
          >
            <Check class="h-4 w-4 mr-1" />
            <span>Gói của bạn đang hoạt động</span>
          </button>

          <!-- TH3: Gói trả phí chưa sử dụng -->
          <button 
            v-else
            @click="subscribe(plan)"
            class="w-full font-bold py-3 rounded-xl text-xs transition-all shadow-md flex items-center justify-center space-x-1 bg-primary hover:bg-primary-dark text-white"
          >
            <span>Nâng cấp lên Premium</span>
          </button>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-20 text-slate-400 font-medium">Đang tải các gói hội viên...</div>

    <!-- Google Gemini Style Comparison Table -->
    <div v-if="plans.length > 0" class="max-w-4xl mx-auto mt-16 space-y-8">
      <div class="text-center space-y-2">
        <h2 class="font-sans text-xl font-extrabold text-slate-900">So sánh các gói hội viên</h2>
        <p class="text-xs text-slate-500">Xem chi tiết sự khác biệt để chọn gói phù hợp nhất với bạn.</p>
      </div>

      <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left text-slate-600 border-collapse">
            <thead>
              <tr class="border-b border-slate-100 bg-slate-50/50">
                <th scope="col" class="px-6 py-6 font-bold text-slate-800 text-xs w-2/5">Tính năng chính</th>
                <th 
                  v-for="plan in sortedPlans" 
                  :key="plan._id" 
                  scope="col" 
                  class="px-6 py-6 text-center w-1/5"
                  :class="plan.tenGoi.toLowerCase().includes('gold') || plan.tenGoi.toLowerCase().includes('vàng') ? 'bg-primary/5' : ''"
                >
                  <span class="block text-sm font-black text-slate-900">{{ plan.tenGoi }}</span>
                  <span class="block text-[10px] text-slate-400 font-bold mt-1 uppercase">{{ formatPrice(plan.giaTien) }}</span>
                </th>
              </tr>
            </thead>
            
            <tbody class="divide-y divide-slate-100 font-semibold">
              <!-- SECTION 1: HẠN MỨC MƯỢN SÁCH -->
              <tr class="bg-slate-50/30">
                <td colspan="4" class="px-6 py-3.5 font-bold text-primary text-[10px] uppercase tracking-wider">Hạn mức mượn sách</td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-slate-850">Số sách mượn tối đa cùng lúc</td>
                <td 
                  v-for="plan in sortedPlans" 
                  :key="plan._id" 
                  class="px-6 py-4 text-center font-bold text-slate-900"
                  :class="plan.tenGoi.toLowerCase().includes('gold') || plan.tenGoi.toLowerCase().includes('vàng') ? 'bg-primary/5' : ''"
                >
                  {{ plan.soSachToiDa }} cuốn
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-slate-850">Thời hạn giữ sách tối đa cho mỗi lần mượn</td>
                <td 
                  v-for="plan in sortedPlans" 
                  :key="plan._id" 
                  class="px-6 py-4 text-center font-bold text-slate-900"
                  :class="plan.tenGoi.toLowerCase().includes('gold') || plan.tenGoi.toLowerCase().includes('vàng') ? 'bg-primary/5' : ''"
                >
                  {{ plan.soNgayMuonToiDa }} ngày
                </td>
              </tr>

              <!-- SECTION 2: CHI PHÍ & TIỀN CỌC -->
              <tr class="bg-slate-50/30">
                <td colspan="4" class="px-6 py-3.5 font-bold text-primary text-[10px] uppercase tracking-wider">Chi phí & Ký quỹ cọc</td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-slate-850">Chi phí đăng ký định kỳ</td>
                <td 
                  v-for="plan in sortedPlans" 
                  :key="plan._id" 
                  class="px-6 py-4 text-center font-black text-primary"
                  :class="plan.tenGoi.toLowerCase().includes('gold') || plan.tenGoi.toLowerCase().includes('vàng') ? 'bg-primary/5' : ''"
                >
                  {{ formatPrice(plan.giaTien) }} <span class="text-[9px] text-slate-400 font-normal">/ {{ plan.soNgayHieuLuc }} ngày</span>
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-slate-850">Miễn cọc tiền ký quỹ (Đặt cọc 100% giá bìa)</td>
                <td 
                  v-for="plan in sortedPlans" 
                  :key="plan._id" 
                  class="px-6 py-4 text-center"
                  :class="plan.tenGoi.toLowerCase().includes('gold') || plan.tenGoi.toLowerCase().includes('vàng') ? 'bg-primary/5' : ''"
                >
                  <Check class="h-5 w-5 text-primary mx-auto stroke-[2.5]" v-if="plan.mienTienCoc" />
                  <span v-else class="text-slate-400 text-[10px]">Cần đặt cọc</span>
                </td>
              </tr>

              <!-- SECTION 3: TIỆN ÍCH PREMIUM -->
              <tr class="bg-slate-50/30">
                <td colspan="4" class="px-6 py-3.5 font-bold text-primary text-[10px] uppercase tracking-wider">Tiện ích Premium</td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-slate-850">Gia hạn hạn trả sách trực tuyến (Online)</td>
                <td 
                  v-for="plan in sortedPlans" 
                  :key="plan._id" 
                  class="px-6 py-4 text-center text-[10px]"
                  :class="plan.tenGoi.toLowerCase().includes('gold') || plan.tenGoi.toLowerCase().includes('vàng') ? 'bg-primary/5' : ''"
                >
                  <Check class="h-5 w-5 text-primary mx-auto stroke-[2.5]" v-if="plan.giaTien > 0" />
                  <span v-else class="text-slate-400">Không hỗ trợ</span>
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-slate-850">Quầy nhận sách ưu tiên (Không xếp hàng)</td>
                <td 
                  v-for="plan in sortedPlans" 
                  :key="plan._id" 
                  class="px-6 py-4 text-center"
                  :class="plan.tenGoi.toLowerCase().includes('gold') || plan.tenGoi.toLowerCase().includes('vàng') ? 'bg-primary/5' : ''"
                >
                  <Check class="h-5 w-5 text-primary mx-auto stroke-[2.5]" v-if="plan.giaTien > 0" />
                  <span v-else class="text-slate-400">—</span>
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-slate-850">Chia sẻ quyền lợi nhóm gia đình (Tối đa 3 thành viên)</td>
                <td 
                  v-for="plan in sortedPlans" 
                  :key="plan._id" 
                  class="px-6 py-4 text-center"
                  :class="plan.tenGoi.toLowerCase().includes('gold') || plan.tenGoi.toLowerCase().includes('vàng') ? 'bg-primary/5' : ''"
                >
                  <Check class="h-5 w-5 text-primary mx-auto stroke-[2.5]" v-if="plan.tenGoi.toLowerCase().includes('gold') || plan.tenGoi.toLowerCase().includes('vàng')" />
                  <span v-else class="text-slate-400">Không hỗ trợ</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- QR Payment Modal with Phone Simulator -->
    <div v-if="activePlan" class="fixed inset-0 bg-slate-900 bg-opacity-65 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div class="bg-white rounded-3xl max-w-4xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button @click="activePlan = null" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X class="h-6 w-6" />
        </button>

        <div class="text-center space-y-1">
          <h2 class="font-sans text-2xl font-extrabold text-slate-900">Quét Mã QR Thanh Toán</h2>
          <p class="text-sm text-slate-500 font-medium">Sử dụng Momo/Ngân hàng thật của bạn hoặc mô phỏng trên điện thoại giả lập</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-center justify-center">
          <!-- Left: Real VietQR Image (5/12) -->
          <div class="md:col-span-5 space-y-4 flex flex-col items-center">
            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-inner flex flex-col items-center text-center">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Quét mã bằng ứng dụng ngân hàng</span>
              <img 
                :src="getVietQrUrl()" 
                alt="VietQR Code" 
                class="w-52 h-52 object-contain bg-white p-2 rounded-xl border border-slate-100"
              />
              <div class="mt-3 text-xs font-semibold text-slate-700 space-y-1">
                <p>Số tiền: {{ formatPrice(activePlan.giaTien) }}</p>
                <p>Nội dung: <span class="text-primary uppercase">DK {{ activePlan.maGoi }} {{ authStore.user?.maDocGia || 'DG00001' }}</span></p>
              </div>
            </div>
          </div>

          <!-- Middle: Divider or info -->
          <div class="hidden md:block md:col-span-1 text-center text-slate-300 font-bold">HOẶC</div>

          <!-- Right: Interactive Phone Camera Simulator (6/12) -->
          <div class="md:col-span-6 flex flex-col items-center">
            <!-- Phone Mockup Container -->
            <div class="relative w-64 h-[400px] bg-slate-900 rounded-[36px] p-3 shadow-2xl border-4 border-slate-800 overflow-hidden flex flex-col justify-between">
              <!-- Phone notch/speaker -->
              <div class="absolute top-0 left-1/2 -translate-x-1/2 bg-slate-800 h-5 w-28 rounded-b-xl z-20"></div>

              <!-- Screen Inside -->
              <div class="relative flex-grow bg-slate-950 rounded-[28px] overflow-hidden flex flex-col justify-between p-4 pt-6 text-white text-center">
                <!-- Phone Top Bar -->
                <div class="flex justify-between items-center text-[10px] text-slate-400 mb-2">
                  <span>9:41 AM</span>
                  <span class="flex items-center space-x-1">
                    <Wifi class="h-3 w-3" />
                    <Battery class="h-3 w-3" />
                  </span>
                </div>

                <!-- Camera viewport mock -->
                <div class="flex-grow bg-slate-900 rounded-2xl flex flex-col items-center justify-center p-3 relative border border-slate-800 overflow-hidden">
                  <div class="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-500 via-transparent to-transparent"></div>
                  
                  <QrCode class="h-16 w-16 text-green-400 mb-2 animate-pulse" />
                  <p class="text-xs font-bold text-green-400 tracking-wide">CAMERA GIẢ LẬP</p>
                  <p class="text-[10px] text-slate-400 mt-1 max-w-[150px]">Đang căn chỉnh mã QR của bạn...</p>
                  
                  <!-- Green scanning frame corner markers -->
                  <div class="absolute top-4 left-4 h-4 w-4 border-t-2 border-l-2 border-green-400"></div>
                  <div class="absolute top-4 right-4 h-4 w-4 border-t-2 border-r-2 border-green-400"></div>
                  <div class="absolute bottom-4 left-4 h-4 w-4 border-b-2 border-l-2 border-green-400"></div>
                  <div class="absolute bottom-4 right-4 h-4 w-4 border-b-2 border-r-2 border-green-400"></div>
                </div>

                <!-- Phone Bottom Bar: Action Trigger -->
                <div class="mt-3 space-y-2">
                  <button 
                    @click="confirmPayment"
                    class="w-full bg-green-500 hover:bg-green-600 text-slate-950 font-bold py-2 rounded-xl text-xs transition-colors shadow-md flex items-center justify-center space-x-1"
                  >
                    <CheckCircle class="h-4 w-4" />
                    <span>Quét &amp; Chuyển khoản</span>
                  </button>
                  <span class="text-[9px] text-slate-500 block">Click để mô phỏng quét QR thành công</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <hr class="border-slate-100" />

        <!-- Web Manual Activation trigger -->
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p class="text-xs text-slate-400 text-center sm:text-left max-w-md font-medium">
            Sau khi bạn quét bằng điện thoại thật của mình hoặc nhấn nút chuyển khoản giả lập trên điện thoại ảo, vui lòng click nút bên cạnh để kích hoạt gói.
          </p>
          <button 
            @click="confirmPayment"
            :disabled="subscribing"
            class="bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 px-6 rounded-xl text-sm transition-all shadow-md disabled:opacity-50 flex items-center space-x-2 flex-shrink-0"
          >
            <span v-if="subscribing">Đang kích hoạt...</span>
            <span v-else>Xác nhận đã chuyển khoản thành công</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Join Family Group Form (Nếu là Độc giả và chưa đăng ký gói Vàng riêng) -->
    <div 
      v-if="authStore.isAuthenticated && authStore.isReader" 
      class="max-w-md mx-auto mt-16 bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-slate-200 p-8 space-y-6 shadow-sm text-center"
    >
      <div class="space-y-2">
        <Users class="h-8 w-8 text-primary mx-auto" />
        <h3 class="font-sans text-lg font-bold text-slate-900">Tham Gia Nhóm Gia Đình</h3>
        <p class="text-xs text-slate-500 font-medium">
          Bạn được người thân mời gia nhập nhóm gia đình? Hãy nhập mã độc giả của họ (Ví dụ: DG00024) bên dưới để cùng gia nhập nhóm (tối đa 2 thành viên phụ).
        </p>
      </div>

      <!-- Hiển thị nếu đang trong một nhóm do người khác chia sẻ -->
      <div 
        v-if="activeSub && activeSub.docGia !== authStore.user?._id" 
        class="bg-blue-50 border border-blue-100 text-blue-800 text-xs font-semibold p-4 rounded-2xl"
      >
        🎉 Bạn đang dùng chung gói Vàng (Family) chia sẻ từ chủ nhóm: <span class="font-bold text-primary">{{ activeSub.docGia }}</span>
      </div>

      <!-- Hiển thị nếu là chủ nhóm gói Vàng/Family -->
      <div 
        v-else-if="activeSub && (activeSub.goiDocGia?.tenGoi?.toLowerCase().includes('gold') || activeSub.goiDocGia?.tenGoi?.toLowerCase().includes('vàng') || activeSub.goiDocGia?.tenGoi?.toLowerCase().includes('family'))" 
        class="bg-green-50 border border-green-100 text-green-800 text-xs font-semibold p-4 rounded-2xl space-y-1"
      >
        <p class="font-bold">👑 Bạn là chủ nhóm Gói Vàng (Family)</p>
        <p class="text-[10px] text-green-650">
          Mã của bạn: <span class="font-bold text-slate-900">{{ authStore.user?._id }}</span> (Gửi mã này cho bạn bè)
        </p>
        <p class="text-[10px] text-green-650" v-if="activeSub.nguoiDuocMoi?.length > 0">
          Thành viên đã thêm: <span class="font-bold text-slate-900">{{ activeSub.nguoiDuocMoi.join(', ') }}</span>
        </p>
        <p class="text-[10px] text-slate-400" v-else>Chưa có thành viên nào tham gia</p>
      </div>

      <!-- Form nhập mã gia đình nếu không phải chủ nhóm và chưa join nhóm nào -->
      <div v-else class="space-y-4">
        <div class="relative rounded-xl shadow-sm">
          <input 
            v-model="inviterCode" 
            type="text" 
            placeholder="Nhập mã độc giả người mời (Ví dụ: DG00024)" 
            class="block w-full px-4 py-3 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-primary focus:border-primary uppercase placeholder-slate-400 text-slate-800 bg-white"
          />
        </div>

        <button 
          @click="joinFamily" 
          :disabled="joining"
          class="w-full bg-slate-900 hover:bg-primary hover:text-white text-white font-bold py-3 px-6 rounded-xl text-xs transition-all shadow-md flex items-center justify-center space-x-1"
        >
          <span>{{ joining ? 'Đang liên kết nhóm...' : 'Xác nhận tham gia nhóm' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import api from '../services/api';
import { CheckCircle, X, Wifi, Battery, QrCode, Check, Info, Users } from '@lucide/vue';

const router = useRouter();
const authStore = useAuthStore();

const plans = ref([]);
const activeSub = ref(null);
const activePlan = ref(null);
const subscribing = ref(false);

const sortedPlans = computed(() => {
  return [...plans.value].sort((a, b) => a.giaTien - b.giaTien);
});

const formatPrice = (val) => {
  if (val === 0) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
};

const isPlanActive = (plan) => {
  if (!authStore.isAuthenticated) return false;
  
  if (plan.giaTien === 0) {
    // Gói tiêu chuẩn (Miễn phí) hoạt động nếu người dùng không đăng ký bất kỳ gói VIP trả phí nào
    return !activeSub.value;
  }
  
  // Gói trả phí hoạt động nếu nó khớp với ID trong activeSub
  return activeSub.value && activeSub.value.goiDocGia?._id === plan._id;
};

const subscribe = (plan) => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  if (authStore.isStaff) {
    alert('Nhân viên không thể đăng ký gói độc giả!');
    return;
  }
  activePlan.value = plan;
};

// VietQR API
const getVietQrUrl = () => {
  if (!activePlan.value) return '';
  const bankId = 'MB';
  const accountNo = '0912345678';
  const amount = activePlan.value.giaTien;
  const readerId = authStore.user?.maDocGia || 'DG00001';
  const addInfo = encodeURIComponent(`DK ${activePlan.value.maGoi} ${readerId}`);
  return `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${addInfo}`;
};

const confirmPayment = async () => {
  if (!activePlan.value || subscribing.value) return;
  subscribing.value = true;
  try {
    const res = await api.post('/memberships/subscribe', { goiId: activePlan.value._id });
    if (res.success) {
      alert('Đăng ký gói hội viên thành công! Tài khoản của bạn đã được kích hoạt.');
      activePlan.value = null;
      // Cập nhật lại thông tin user & sub
      await authStore.fetchUser();
      const activeRes = await api.get('/memberships/my-subscriptions');
      if (activeRes.success && activeRes.data.length > 0) {
        activeSub.value = activeRes.data.find(s => s.trangThai === 'DANG_HIEU_LUC') || activeRes.data[0];
      }
      router.push('/profile');
    }
  } catch (error) {
    alert(error.message || 'Có lỗi xảy ra khi xác nhận thanh toán.');
  } finally {
    subscribing.value = false;
  }
};

const inviterCode = ref('');
const joining = ref(false);

const joinFamily = async () => {
  if (!inviterCode.value) {
    alert('Vui lòng nhập mã độc giả người mời!');
    return;
  }
  joining.value = true;
  try {
    const res = await api.post('/memberships/join-family', { maDocGiaMoi: inviterCode.value });
    if (res.success) {
      alert(res.data.message || 'Tham gia nhóm gia đình thành công!');
      inviterCode.value = '';
      // Nạp lại subscription mới
      const activeRes = await api.get('/memberships/my-subscriptions');
      if (activeRes.success && activeRes.data.length > 0) {
        activeSub.value = activeRes.data.find(s => s.trangThai === 'DANG_HIEU_LUC') || activeRes.data[0];
      }
      await authStore.fetchUser();
    }
  } catch (error) {
    alert(error.message || 'Có lỗi xảy ra khi liên kết nhóm.');
  } finally {
    joining.value = false;
  }
};

onMounted(async () => {
  // Nạp danh sách các gói hội viên (Công khai)
  try {
    const res = await api.get('/memberships/plans');
    if (res.success) {
      plans.value = res.data;
    }
  } catch (error) {
    console.error('Fetch plans error:', error);
  }

  // Chỉ nạp gói hội viên đang hoạt động nếu độc giả đã đăng nhập
  if (authStore.isAuthenticated && authStore.isReader) {
    try {
      const res = await api.get('/memberships/my-subscriptions');
      if (res.success && res.data.length > 0) {
        activeSub.value = res.data.find(s => s.trangThai === 'DANG_HIEU_LUC') || res.data[0];
      }
    } catch (error) {
      console.error('Fetch subscriptions error:', error);
    }
  }
});
</script>
