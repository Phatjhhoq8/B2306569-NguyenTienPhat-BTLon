<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 font-sans">
    
    <!-- Hero Section (Giống Google One / Workspace) -->
    <div class="text-center space-y-4 max-w-2xl mx-auto">
      <span class="bg-primary-light text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-block">Nâng Cấp Trải Nghiệm Đọc</span>
      <h1 class="font-sans text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
        {{ membershipSettings.heroTitle || 'Gói Hội Viên Độc Giả CTU eLibrary' }}
      </h1>
      <p class="text-sm text-slate-500 font-medium leading-relaxed">
        {{ membershipSettings.heroSubtitle || 'Tài khoản độc giả mặc định được cung cấp Gói Tiêu Chuẩn hoàn toàn miễn phí. Nâng cấp lên gói hội viên Premium để mượn nhiều sách hơn, thời gian lâu hơn.' }}
      </p>
    </div>

    <!-- Toggle tab (Individual / Team & Family) -->
    <div class="flex justify-center my-4">
      <div class="bg-slate-100 p-1 rounded-2xl inline-flex space-x-1 border border-slate-200 shadow-sm select-none">
        <button 
          @click="activeLoaiGoi = 'INDIVIDUAL'"
          class="px-6 py-2.5 rounded-xl text-xs font-bold transition-all"
          :class="activeLoaiGoi === 'INDIVIDUAL' ? 'bg-primary text-white shadow-sm' : 'text-slate-650 hover:text-slate-900'"
        >
          Gói cá nhân (Individual)
        </button>
        <button 
          @click="activeLoaiGoi = 'TEAM'"
          class="px-6 py-2.5 rounded-xl text-xs font-bold transition-all"
          :class="activeLoaiGoi === 'TEAM' ? 'bg-primary text-white shadow-sm' : 'text-slate-650 hover:text-slate-900'"
        >
          Nhóm &amp; Gia đình (Team)
        </button>
      </div>
    </div>

    <!-- Plans Cards Flex (Tự động căn giữa) -->
    <div v-if="plans.length > 0" class="flex flex-wrap justify-center gap-8">
      <div 
        v-for="plan in filteredPlans" 
        :key="plan._id"
        class="w-full md:w-[320px] bg-white rounded-3xl border-2 overflow-hidden p-8 flex flex-col justify-between transition-all duration-300 relative"
        :class="[
          isPlanActive(plan) 
            ? 'border-blue-500 shadow-md ring-2 ring-blue-500/10 bg-blue-50/10' 
            : 'border-slate-200 hover:border-primary hover:shadow-xl hover:ring-2 hover:ring-primary/10'
        ]"
      >
        <!-- Recommended Badge -->
        <span 
          v-if="isHighlightedPlan(plan)"
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
                class="bg-blue-100 text-blue-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase"
              >
                Đang dùng
              </span>
            </div>
            
            <div class="flex items-baseline space-x-1">
              <span class="text-3xl font-black text-slate-900">{{ formatPrice(plan.giaTien) }}</span>
              <span class="text-slate-400 text-xs" v-if="plan.giaTien > 0 && plan.soNgayHieuLuc !== 99999">/ {{ plan.soNgayHieuLuc }} ngày</span>
              <span class="text-slate-400 text-xs" v-else>/ Vĩnh viễn</span>
            </div>
            <p class="text-xs text-slate-400 font-medium">
              {{ getPlanDescription(plan) }}
            </p>
          </div>

          <hr class="border-slate-100" />

          <!-- Perks List -->
          <ul class="space-y-3">
            <li 
              v-for="(perk, i) in getPlanPerks(plan)" 
              :key="i"
              class="flex items-start text-xs font-semibold text-slate-650"
            >
              <CheckCircle class="h-4 w-4 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>{{ perk }}</span>
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
            @click="subscribe(plan)"
            class="w-full font-bold py-3 rounded-xl text-xs transition-all bg-primary hover:bg-primary-dark text-white flex items-center justify-center space-x-1 shadow-sm active:scale-95"
          >
            <Check class="h-4.5 w-4.5 mr-1" />
            <span>Gia hạn gói {{ plan.tenGoi }}</span>
          </button>

          <!-- TH3: Gói trả phí chưa sử dụng -->
          <button 
            v-else
            @click="subscribe(plan)"
            class="w-full font-bold py-3 rounded-xl text-xs transition-all shadow-md flex items-center justify-center space-x-1 bg-primary hover:bg-primary-dark text-white"
          >
            <span>Nâng cấp lên gói {{ plan.tenGoi }}</span>
          </button>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-20 text-slate-400 font-medium">Đang tải các gói hội viên...</div>

    <!-- Google Gemini Style Comparison Table -->
    <div v-if="plans.length > 0" class="max-w-4xl mx-auto mt-16 space-y-6">
      <div class="text-center">
        <button 
          @click="showComparison = !showComparison"
          class="inline-flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-8 rounded-full text-xs md:text-sm transition-all shadow-md active:scale-95"
        >
          <span>So sánh chi tiết các gói hội viên</span>
          <ChevronDown v-if="!showComparison" class="h-4.5 w-4.5 flex-shrink-0" />
          <ChevronUp v-else class="h-4.5 w-4.5 flex-shrink-0" />
        </button>
      </div>

      <transition name="fade">
        <div v-if="showComparison" class="space-y-6">
        <p class="text-xs text-slate-500 text-center font-medium">Xem chi tiết sự khác biệt để chọn gói phù hợp nhất với bạn.</p>
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
                  :class="isHighlightedPlan(plan) ? 'bg-blue-50/90 border-x-2 border-t-2 border-blue-300/60 text-blue-900' : ''"
                >
                  <span class="block text-sm font-black" :class="isHighlightedPlan(plan) ? 'text-blue-800' : 'text-slate-900'">{{ plan.tenGoi }}</span>
                  <span class="block text-[10px] font-bold mt-1 uppercase" :class="isHighlightedPlan(plan) ? 'text-blue-600 font-extrabold' : 'text-slate-400'">{{ formatPrice(plan.giaTien) }}</span>
                </th>
              </tr>
            </thead>
            
            <tbody class="divide-y divide-slate-100 font-semibold">
              <!-- SECTION 1: HẠN MỨC MƯỢN SÁCH -->
              <tr class="bg-slate-50/30">
                <td class="px-6 py-3.5 font-bold text-primary text-[10px] uppercase tracking-wider bg-slate-100/60">Hạn mức mượn sách</td>
                <td 
                  v-for="plan in sortedPlans" 
                  :key="'sec1_' + plan._id" 
                  class="px-6 py-3.5"
                  :class="isHighlightedPlan(plan) ? 'bg-blue-50/50 border-x-2 border-blue-300/40' : ''"
                ></td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-slate-850">Số sách mượn tối đa cùng lúc</td>
                <td 
                  v-for="plan in sortedPlans" 
                  :key="plan._id" 
                  class="px-6 py-4 text-center font-bold text-slate-900"
                  :class="isHighlightedPlan(plan) ? 'bg-blue-50/50 border-x-2 border-blue-300/40' : ''"
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
                  :class="isHighlightedPlan(plan) ? 'bg-blue-50/50 border-x-2 border-blue-300/40' : ''"
                >
                  {{ plan.soNgayMuonToiDa }} ngày
                </td>
              </tr>

              <!-- SECTION 2: CHI PHÍ DỊCH VỤ -->
              <tr class="bg-slate-50/30">
                <td class="px-6 py-3.5 font-bold text-primary text-[10px] uppercase tracking-wider bg-slate-100/60">Chi phí dịch vụ</td>
                <td 
                  v-for="plan in sortedPlans" 
                  :key="'sec2_' + plan._id" 
                  class="px-6 py-3.5"
                  :class="isHighlightedPlan(plan) ? 'bg-blue-50/50 border-x-2 border-blue-300/40' : ''"
                ></td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-slate-850">Chi phí đăng ký định kỳ</td>
                <td 
                  v-for="plan in sortedPlans" 
                  :key="plan._id" 
                  class="px-6 py-4 text-center font-black"
                  :class="isHighlightedPlan(plan) ? 'bg-blue-50/50 border-x-2 border-blue-300/40 text-blue-700' : 'text-primary'"
                >
                  <span v-if="plan.giaTien > 0">
                    {{ formatPrice(plan.giaTien) }} 
                    <span class="text-[9px] text-slate-400 font-normal" v-if="plan.soNgayHieuLuc !== 99999">/ {{ plan.soNgayHieuLuc }} ngày</span>
                    <span class="text-[9px] text-slate-400 font-normal" v-else>/ Vĩnh viễn</span>
                  </span>
                  <span v-else class="text-slate-500">Miễn phí / Vĩnh viễn</span>
                </td>
              </tr>

              <!-- SECTION 3: TIỆN ÍCH PREMIUM -->
              <tr class="bg-slate-50/30">
                <td class="px-6 py-3.5 font-bold text-primary text-[10px] uppercase tracking-wider bg-slate-100/60">Tiện ích Premium</td>
                <td 
                  v-for="plan in sortedPlans" 
                  :key="'sec3_' + plan._id" 
                  class="px-6 py-3.5"
                  :class="isHighlightedPlan(plan) ? 'bg-blue-50/50 border-x-2 border-blue-300/40' : ''"
                ></td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-slate-850">Gia hạn hạn trả sách trực tuyến (Online)</td>
                <td 
                  v-for="plan in sortedPlans" 
                  :key="plan._id" 
                  class="px-6 py-4 text-center font-bold text-slate-800"
                  :class="isHighlightedPlan(plan) ? 'bg-blue-50/50 border-x-2 border-blue-300/40' : ''"
                >
                  {{ getPlanGiaHanOnline(plan) }}
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-slate-850">Quầy nhận sách ưu tiên (Không xếp hàng)</td>
                <td 
                  v-for="plan in sortedPlans" 
                  :key="plan._id" 
                  class="px-6 py-4 text-center"
                  :class="isHighlightedPlan(plan) ? 'bg-blue-50/50 border-x-2 border-blue-300/40' : ''"
                >
                  <Check class="h-5 w-5 text-emerald-600 mx-auto stroke-[2.5]" v-if="plan.quayNhanUuTien" />
                  <span v-else class="text-slate-400">Không hỗ trợ</span>
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-slate-850">Chia sẻ quyền lợi thành viên</td>
                <td 
                  v-for="plan in sortedPlans" 
                  :key="plan._id" 
                  class="px-6 py-4 text-center font-bold text-slate-800"
                  :class="isHighlightedPlan(plan) ? 'bg-blue-50/50 border-x-2 border-blue-300/40' : ''"
                >
                  {{ getPlanChiaSeNhom(plan) }}
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-slate-850">Chính sách đặt cọc khi mượn sách giấy</td>
                <td 
                  v-for="plan in sortedPlans" 
                  :key="plan._id" 
                  class="px-6 py-4 text-center font-bold"
                  :class="[isHighlightedPlan(plan) ? 'bg-blue-50/50 border-x-2 border-blue-300/40' : '', plan.mienTienCoc ? 'text-emerald-650' : 'text-slate-800']"
                >
                  <span v-if="plan.mienTienCoc">Miễn đặt cọc</span>
                  <span v-else-if="plan.giaTien === 0">Đặt cọc 100.000 ₫</span>
                  <span v-else>Đặt cọc 50.000 ₫</span>
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-slate-850">Đọc sách điện tử (Ebook) bản quyền</td>
                <td 
                  v-for="plan in sortedPlans" 
                  :key="plan._id" 
                  class="px-6 py-4 text-center font-bold text-slate-800"
                  :class="isHighlightedPlan(plan) ? 'bg-blue-50/50 border-x-2 border-blue-300/40' : ''"
                >
                  {{ getPlanEbook(plan) }}
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-slate-850">Đọc sách nói (Audiobook) bản quyền</td>
                <td 
                  v-for="plan in sortedPlans" 
                  :key="plan._id" 
                  class="px-6 py-4 text-center font-bold text-slate-800"
                  :class="isHighlightedPlan(plan) ? 'bg-blue-50/50 border-x-2 border-blue-300/40' : ''"
                >
                  {{ getPlanAudiobook(plan) }}
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-slate-850">Dịch vụ giao/trả sách tận nhà</td>
                <td 
                  v-for="plan in sortedPlans" 
                  :key="plan._id" 
                  class="px-6 py-4 text-center font-bold text-slate-800"
                  :class="isHighlightedPlan(plan) ? 'bg-blue-50/50 border-x-2 border-blue-300/40' : ''"
                >
                  {{ getPlanGiaoSach(plan) }}
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-slate-850">Phí dịch vụ mượn sách giấy (mỗi cuốn)</td>
                <td 
                  v-for="plan in sortedPlans" 
                  :key="plan._id" 
                  class="px-6 py-4 text-center font-bold"
                  :class="[isHighlightedPlan(plan) ? 'bg-blue-50/50 border-x-2 border-blue-300/40' : '', plan.giaTien > 39000 ? 'text-emerald-650' : 'text-slate-800']"
                >
                  {{ getPlanPhiMuon(plan) }}
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-slate-850">Phí phạt trễ hạn (mỗi ngày/cuốn)</td>
                <td 
                  v-for="plan in sortedPlans" 
                  :key="plan._id" 
                  class="px-6 py-4 text-center font-bold text-red-600"
                  :class="isHighlightedPlan(plan) ? 'bg-blue-50/50 border-x-2 border-blue-300/40' : ''"
                >
                  {{ getPlanPhatTre(plan) }}
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-slate-850">Tham gia câu lạc bộ &amp; sự kiện độc quyền</td>
                <td 
                  v-for="plan in sortedPlans" 
                  :key="plan._id" 
                  class="px-6 py-4 text-center"
                  :class="isHighlightedPlan(plan) ? 'bg-blue-50/50 border-x-2 border-b-2 border-blue-300/60 pb-5' : ''"
                >
                  <Check class="h-5 w-5 text-emerald-600 mx-auto stroke-[2.5]" v-if="plan.workshopDocQuyen" />
                  <span v-else class="text-slate-400">Không hỗ trợ</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        </div>
      </div>
      </transition>
    </div>

    <!-- Configure and Payment Modal (Claude-style) -->
    <div v-if="activePlan" class="fixed inset-0 bg-slate-900 bg-opacity-65 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div class="checkout-modal-scroll bg-white rounded-3xl max-w-5xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[95vh] overflow-y-auto font-sans">
        <button @click="closeCheckout" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
          <X class="h-6 w-6" />
        </button>

        <div class="border-b pb-4">
          <h2 class="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <span class="h-8 w-8 rounded-lg bg-primary-light flex items-center justify-center">
              <Award class="h-5 w-5 text-primary" />
            </span>
            Cấu hình &amp; Thanh toán gói dịch vụ
          </h2>
          <p class="text-xs text-slate-500 font-medium mt-1">Thiết lập phương thức thanh toán và hoàn tất đăng ký của bạn</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <!-- Left: Configure & Payment options (7/12) -->
          <div class="lg:col-span-7 space-y-6">
            <!-- Billing Information -->
            <div class="space-y-4">
              <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider">1. Thông tin hóa đơn</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-500">Họ và tên</label>
                  <input v-model="billingName" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-1 focus:ring-primary focus:border-primary text-slate-800" placeholder="Nguyễn Văn A" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-500">Quốc gia hoặc khu vực</label>
                  <select v-model="billingCountry" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-1 focus:ring-primary focus:border-primary text-slate-800">
                    <option value="VN">Việt Nam</option>
                    <option value="US">Mỹ</option>
                    <option value="JP">Nhật Bản</option>
                  </select>
                </div>
              </div>
            </div>

            <hr class="border-slate-100" />

            <!-- Payment Methods Select -->
            <div class="space-y-4">
              <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider">2. Phương thức thanh toán</h3>
              <div class="grid grid-cols-2 gap-4">
                <!-- Thẻ tín dụng option -->
                <label 
                  class="border-2 rounded-2xl p-4 flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all hover:bg-slate-50"
                  :class="paymentMethod === 'THE_TIN_DUNG' ? 'border-primary bg-primary-light/10 text-primary-dark shadow-sm' : 'border-slate-200 text-slate-600'"
                >
                  <input type="radio" value="THE_TIN_DUNG" v-model="paymentMethod" class="sr-only" />
                  <CreditCard class="h-6 w-6" />
                  <span class="text-xs font-bold">Thẻ Tín dụng / Ghi nợ</span>
                  <span class="text-[9px] font-semibold text-slate-400">Tự động gia hạn</span>
                </label>

                <!-- VietQR option -->
                <label 
                  class="border-2 rounded-2xl p-4 flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all hover:bg-slate-50"
                  :class="paymentMethod === 'VIETQR' ? 'border-primary bg-primary-light/10 text-primary-dark shadow-sm' : 'border-slate-200 text-slate-600'"
                >
                  <input type="radio" value="VIETQR" v-model="paymentMethod" class="sr-only" />
                  <QrCode class="h-6 w-6" />
                  <span class="text-xs font-bold">Chuyển khoản VietQR</span>
                  <span class="text-[9px] font-semibold text-slate-400">Từng tháng, tự hủy</span>
                </label>
              </div>
            </div>

            <!-- Detail Form for THE_TIN_DUNG -->
            <div v-show="paymentMethod === 'THE_TIN_DUNG'" class="space-y-6 pt-2">
              <div class="flex flex-col md:flex-row gap-6 items-center justify-center bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
                <!-- Credit Card Visual Mock -->
                <div class="flex-shrink-0">
                  <div class="relative w-[300px] h-[180px] bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 rounded-2xl p-5 text-white shadow-lg flex flex-col justify-between border border-white/10 select-none overflow-hidden">
                    <div class="absolute -right-12 -top-12 w-28 h-28 bg-primary/20 rounded-full blur-2xl"></div>
                    
                    <div class="flex justify-between items-start">
                      <div class="space-y-0.5">
                        <span class="text-[8px] uppercase font-bold tracking-widest text-slate-400">Gói Hội Viên</span>
                        <h4 class="text-[10px] font-extrabold text-secondary tracking-wide uppercase">{{ activePlan.tenGoi }}</h4>
                      </div>
                      <div class="h-5 w-8 bg-white/10 rounded flex items-center justify-center border border-white/5">
                        <span class="text-[9px] font-black italic tracking-tighter text-white">VISA</span>
                      </div>
                    </div>

                    <div class="flex items-center space-x-3">
                      <div class="w-8 h-6 bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 rounded relative overflow-hidden border border-amber-200/50 shadow-inner flex flex-col justify-between p-0.5">
                        <div class="grid grid-cols-3 gap-0.5 w-full h-full opacity-60">
                          <div class="border border-amber-950/30"></div>
                          <div class="border border-amber-950/30"></div>
                          <div class="border border-amber-950/30"></div>
                        </div>
                      </div>
                      <svg class="h-3.5 w-3.5 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M5 12a10 10 0 0 1 14 0" />
                        <path d="M8 15a6 6 0 0 1 8 0" />
                      </svg>
                    </div>

                    <div class="space-y-2">
                      <div class="font-mono text-sm tracking-widest text-white/95 font-semibold text-center">
                        {{ formattedCardNumber || '•••• •••• •••• ••••' }}
                      </div>
                      <div class="flex justify-between items-center text-[8px] font-medium text-slate-300">
                        <div>
                          <span class="text-[7px] uppercase tracking-wider text-slate-500 block mb-0.5">Chủ thẻ</span>
                          <span class="font-bold tracking-wider uppercase text-white truncate max-w-[110px] block">
                            {{ cardName || 'TÊN CHỦ THẺ' }}
                          </span>
                        </div>
                        <div>
                          <span class="text-[7px] uppercase tracking-wider text-slate-500 block mb-0.5">Hạn dùng</span>
                          <span class="font-bold text-white block">{{ cardExpiry || 'MM/YY' }}</span>
                        </div>
                        <div>
                          <span class="text-[7px] uppercase tracking-wider text-slate-500 block mb-0.5">CVC</span>
                          <span class="font-bold text-white block">{{ cardCvc || '•••' }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Input fields for Credit Card -->
                <div class="flex-grow space-y-3 w-full">
                  <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-500 uppercase">Số thẻ</label>
                    <input 
                      v-model="cardNumber" 
                      type="text" 
                      maxlength="19" 
                      @input="formatCardInput" 
                      class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary text-slate-800" 
                      placeholder="4111 2222 3333 4444" 
                    />
                  </div>
                  <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-500 uppercase">Tên in trên thẻ</label>
                    <input 
                      v-model="cardName" 
                      type="text" 
                      class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary uppercase text-slate-800" 
                      placeholder="NGUYEN VAN A" 
                    />
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div class="space-y-1">
                      <label class="text-[10px] font-bold text-slate-500 uppercase">Hạn dùng (MM/YY)</label>
                      <input 
                        v-model="cardExpiry" 
                        type="text" 
                        maxlength="5" 
                        @input="formatExpiryInput"
                        class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary text-slate-800" 
                        placeholder="12/29" 
                      />
                    </div>
                    <div class="space-y-1">
                      <label class="text-[10px] font-bold text-slate-500 uppercase">Mã bảo mật CVC</label>
                      <input 
                        v-model="cardCvc" 
                        type="password" 
                        maxlength="3" 
                        @input="formatCvcInput"
                        class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary text-slate-800" 
                        placeholder="123" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Detail QR for VietQR -->
            <div v-show="paymentMethod === 'VIETQR'" class="space-y-4 pt-2">
              <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center justify-center">
                <!-- QR Code (5/12) -->
                <div class="md:col-span-5 flex flex-col items-center">
                  <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-inner flex flex-col items-center text-center w-full">
                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Mã thanh toán VietQR</span>
                    <img 
                      :src="getVietQrUrl()" 
                      alt="VietQR Code" 
                      class="w-44 h-44 object-contain bg-white p-2 rounded-xl border border-slate-100"
                    />
                    <div class="mt-2.5 text-[10px] font-bold text-slate-700 space-y-0.5">
                      <p>Số tiền: {{ formatPrice(membershipFinalAmount) }}</p>
                      <p>Nội dung: <span class="text-primary uppercase font-mono">DK {{ activePlan.maGoi }} {{ authStore.user?.maDocGia || 'DG00001' }}</span></p>
                    </div>
                  </div>
                </div>

                <!-- physical simulator phone (7/12) -->
                <div class="md:col-span-7 flex flex-col items-center">
                  <div class="relative w-56 h-[390px] bg-slate-950 rounded-[38px] p-2 shadow-2xl ring-6 ring-slate-800 border-2 border-slate-900 overflow-visible flex flex-col justify-between">
                    <div class="absolute top-2.5 left-1/2 -translate-x-1/2 bg-black h-3.5 w-14 rounded-full z-30 flex items-center justify-end px-1.5">
                      <div class="h-1.5 w-1.5 rounded-full bg-green-500 opacity-80 animate-pulse"></div>
                    </div>
                    <div class="relative flex-grow bg-slate-950 rounded-[30px] overflow-hidden flex flex-col justify-between p-3 pt-5 text-white text-center border border-white/5">
                      <div class="flex justify-between items-center text-[8px] text-slate-400 font-semibold px-1.5">
                        <span>9:41</span>
                        <span class="flex items-center space-x-1">
                          <Wifi class="h-2.5 w-2.5" />
                          <span class="text-[7px]">5G</span>
                          <Battery class="h-3.5 w-3.5" />
                        </span>
                      </div>
                      <div class="flex-grow bg-slate-900 rounded-xl flex flex-col items-center justify-center p-2 relative border border-slate-800 overflow-hidden shadow-inner mt-2">
                        <QrCode class="h-10 w-10 text-green-400/90 mb-1 animate-pulse" />
                        <span class="text-[9px] font-black text-green-400 tracking-wider">CAMERA GIẢ LẬP</span>
                        <p class="text-[8px] text-slate-400 mt-1 max-w-[120px] leading-tight">Đang quét mã VietQR tự động...</p>
                        <div class="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent shadow-[0_0_8px_rgba(74,222,128,0.8)] scan-laser z-10"></div>
                      </div>
                      <div class="mt-3 space-y-1">
                        <button 
                          @click="confirmPayment"
                          class="w-full bg-green-500 hover:bg-green-600 text-slate-950 font-black py-2 rounded-xl text-[10px] transition-all shadow-md active:scale-95 flex items-center justify-center space-x-1"
                        >
                          <CheckCircle class="h-3.5 w-3.5" />
                          <span>Mô phỏng thanh toán QR</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Plan Summary & Checkout details (5/12) -->
          <div class="lg:col-span-5 bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-6">
            <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider border-b pb-2">Tóm tắt đơn đăng ký</h3>
            
              <div class="space-y-4">
              <!-- Plan Info -->
              <div class="flex justify-between items-start">
                <div>
                  <h4 class="text-sm font-extrabold text-slate-900">{{ activePlan.tenGoi }}</h4>
                  <span class="text-xs text-slate-500 font-semibold">Chu kỳ sử dụng: {{ activePlan.soNgayHieuLuc }} ngày</span>
                </div>
                <span class="text-sm font-extrabold text-slate-900">{{ formatPrice(activePlan.giaTien) }}</span>
              </div>

              <hr class="border-slate-200" />

              <div class="space-y-2">
                <label class="text-[10px] font-bold text-slate-500 uppercase">Mã giảm giá</label>
                <div class="flex gap-2">
                  <input
                    v-model="membershipCouponCode"
                    type="text"
                    placeholder="KM2026..."
                    class="flex-grow bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary uppercase text-slate-800"
                  />
                  <button
                    @click="applyMembershipCoupon"
                    class="bg-slate-900 hover:bg-primary text-white font-bold px-3 py-2 text-[10px] rounded-xl transition-all"
                  >Áp dụng</button>
                </div>
                <p v-if="membershipCouponMsg" class="text-[10px] font-semibold" :class="membershipCouponSuccess ? 'text-emerald-600' : 'text-red-600'">
                  {{ membershipCouponMsg }}
                </p>
              </div>

              <!-- Price Breakdown -->
              <div class="space-y-2 text-xs font-semibold text-slate-600">
                <div class="flex justify-between">
                  <span>Giá cước gói</span>
                  <span>{{ formatPrice(activePlan.giaTien) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Số tiền được giảm</span>
                  <span class="text-emerald-600">- {{ formatCurrencyAmount(membershipDiscountAmount) }}</span>
                </div>
                <hr class="border-slate-200" />
                <div class="flex justify-between text-slate-900 text-sm font-black pt-1">
                  <span>Tổng tiền thanh toán</span>
                  <span class="text-primary">{{ formatPrice(membershipFinalAmount) }}</span>
                </div>
              </div>
            </div>

            <!-- Checkbox Auto Renew -->
            <div class="flex items-center space-x-2.5 bg-slate-50 border border-slate-100 rounded-2xl p-4 transition-all">
              <input 
                id="autoRenewToggle" 
                type="checkbox" 
                v-model="autoRenew"
                class="h-4.5 w-4.5 rounded-lg border-slate-300 text-primary focus:ring-primary focus:ring-offset-0 focus:outline-none transition-all cursor-pointer"
              />
              <label for="autoRenewToggle" class="text-xs font-bold text-slate-800 select-none cursor-pointer flex-grow leading-tight">
                Tự động gia hạn gói hội viên khi hết hạn
              </label>
            </div>

            <!-- Auto-renew status Alert -->
            <div class="p-4 rounded-2xl border text-xs font-semibold" :class="autoRenew ? 'bg-indigo-50 border-indigo-100 text-indigo-950' : 'bg-amber-50 border-amber-100 text-amber-950'">
              <div class="flex space-x-2">
                <Info class="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div class="space-y-1">
                  <span class="font-bold">{{ autoRenew ? 'Chính sách tự động gia hạn' : 'Chính sách từng kỳ' }}</span>
                  <p class="leading-relaxed font-normal text-[11px] text-slate-600" v-if="autoRenew">
                    <span v-if="paymentMethod === 'THE_TIN_DUNG'">
                      Hệ thống sẽ tự động trừ số tiền {{ formatPrice(membershipFinalAmount) }} và gia hạn thêm {{ activePlan.soNgayHieuLuc }} ngày sau mỗi chu kỳ qua Thẻ tín dụng đã liên kết.
                    </span>
                    <span v-else>
                      Hệ thống sẽ gửi thông báo nhắc nhở thanh toán khi gói sắp hết hạn để đảm bảo trải nghiệm không bị gián đoạn.
                    </span>
                  </p>
                  <p class="leading-relaxed font-normal text-[11px] text-slate-600" v-else>
                    Gói dịch vụ này sẽ tự động hết hạn / hủy sau {{ activePlan.soNgayHieuLuc }} ngày nếu bạn không thực hiện quét thanh toán tiếp. Không tự động trừ tiền.
                  </p>
                </div>
              </div>
            </div>

            <!-- Checkout Button -->
            <button 
              v-if="paymentMethod === 'THE_TIN_DUNG'"
              @click="submitCheckout"
              :disabled="subscribing || !isCardFormValid"
              class="w-full bg-primary hover:bg-primary-dark text-white font-extrabold py-3.5 rounded-2xl text-xs md:text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <span v-if="subscribing">Đang xử lý kích hoạt...</span>
              <span v-else>Xác nhận và kích hoạt gói</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Join/Manage Family Group Form (Nếu là Độc giả và có liên quan đến nhóm gia đình) -->
    <div 
      v-if="authStore.isAuthenticated && authStore.isReader && activeSub && (!isActiveSubOwner || activeSub.goiDocGia?.chiaSeNhomGiaDinh)" 
      class="max-w-md mx-auto mt-16 bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-slate-200 p-8 space-y-6 shadow-sm text-center"
    >
      <div class="space-y-2">
        <Users class="h-8 w-8 text-primary mx-auto" />
        <h3 class="font-sans text-lg font-bold text-slate-900">Quản Lý Nhóm Gia Đình</h3>
        <p class="text-xs text-slate-500 font-medium">
          Dành riêng cho độc giả đăng ký Gói Gia Đình (Family) chia sẻ quyền lợi mượn sách.
        </p>
      </div>

      <!-- Hiển thị nếu đang trong một nhóm do người khác chia sẻ -->
      <div 
        v-if="activeSub && !isActiveSubOwner" 
        class="bg-primary-light/50 border border-primary-light text-primary-dark text-xs font-semibold p-4 rounded-2xl"
      >
        Bạn đang sử dụng gói hội viên dùng chung chia sẻ từ chủ nhóm:
        <span class="font-bold text-primary">{{ formatReaderName(activeSub.docGia) }}</span>
      </div>

      <!-- Hiển thị nếu là chủ nhóm gói Vàng/Family -->
      <div 
        v-else-if="activeSub && activeSub.goiDocGia?.chiaSeNhomGiaDinh" 
        class="space-y-4"
      >
        <div class="bg-green-50 border border-green-100 text-green-800 text-xs font-semibold p-4 rounded-2xl space-y-3 text-left">
          <div class="text-center space-y-1">
            <p class="font-bold">Bạn là chủ nhóm Gói {{ activeSub.goiDocGia?.tenGoi || 'Family' }}</p>
            <p class="text-[10px] text-green-700 font-black uppercase tracking-wider">
              Thành viên phụ: {{ familyMembers.length }}/{{ familyMemberLimit }} · Còn {{ remainingFamilySlots }} chỗ
            </p>
          </div>

          <div v-if="familyMembers.length > 0" class="space-y-2">
            <div
              v-for="member in familyMembers"
              :key="getReaderCode(member)"
              class="flex items-center justify-between gap-3 rounded-2xl border border-green-100 bg-white/80 px-3 py-2"
            >
              <div class="min-w-0">
                <p class="text-xs font-black text-slate-900 truncate">{{ formatReaderName(member) }}</p>
                <p class="text-[10px] font-bold text-slate-400 truncate">{{ getReaderCode(member) }}</p>
              </div>
              <span class="rounded-full bg-green-100 px-2 py-0.5 text-[9px] font-black uppercase text-green-700">Thành viên</span>
            </div>
          </div>
          <p class="text-[10px] text-slate-400 text-center" v-else>Chưa có thành viên nào trong nhóm</p>
        </div>

        <!-- Form để chủ nhóm thêm thành viên phụ -->
        <div v-if="!isFamilyFull" class="space-y-3 pt-2 text-left">
          <label class="text-xs font-bold text-slate-600 uppercase">Thêm thành viên phụ (còn {{ remainingFamilySlots }} chỗ)</label>
          <div class="flex space-x-2">
            <input 
              v-model="inviterCode" 
              type="text" 
              placeholder="Nhập mã độc giả cần thêm (Ví dụ: DG00024)" 
              class="flex-grow px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-primary focus:border-primary uppercase placeholder-slate-400 text-slate-800 bg-white"
            />
            <button 
              @click="joinFamily" 
              :disabled="joining"
              class="bg-slate-900 hover:bg-primary hover:text-white text-white font-bold px-4 py-2 text-xs rounded-xl transition-all shadow-sm flex-shrink-0"
            >
              <span>{{ joining ? 'Đang thêm...' : 'Thêm thành viên' }}</span>
            </button>
          </div>
        </div>
        <p v-else class="text-[10px] text-slate-400 font-bold mt-2">Nhóm của bạn đã đủ 2 thành viên phụ. Không thể thêm mã mời mới.</p>
      </div>
    </div>
    <!-- Custom Confirm Dialog -->
    <ConfirmModal ref="confirmModal" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import api from '../services/api';
import { CheckCircle, X, Wifi, Battery, QrCode, Check, Info, Users, ChevronDown, ChevronUp, CreditCard, Award } from '@lucide/vue';
import { useToastStore } from '../stores/toast';
import ConfirmModal from '../components/ConfirmModal.vue';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToastStore();
const confirmModal = ref(null);
const showComparison = ref(false);

const plans = ref([]);
const activeSubs = ref([]);
const activeSub = ref(null);
const activePlan = ref(null);
const subscribing = ref(false);
const autoRenew = ref(true);
const membershipCouponCode = ref('');
const membershipCouponInfo = ref(null);
const membershipCouponMsg = ref('');
const membershipCouponSuccess = ref(false);

// Checkout & Credit Card state
const paymentMethod = ref('THE_TIN_DUNG'); // 'THE_TIN_DUNG' or 'VIETQR'
const billingName = ref(authStore.user ? `${authStore.user.hoLot} ${authStore.user.ten}` : '');
const billingCountry = ref('VN');
const cardNumber = ref('');
const cardName = ref(authStore.user ? `${authStore.user.hoLot} ${authStore.user.ten}`.toUpperCase() : '');
const cardExpiry = ref('');
const cardCvc = ref('');

const formattedCardNumber = computed(() => {
  if (!cardNumber.value) return '';
  return cardNumber.value;
});

const isCardFormValid = computed(() => {
  const cleanNum = cardNumber.value.replace(/\s+/g, '');
  return cleanNum.length === 16 && 
         cardName.value.trim().length > 3 && 
         cardExpiry.value.length === 5 && 
         cardCvc.value.length === 3;
});

const formatCardInput = (e) => {
  let val = e.target.value.replace(/\D/g, '');
  if (val.length > 16) val = val.substring(0, 16);
  let formatted = '';
  for (let i = 0; i < val.length; i++) {
    if (i > 0 && i % 4 === 0) {
      formatted += ' ';
    }
    formatted += val[i];
  }
  cardNumber.value = formatted;
};

const formatExpiryInput = (e) => {
  let val = e.target.value.replace(/\D/g, '');
  if (val.length > 4) val = val.substring(0, 4);
  if (val.length >= 2) {
    cardExpiry.value = val.substring(0, 2) + '/' + val.substring(2);
  } else {
    cardExpiry.value = val;
  }
};

const formatCvcInput = (e) => {
  cardCvc.value = e.target.value.replace(/\D/g, '');
};

const closeCheckout = () => {
  activePlan.value = null;
  cardNumber.value = '';
  cardExpiry.value = '';
  cardCvc.value = '';
  membershipCouponCode.value = '';
  membershipCouponInfo.value = null;
  membershipCouponMsg.value = '';
  membershipCouponSuccess.value = false;
};

const activeLoaiGoi = ref('INDIVIDUAL'); // 'INDIVIDUAL' or 'TEAM'

const sortedPlans = computed(() => {
  return [...plans.value].sort((a, b) => a.giaTien - b.giaTien);
});

const filteredPlans = computed(() => {
  return sortedPlans.value.filter(plan => plan.loaiGoi === activeLoaiGoi.value);
});

const isHighlightedPlan = (plan) => {
  return plan && plan.khuyenDung === true;
};
const isStandardPlan = (plan) => (plan?.tenGoi || '').toLowerCase().normalize('NFC').includes('tiêu chuẩn');
const formatPrice = (val) => {
  if (val === 0) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
};

const formatCurrencyAmount = (val) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
};

const membershipDiscountAmount = computed(() => membershipCouponInfo.value?.discountAmount || 0);

const membershipFinalAmount = computed(() => {
  const total = Number(activePlan.value?.giaTien || 0) - membershipDiscountAmount.value;
  return total > 0 ? total : 0;
});

const setActiveSubscriptions = (subscriptions = []) => {
  activeSubs.value = subscriptions
    .filter(s => s.trangThai === 'DANG_HIEU_LUC' && s.goiDocGia)
    .sort((a, b) => (b.goiDocGia.giaTien || 0) - (a.goiDocGia.giaTien || 0));
  activeSub.value = activeSubs.value[0] || subscriptions[0] || null;
};

const familyMemberLimit = 2;
const familyMembers = computed(() => activeSub.value?.nguoiDuocMoi || []);
const remainingFamilySlots = computed(() => Math.max(0, familyMemberLimit - familyMembers.value.length));
const isFamilyFull = computed(() => remainingFamilySlots.value === 0);

const getReaderId = (reader) => reader?._id || reader?.maDocGia || reader || '';
const getReaderCode = (reader) => reader?.maDocGia || reader?._id || reader || '';
const formatReaderName = (reader) => {
  if (!reader || typeof reader === 'string') return reader || 'Không rõ độc giả';
  const fullName = `${reader.hoLot || ''} ${reader.ten || ''}`.trim();
  const code = reader.maDocGia || reader._id || '';
  return fullName ? `${code} - ${fullName}` : code || 'Không rõ độc giả';
};

const isActiveSubOwner = computed(() => {
  if (!activeSub.value || !authStore.user?._id) return false;
  return String(getReaderId(activeSub.value.docGia)) === String(authStore.user._id);
});

const getPlanDescription = (plan) => {
  if (!plan) return '';
  if (plan.giaTien === 0) return 'Gói mặc định áp dụng sẵn cho tất cả độc giả mới đăng ký.';
  const name = plan.tenGoi.toLowerCase();
  if (name.includes('pro')) return 'Gói cao cấp dành cho sinh viên với nhu cầu mượn sách nhiều và đọc Ebook/Audiobook.';
  if (name.includes('vip')) return 'Gói đặc quyền dành cho người đọc thường xuyên, miễn đặt cọc và hỗ trợ giao sách tận nhà.';
  if (name.includes('family') || name.includes('gia đình')) return 'Gói dùng chung dành cho gia đình tối đa 3 tài khoản, tiết kiệm chi phí tối đa.';
  if (name.includes('enterprise') || name.includes('doanh nghiệp')) return 'Gói quy mô lớn dành cho trường học, doanh nghiệp, thư viện đối tác (tối đa 30 tài khoản).';
  return 'Gói Premium nâng cấp thời hạn và giới hạn mượn.';
};

const getPlanPerks = (plan) => {
  if (!plan) return [];
  const name = (plan.tenGoi || '').toLowerCase().normalize('NFC');
  const phiMuonText = plan.phiMuonSachGiay === 0 ? 'Miễn phí' : `${new Intl.NumberFormat('vi-VN').format(plan.phiMuonSachGiay)} ₫/ngày/sách (Giáo trình miễn phí)`;
  const cocText = plan.tienDatCoc === 0 ? 'Miễn đặt cọc' : `${new Intl.NumberFormat('vi-VN').format(plan.tienDatCoc)} ₫`;

  if (name.includes('enterprise')) {
    return [
      `Mượn cùng lúc: ${plan.soSachToiDa} cuốn`,
      `Thời hạn giữ sách: ${plan.soNgayMuonToiDa} ngày`,
      `Phí mượn sách giấy: ${phiMuonText}`,
      `Đặt cọc: ${cocText}`,
      'Gia hạn online: Không giới hạn',
      'Chia sẻ thành viên: 30 tài khoản',
      'Đọc Ebook & Audiobook: Không giới hạn',
      'Hỗ trợ AI tìm sách: Premium'
    ];
  }
  if (name.includes('family')) {
    return [
      `Mượn cùng lúc: ${plan.soSachToiDa} cuốn`,
      `Thời hạn giữ sách: ${plan.soNgayMuonToiDa} ngày`,
      `Phí mượn sách giấy: ${phiMuonText}`,
      `Đặt cọc: ${cocText}`,
      'Gia hạn online: 2 lần',
      'Chia sẻ thành viên: 4 tài khoản',
      'Đọc Ebook & Audiobook: Không giới hạn',
      'Giao nhận tận nhà: 4 lần/tháng'
    ];
  }
  if (name.includes('vip') || name.includes('max')) {
    return [
      `Mượn cùng lúc: ${plan.soSachToiDa} cuốn`,
      `Thời hạn giữ sách: ${plan.soNgayMuonToiDa} ngày`,
      `Phí mượn sách giấy: ${phiMuonText}`,
      `Đặt cọc: ${cocText}`,
      'Gia hạn online: 2 lần',
      'Đọc Ebook & Audiobook: Không giới hạn',
      'Giao nhận tận nhà: 2 lần/tháng',
      'Quầy nhận sách ưu tiên: Có'
    ];
  }
  if (name.includes('pro')) {
    return [
      `Mượn cùng lúc: ${plan.soSachToiDa} cuốn`,
      `Thời hạn giữ sách: ${plan.soNgayMuonToiDa} ngày`,
      `Phí mượn: ${phiMuonText}`,
      `Đặt cọc: ${cocText}`,
      'Gia hạn online: 1 lần',
      'Đọc Ebook: 300 đầu sách',
      'Đọc Audiobook: 50 cuốn',
      'Hỗ trợ AI tìm sách: Nâng cao'
    ];
  }
  // Tiêu chuẩn
  return [
    `Mượn cùng lúc: ${plan.soSachToiDa} cuốn`,
    `Thời hạn giữ sách: ${plan.soNgayMuonToiDa} ngày`,
    `Phí mượn: ${phiMuonText}`,
    `Đặt cọc: ${cocText}`,
    'Gia hạn online: Không hỗ trợ',
    'Đọc Ebook: 20 đầu sách miễn phí',
    'Đọc Audiobook: Không hỗ trợ',
    'Hỗ trợ AI tìm sách: Cơ bản'
  ];
};

const getPlanGiaHanOnline = (plan) => {
  const name = (plan.tenGoi || '').toLowerCase().normalize('NFC');
  if (name.includes('enterprise')) return 'Không giới hạn';
  if (name.includes('family') || name.includes('vip') || name.includes('max')) return '2 lần/lượt';
  if (name.includes('pro')) return '1 lần/lượt';
  return 'Không hỗ trợ';
};

const getPlanChiaSeNhom = (plan) => {
  const name = (plan.tenGoi || '').toLowerCase().normalize('NFC');
  if (name.includes('enterprise')) return 'Tối đa 30 tài khoản';
  if (name.includes('family')) return 'Tối đa 3 tài khoản';
  return 'Không hỗ trợ';
};

const getPlanEbook = (plan) => {
  const name = (plan.tenGoi || '').toLowerCase().normalize('NFC');
  if (name.includes('enterprise') || name.includes('family') || name.includes('vip') || name.includes('max')) {
    return 'Không giới hạn';
  }
  if (name.includes('pro')) return '300+ đầu sách';
  return '20 đầu sách miễn phí';
};

const getPlanAudiobook = (plan) => {
  const name = (plan.tenGoi || '').toLowerCase().normalize('NFC');
  if (name.includes('enterprise') || name.includes('family') || name.includes('vip') || name.includes('max')) {
    return 'Không giới hạn';
  }
  if (name.includes('pro')) return '50+ cuốn';
  return 'Không hỗ trợ';
};

const getPlanGiaoSach = (plan) => {
  const name = (plan.tenGoi || '').toLowerCase().normalize('NFC');
  if (name.includes('enterprise')) return 'Không giới hạn';
  if (name.includes('family')) return '4 lần/tháng';
  if (name.includes('vip') || name.includes('max')) return '2 lần/tháng';
  return 'Không hỗ trợ';
};

const getPlanPhiMuon = (plan) => {
  if (!plan) return 'Miễn phí';
  if (plan.phiMuonSachGiay === 0) return 'Miễn phí';
  return `${new Intl.NumberFormat('vi-VN').format(plan.phiMuonSachGiay)} ₫/ngày/sách`;
};

const getPlanPhatTre = (plan) => {
  if (!plan) return '5.000 ₫/ngày';
  return `${new Intl.NumberFormat('vi-VN').format(plan.phiPhatTreHan)} ₫/ngày/sách`;
};

const isPlanActive = (plan) => {
  if (!authStore.isAuthenticated) return false;
  
  if (plan.giaTien === 0) {
    return activeSubs.value.length === 0 || activeSubs.value.some(sub => isStandardPlan(sub.goiDocGia));
  }
  
  return activeSubs.value.some(sub => sub.trangThai === 'DANG_HIEU_LUC' && sub.goiDocGia?._id === plan._id);
};

const subscribe = async (plan) => {
  if (!authStore.isAuthenticated) {
    const ok = await confirmModal.value.ask({
      title: 'Yêu cầu đăng nhập',
      message: 'Bạn cần đăng nhập tài khoản Độc giả để nâng cấp gói hội viên. Đi đến trang đăng nhập?',
      confirmText: 'Đăng nhập ngay',
      cancelText: 'Hủy bỏ'
    });
    if (ok) {
      router.push('/login');
    }
    return;
  }
  if (authStore.isStaff) {
    toast.show('Nhân viên không thể đăng ký gói độc giả!', 'warning');
    return;
  }

  activePlan.value = plan;
  membershipCouponCode.value = '';
  membershipCouponInfo.value = null;
  membershipCouponMsg.value = '';
  membershipCouponSuccess.value = false;
  paymentMethod.value = 'THE_TIN_DUNG';
  billingName.value = authStore.user ? `${authStore.user.hoLot} ${authStore.user.ten}` : '';
  cardName.value = authStore.user ? `${authStore.user.hoLot} ${authStore.user.ten}`.toUpperCase() : '';
};

const applyMembershipCoupon = async () => {
  membershipCouponMsg.value = '';
  membershipCouponSuccess.value = false;
  membershipCouponInfo.value = null;
  if (!membershipCouponCode.value.trim() || !activePlan.value) return;

  try {
    const res = await api.post('/discounts/validate', {
      code: membershipCouponCode.value.trim().toUpperCase(),
      orderAmount: activePlan.value.giaTien,
      apDungCho: 'GOI_HOI_VIEN'
    });
    if (res.success) {
      membershipCouponInfo.value = res.data;
      membershipCouponSuccess.value = true;
      membershipCouponMsg.value = `Áp dụng mã thành công! Giảm ${formatPrice(res.data.discountAmount)}`;
    }
  } catch (error) {
    membershipCouponMsg.value = error.message || 'Mã giảm giá không hợp lệ.';
  }
};

// VietQR API
const getVietQrUrl = () => {
  if (!activePlan.value) return '';
  const bankId = 'MB';
  const accountNo = '0912345678';
  const amount = membershipFinalAmount.value;
  const readerId = authStore.user?.maDocGia || 'DG00001';
  const addInfo = encodeURIComponent(`DK ${activePlan.value.maGoi} ${readerId}`);
  return `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${addInfo}`;
};

const submitCheckout = async () => {
  if (paymentMethod.value === 'VIETQR') {
    toast.show('Vui lòng quét mã QR hoặc bấm nút "Mô phỏng thanh toán QR" trên điện thoại để hoàn tất!', 'warning');
    return;
  }

  if (!isCardFormValid.value) return;

  const ok = await confirmModal.value.ask({
    title: 'Xác nhận thanh toán thẻ',
    message: `Hệ thống sẽ tiến hành mô phỏng thanh toán số tiền ${formatPrice(membershipFinalAmount.value)} qua thẻ của bạn. Bạn muốn tiếp tục?`,
    confirmText: 'Xác nhận thanh toán',
    cancelText: 'Hủy bỏ'
  });
  if (!ok) return;

  subscribing.value = true;
  try {
    const res = await api.post('/memberships/subscribe', { 
      goiId: activePlan.value._id,
      phuongThucThanhToan: 'THE_TIN_DUNG',
      tuDongGiaHan: autoRenew.value,
      discountCode: membershipCouponCode.value.trim().toUpperCase() || undefined,
      thongTinThe: {
        soThe: cardNumber.value.replace(/\s+/g, ''),
        tenTrenThe: cardName.value,
        ngayHetHan: cardExpiry.value,
        maCVC: cardCvc.value
      }
    });
    if (res.success) {
      toast.show('Kích hoạt Gói hội viên thành công qua thẻ tín dụng! Chào mừng bạn đến với Premium.', 'success');
      activePlan.value = null;
      await authStore.fetchUser();
      const activeRes = await api.get('/memberships/my-subscriptions');
      if (activeRes.success && activeRes.data.length > 0) {
        setActiveSubscriptions(activeRes.data);
      }
      router.push('/profile');
    }
  } catch (error) {
    toast.show(error.message || 'Có lỗi xảy ra khi xác nhận thanh toán thẻ.', 'error');
  } finally {
    subscribing.value = false;
  }
};

const confirmPayment = async () => {
  if (!activePlan.value || subscribing.value) return;
  
  const ok = await confirmModal.value.ask({
    title: 'Xác nhận thanh toán',
    message: `Bạn xác nhận đã thực hiện chuyển khoản số tiền ${formatPrice(membershipFinalAmount.value)} để đăng ký gói ${activePlan.value.tenGoi}?`,
    confirmText: 'Đã chuyển khoản',
    cancelText: 'Quay lại'
  });
  if (!ok) return;

  subscribing.value = true;
  try {
    const res = await api.post('/memberships/subscribe', { 
      goiId: activePlan.value._id,
      phuongThucThanhToan: 'VIETQR',
      tuDongGiaHan: autoRenew.value,
      discountCode: membershipCouponCode.value.trim().toUpperCase() || undefined
    });
    if (res.success) {
      toast.show('Đăng ký gói hội viên thành công! Tài khoản của bạn đã được kích hoạt.', 'success');
      activePlan.value = null;
      await authStore.fetchUser();
      const activeRes = await api.get('/memberships/my-subscriptions');
      if (activeRes.success && activeRes.data.length > 0) {
        setActiveSubscriptions(activeRes.data);
      }
      router.push('/profile');
    }
  } catch (error) {
    toast.show(error.message || 'Có lỗi xảy ra khi xác nhận thanh toán.', 'error');
  } finally {
    subscribing.value = false;
  }
};

const inviterCode = ref('');
const joining = ref(false);

const joinFamily = async () => {
  if (!inviterCode.value) {
    toast.show('Vui lòng nhập mã độc giả người mời!', 'warning');
    return;
  }

  const ok = await confirmModal.value.ask({
    title: 'Xác nhận tham gia nhóm',
    message: `Bạn có chắc chắn muốn tham gia nhóm gia đình của độc giả có mã "${inviterCode.value.toUpperCase()}"?`,
    confirmText: 'Tham gia',
    cancelText: 'Hủy'
  });
  if (!ok) return;

  joining.value = true;
  try {
    const res = await api.post('/memberships/join-family', { maDocGiaMoi: inviterCode.value });
    if (res.success) {
      toast.show(res.data.message || 'Tham gia nhóm gia đình thành công!', 'success');
      inviterCode.value = '';
      // Nạp lại subscription mới
      const activeRes = await api.get('/memberships/my-subscriptions');
      if (activeRes.success && activeRes.data.length > 0) {
        setActiveSubscriptions(activeRes.data);
      }
      await authStore.fetchUser();
    }
  } catch (error) {
    toast.show(error.message || 'Có lỗi xảy ra khi liên kết nhóm.', 'error');
  } finally {
    joining.value = false;
  }
};

const membershipSettings = ref({
  heroTitle: "Gói Hội Viên Độc Giả CTU eLibrary",
  heroSubtitle: "Tài khoản độc giả mặc định được cung cấp Gói Tiêu Chuẩn hoàn toàn miễn phí. Nâng cấp lên gói hội viên Premium để mượn nhiều sách hơn, thời gian lâu hơn.",
  qrTitle: "Quét Mã QR Thanh Toán",
  qrInstruction: "Sau khi bạn quét bằng điện thoại thật của mình hoặc nhấn nút chuyển khoản giả lập trên điện thoại ảo, vui lòng click nút bên cạnh để kích hoạt gói."
});

onMounted(async () => {
  // Tải cấu hình trang gói hội viên
  try {
    const settingRes = await api.get('/settings/membershippage');
    if (settingRes.success && settingRes.data && Object.keys(settingRes.data).length > 0) {
      membershipSettings.value = { ...membershipSettings.value, ...settingRes.data };
    }
  } catch (err) {
    console.error('Fetch membership settings failed:', err);
  }

  // Nạp danh sách các gói hội viên (Công khai)
  try {
    const res = await api.get('/memberships/plans');
    if (res.success) {
      plans.value = res.data;
      if (route.query.plan && route.query.confirm === '1') {
        const targetPlan = plans.value.find(p => p._id === route.query.plan);
        if (targetPlan) {
          subscribe(targetPlan);
        }
      }
    }
  } catch (error) {
    console.error('Fetch plans error:', error);
  }

  // Chỉ nạp gói hội viên đang hoạt động nếu độc giả đã đăng nhập
  if (authStore.isAuthenticated && authStore.isReader) {
    try {
      const res = await api.get('/memberships/my-subscriptions');
      if (res.success && res.data.length > 0) {
        setActiveSubscriptions(res.data);
      }
    } catch (error) {
      console.error('Fetch subscriptions error:', error);
    }
  }
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.scan-laser {
  animation: scan 2.2s infinite linear;
}
.checkout-modal-scroll {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.checkout-modal-scroll::-webkit-scrollbar {
  display: none;
}
@keyframes scan {
  0% { top: 10%; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 90%; opacity: 0; }
}
</style>
