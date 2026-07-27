<template>
  <div class="space-y-12">
    <!-- Tab selector -->
    <div class="flex bg-white p-1 rounded-2xl border border-slate-200 w-full sm:w-[420px] shadow-sm">
      <button 
        @click="activeTab = 'plans'"
        class="flex-1 text-center py-2 text-xs font-bold rounded-xl transition-all"
        :class="activeTab === 'plans' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'"
      >
        Gói hội viên
      </button>
      <button 
        @click="activeTab = 'discounts'"
        class="flex-1 text-center py-2 text-xs font-bold rounded-xl transition-all"
        :class="activeTab === 'discounts' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'"
      >
        Mã giảm giá
      </button>
      <button 
        @click="activeTab = 'interface'"
        class="flex-1 text-center py-2 text-xs font-bold rounded-xl transition-all"
        :class="activeTab === 'interface' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'"
      >
        Cấu hình giao diện
      </button>
    </div>

    <!-- ==================== GÓI HỘI VIÊN ==================== -->
    <section v-if="activeTab === 'plans'" class="space-y-6">
      <div class="flex justify-between items-center border-b pb-3">
        <div>
          <h2 class="font-sans text-2xl font-extrabold text-slate-900">Quản Lý Gói Hội Viên</h2>
          <p class="text-sm text-slate-500 font-medium">Tạo lập, sửa đổi các gói cước độc giả</p>
        </div>
        <button 
          @click="openPlanModal"
          class="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-xl text-xs transition-all shadow-md"
        >
          Thêm gói mới
        </button>
      </div>

      <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <th class="pb-3">Tên gói</th>
              <th class="pb-3">Mã gói</th>
              <th class="pb-3">Giá tiền</th>
              <th class="pb-3">Thời hạn sử dụng</th>
              <th class="pb-3 text-center">Sách tối đa</th>
              <th class="pb-3 text-center">Ngày mượn tối đa</th>
              <th class="pb-3 text-center">Miễn cọc sách</th>
              <th class="pb-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50 text-sm font-medium text-slate-700">
            <tr v-for="plan in plans" :key="plan._id" class="hover:bg-slate-50/55 transition-colors">
              <td class="py-4 font-bold text-slate-950">{{ plan.tenGoi }}</td>
              <td class="py-4 font-mono text-xs text-slate-400">{{ plan.maGoi }}</td>
              <td class="py-4">{{ formatCurrency(plan.giaTien) }}</td>
              <td class="py-4">{{ plan.soNgayHieuLuc }} ngày</td>
              <td class="py-4 text-center font-bold text-slate-800">{{ plan.soSachToiDa }} cuốn</td>
              <td class="py-4 text-center font-bold text-slate-800">{{ plan.soNgayMuonToiDa }} ngày</td>
              <td class="py-4 text-center">
                <span class="text-xs font-bold" :class="plan.mienTienCoc ? 'text-green-600' : 'text-slate-400'">
                  {{ plan.mienTienCoc ? 'Có' : 'Không' }}
                </span>
              </td>
              <td class="py-4 text-right space-x-2">
                <button @click="editPlan(plan)" class="text-xs font-bold text-primary hover:underline">Sửa</button>
                <button @click="deletePlan(plan._id)" class="text-xs font-bold text-red-600 hover:text-red-800 transition-colors">Xóa</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- ==================== MÃ GIẢM GIÁ ==================== -->
    <section v-if="activeTab === 'discounts'" class="space-y-6">
      <div class="flex justify-between items-center border-b pb-3">
        <div>
          <h2 class="font-sans text-2xl font-extrabold text-slate-900">Quản Lý Mã Giảm Giá</h2>
          <p class="text-sm text-slate-500 font-medium">Cấu hình mã khuyến mãi cho phí mượn sách</p>
        </div>
        <button 
          @click="openDiscountModal"
          class="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-xl text-xs transition-all shadow-md"
        >
          Tạo mã mới
        </button>
      </div>

      <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <th class="pb-3">Mã Code</th>
              <th class="pb-3">Tên chiến dịch</th>
              <th class="pb-3">Giá trị giảm</th>
              <th class="pb-3">Đơn tối thiểu</th>
              <th class="pb-3">Số lượng tối đa</th>
              <th class="pb-3">Đã dùng</th>
              <th class="pb-3">Hạn sử dụng</th>
              <th class="pb-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50 text-sm font-medium text-slate-700">
            <tr v-for="code in discounts" :key="code._id" class="hover:bg-slate-50/55 transition-colors">
              <td class="py-4 font-mono font-bold text-slate-950 uppercase">{{ code.maCode }}</td>
              <td class="py-4">{{ code.tenKhuyenMai }}</td>
              <td class="py-4 text-green-600 font-bold">- {{ formatCurrency(code.giaTriGiam) }}</td>
              <td class="py-4">{{ formatCurrency(code.giaTriDonToiThieu) }}</td>
              <td class="py-4 text-center">{{ code.soLuongMaToiDa }}</td>
              <td class="py-4 text-center font-bold">{{ code.soLuotDaDung }}</td>
              <td class="py-4 text-xs text-slate-500">
                {{ formatDate(code.ngayBatDau) }} - {{ formatDate(code.ngayKetThuc) }}
              </td>
              <td class="py-4 text-right space-x-2">
                <button @click="editDiscount(code)" class="text-xs font-bold text-primary hover:underline">Sửa</button>
                <button @click="deleteDiscount(code._id)" class="text-xs font-bold text-red-600 hover:text-red-800 transition-colors">Xóa</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- ==================== CẤU HÌNH GIAO DIỆN ==================== -->
    <section v-if="activeTab === 'interface'" class="space-y-6">
      <div class="border-b pb-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 class="font-sans text-2xl font-extrabold text-slate-900">Cấu Hình Giao Diện</h2>
          <p class="text-sm text-slate-500 font-medium">Cập nhật nội dung động hiển thị trên các trang cổng thông tin</p>
        </div>

        <!-- Sub-tabs Navigation -->
        <div class="flex flex-wrap bg-white p-1 rounded-2xl border border-slate-200 shadow-sm self-start">
          <button 
            type="button"
            @click="activeSubTab = 'home'"
            class="px-4 py-2 text-xs font-bold rounded-xl transition-all"
            :class="activeSubTab === 'home' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'"
          >
            Trang chủ
          </button>
          <button 
            type="button"
            @click="activeSubTab = 'about'"
            class="px-4 py-2 text-xs font-bold rounded-xl transition-all"
            :class="activeSubTab === 'about' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'"
          >
            Giới thiệu
          </button>
          <button 
            type="button"
            @click="activeSubTab = 'catalog'"
            class="px-4 py-2 text-xs font-bold rounded-xl transition-all"
            :class="activeSubTab === 'catalog' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'"
          >
            Danh mục sách
          </button>
          <button 
            type="button"
            @click="activeSubTab = 'membership'"
            class="px-4 py-2 text-xs font-bold rounded-xl transition-all"
            :class="activeSubTab === 'membership' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'"
          >
            Gói hội viên
          </button>
          <button 
            type="button"
            @click="activeSubTab = 'contact'"
            class="px-4 py-2 text-xs font-bold rounded-xl transition-all"
            :class="activeSubTab === 'contact' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'"
          >
            Liên hệ
          </button>
        </div>
      </div>

      <!-- Cấu hình Trang chủ -->
      <div v-if="activeSubTab === 'home'" class="space-y-6">
        <form @submit.prevent="saveHomepageSettings" class="space-y-4">
          <!-- Section 1: Banner & Hero -->
          <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div 
              @click="toggleSection('home_hero')" 
              class="flex justify-between items-center bg-slate-50/70 px-6 py-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-all select-none"
            >
              <h3 class="font-sans font-bold text-slate-800 text-xs uppercase">Phần 1: Banner & Tiêu đề chính (Hero)</h3>
              <ChevronDown 
                :class="collapsedSections.home_hero ? '' : 'rotate-180'" 
                class="h-4 w-4 text-slate-400 transition-transform duration-200" 
              />
            </div>
            <div v-show="!collapsedSections.home_hero" class="p-6 md:p-8 space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div class="space-y-1 md:col-span-2">
                  <label class="text-xs font-bold text-slate-600 uppercase">Tiêu đề Hero chính</label>
                  <input v-model="homepageForm.heroTitle" type="text" required class="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none font-bold" />
                </div>
                <div class="space-y-1 md:col-span-2">
                  <label class="text-xs font-bold text-slate-600 uppercase">Mô tả Hero phụ</label>
                  <textarea v-model="homepageForm.heroSubtitle" rows="3" required class="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none leading-relaxed"></textarea>
                </div>
                <div class="space-y-1 md:col-span-2">
                  <label class="text-xs font-bold text-slate-600 uppercase">Hình nền Banner Hero</label>
                  <div class="flex gap-3">
                    <input 
                      v-model="homepageForm.heroBanner" 
                      type="text" 
                      required 
                      class="flex-1 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none font-mono text-xs" 
                      placeholder="Nhập đường dẫn ảnh hoặc tải ảnh lên..." 
                    />
                    <label class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-3 rounded-xl border border-slate-300 cursor-pointer text-xs flex items-center justify-center transition-colors whitespace-nowrap">
                      <span>Tải ảnh lên</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        class="hidden" 
                        @change="handleImageUpload($event, 'homepage', 'heroBanner')" 
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 2: Steps -->
          <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div 
              @click="toggleSection('home_steps')" 
              class="flex justify-between items-center bg-slate-50/70 px-6 py-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-all select-none"
            >
              <h3 class="font-sans font-bold text-slate-800 text-xs uppercase">Phần 2: Quy trình 4 bước mượn sách</h3>
              <ChevronDown 
                :class="collapsedSections.home_steps ? '' : 'rotate-180'" 
                class="h-4 w-4 text-slate-400 transition-transform duration-200" 
              />
            </div>
            <div v-show="!collapsedSections.home_steps" class="p-6 md:p-8 space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <!-- Bước 1 -->
                <div class="space-y-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <span class="text-xs font-extrabold text-primary uppercase">Bước 1</span>
                  <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-500 uppercase">Tiêu đề</label>
                    <input v-model="homepageForm.step1Title" type="text" required class="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 focus:outline-none text-xs font-bold" />
                  </div>
                  <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-500 uppercase">Mô tả</label>
                    <textarea v-model="homepageForm.step1Desc" rows="2" required class="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 focus:outline-none text-xs leading-relaxed"></textarea>
                  </div>
                </div>
                <!-- Bước 2 -->
                <div class="space-y-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <span class="text-xs font-extrabold text-primary uppercase">Bước 2</span>
                  <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-500 uppercase">Tiêu đề</label>
                    <input v-model="homepageForm.step2Title" type="text" required class="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 focus:outline-none text-xs font-bold" />
                  </div>
                  <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-500 uppercase">Mô tả</label>
                    <textarea v-model="homepageForm.step2Desc" rows="2" required class="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 focus:outline-none text-xs leading-relaxed"></textarea>
                  </div>
                </div>
                <!-- Bước 3 -->
                <div class="space-y-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <span class="text-xs font-extrabold text-primary uppercase">Bước 3</span>
                  <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-500 uppercase">Tiêu đề</label>
                    <input v-model="homepageForm.step3Title" type="text" required class="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 focus:outline-none text-xs font-bold" />
                  </div>
                  <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-500 uppercase">Mô tả</label>
                    <textarea v-model="homepageForm.step3Desc" rows="2" required class="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 focus:outline-none text-xs leading-relaxed"></textarea>
                  </div>
                </div>
                <!-- Bước 4 -->
                <div class="space-y-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <span class="text-xs font-extrabold text-primary uppercase">Bước 4</span>
                  <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-500 uppercase">Tiêu đề</label>
                    <input v-model="homepageForm.step4Title" type="text" required class="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 focus:outline-none text-xs font-bold" />
                  </div>
                  <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-500 uppercase">Mô tả</label>
                    <textarea v-model="homepageForm.step4Desc" rows="2" required class="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 focus:outline-none text-xs leading-relaxed"></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 3: FAQs -->
          <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div 
              @click="toggleSection('home_faqs')" 
              class="flex justify-between items-center bg-slate-50/70 px-6 py-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-all select-none"
            >
              <h3 class="font-sans font-bold text-slate-800 text-xs uppercase">Phần 3: Câu hỏi thường gặp (FAQs)</h3>
              <ChevronDown 
                :class="collapsedSections.home_faqs ? '' : 'rotate-180'" 
                class="h-4 w-4 text-slate-400 transition-transform duration-200" 
              />
            </div>
            <div v-show="!collapsedSections.home_faqs" class="p-6 md:p-8 space-y-6">
              <div class="flex justify-between items-center">
                <span class="text-xs font-bold text-slate-500">DANH SÁCH HỎI ĐÁP</span>
                <button 
                  type="button" 
                  @click="addFaq"
                  class="bg-secondary hover:bg-opacity-90 text-slate-900 font-bold text-[10px] px-3.5 py-1.5 rounded-lg transition-colors flex items-center space-x-1"
                >
                  <Plus class="h-3 w-3" />
                  <span>Thêm câu hỏi</span>
                </button>
              </div>

              <div v-if="!homepageForm.faqs || homepageForm.faqs.length === 0" class="text-center py-6 text-slate-400 text-xs font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Chưa có câu hỏi thường gặp nào được thiết lập. Nhấn "Thêm câu hỏi" để tạo mới.
              </div>

              <div v-else class="space-y-4">
                <div 
                  v-for="(faq, index) in homepageForm.faqs" 
                  :key="index"
                  class="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 relative group"
                >
                  <button 
                    type="button" 
                    @click="removeFaq(index)"
                    class="absolute top-3 right-3 text-red-500 hover:text-red-700 opacity-60 hover:opacity-100 transition-opacity flex items-center space-x-0.5"
                    title="Xóa câu hỏi này"
                  >
                    <Trash2 class="h-3 w-3" />
                    <span class="font-bold text-[10px]">Xóa</span>
                  </button>
                  <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-500 uppercase">Câu hỏi {{ index + 1 }}</label>
                    <input v-model="faq.question" type="text" required class="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 focus:outline-none text-xs font-bold pr-16" />
                  </div>
                  <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-500 uppercase">Câu trả lời</label>
                    <textarea v-model="faq.answer" rows="2" required class="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 focus:outline-none text-xs leading-relaxed"></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end pt-4">
            <button type="submit" class="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md text-xs">
              Lưu Cấu Hình Trang Chủ
            </button>
          </div>
        </form>
      </div>

      <!-- Cấu hình Trang Giới thiệu -->
      <div v-if="activeSubTab === 'about'" class="space-y-6">
        <form @submit.prevent="saveAboutpageSettings" class="space-y-4">
          <!-- Section 1: Intro -->
          <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div 
              @click="toggleSection('about_intro')" 
              class="flex justify-between items-center bg-slate-50/70 px-6 py-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-all select-none"
            >
              <h3 class="font-sans font-bold text-slate-800 text-xs uppercase">Phần 1: Giới thiệu chung</h3>
              <ChevronDown 
                :class="collapsedSections.about_intro ? '' : 'rotate-180'" 
                class="h-4 w-4 text-slate-400 transition-transform duration-200" 
              />
            </div>
            <div v-show="!collapsedSections.about_intro" class="p-6 md:p-8 space-y-6">
              <div class="grid grid-cols-1 gap-6 text-sm">
                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-600 uppercase">Tiêu đề chính giới thiệu</label>
                  <input v-model="aboutpageForm.title" type="text" required class="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none font-bold" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-600 uppercase">Mô tả chi tiết thư viện</label>
                  <textarea v-model="aboutpageForm.description" rows="4" required class="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none leading-relaxed"></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 2: History -->
          <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div 
              @click="toggleSection('about_history')" 
              class="flex justify-between items-center bg-slate-50/70 px-6 py-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-all select-none"
            >
              <h3 class="font-sans font-bold text-slate-800 text-xs uppercase">Phần 2: Lịch sử phát triển</h3>
              <ChevronDown 
                :class="collapsedSections.about_history ? '' : 'rotate-180'" 
                class="h-4 w-4 text-slate-400 transition-transform duration-200" 
              />
            </div>
            <div v-show="!collapsedSections.about_history" class="p-6 md:p-8 space-y-6">
              <div class="grid grid-cols-1 gap-6 text-sm">
                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-600 uppercase">Tiêu đề lịch sử</label>
                  <input v-model="aboutpageForm.historyTitle" type="text" required class="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none font-bold" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-600 uppercase">Nội dung lịch sử phát triển</label>
                  <textarea v-model="aboutpageForm.historyContent" rows="4" required class="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none leading-relaxed"></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 3: Vision & Values -->
          <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div 
              @click="toggleSection('about_vision')" 
              class="flex justify-between items-center bg-slate-50/70 px-6 py-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-all select-none"
            >
              <h3 class="font-sans font-bold text-slate-800 text-xs uppercase">Phần 3: Tầm nhìn, Sứ mệnh & Giá trị cốt lõi</h3>
              <ChevronDown 
                :class="collapsedSections.about_vision ? '' : 'rotate-180'" 
                class="h-4 w-4 text-slate-400 transition-transform duration-200" 
              />
            </div>
            <div v-show="!collapsedSections.about_vision" class="p-6 md:p-8 space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-600 uppercase">Tầm nhìn (Vision)</label>
                  <textarea v-model="aboutpageForm.vision" rows="3" required class="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none leading-relaxed"></textarea>
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-600 uppercase">Sứ mệnh (Mission)</label>
                  <textarea v-model="aboutpageForm.mission" rows="3" required class="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none leading-relaxed"></textarea>
                </div>
                <div class="space-y-1 md:col-span-2">
                  <label class="text-xs font-bold text-slate-600 uppercase">Giá trị cốt lõi (Core Values)</label>
                  <textarea v-model="aboutpageForm.values" rows="3" required class="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none leading-relaxed"></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 4: Stats -->
          <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div 
              @click="toggleSection('about_stats')" 
              class="flex justify-between items-center bg-slate-50/70 px-6 py-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-all select-none"
            >
              <h3 class="font-sans font-bold text-slate-800 text-xs uppercase">Phần 4: Số liệu thống kê</h3>
              <ChevronDown 
                :class="collapsedSections.about_stats ? '' : 'rotate-180'" 
                class="h-4 w-4 text-slate-400 transition-transform duration-200" 
              />
            </div>
            <div v-show="!collapsedSections.about_stats" class="p-6 md:p-8 space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-600 uppercase">Số năm kinh nghiệm</label>
                  <input v-model="aboutpageForm.stats.years" type="text" required class="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none font-bold" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-600 uppercase">Số độc giả tin tưởng</label>
                  <input v-model="aboutpageForm.stats.readers" type="text" required class="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none font-bold" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-600 uppercase">Số chi nhánh thư viện</label>
                  <input v-model="aboutpageForm.stats.branches" type="text" required class="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none font-bold" />
                </div>
              </div>
            </div>
          </div>

          <!-- Section 5: Team Members -->
          <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div 
              @click="toggleSection('about_team')" 
              class="flex justify-between items-center bg-slate-50/70 px-6 py-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-all select-none"
            >
              <h3 class="font-sans font-bold text-slate-800 text-xs uppercase">Phần 5: Ban giám đốc & Thủ thư</h3>
              <ChevronDown 
                :class="collapsedSections.about_team ? '' : 'rotate-180'" 
                class="h-4 w-4 text-slate-400 transition-transform duration-200" 
              />
            </div>
            <div v-show="!collapsedSections.about_team" class="p-6 md:p-8 space-y-6">
              <div class="flex justify-between items-center">
                <span class="text-xs font-bold text-slate-500">DANH SÁCH THÀNH VIÊN BAN ĐIỀU HÀNH</span>
                <button 
                  type="button" 
                  @click="addTeamMember"
                  class="bg-secondary hover:bg-opacity-90 text-slate-900 font-bold text-[10px] px-3.5 py-1.5 rounded-lg transition-colors flex items-center space-x-1"
                >
                  <Plus class="h-3 w-3" />
                  <span>Thêm thành viên</span>
                </button>
              </div>

              <div v-if="!aboutpageForm.teamMembers || aboutpageForm.teamMembers.length === 0" class="text-center py-6 text-slate-400 text-xs font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Chưa có thành viên nào được thiết lập. Nhấn "Thêm thành viên" để tạo mới.
              </div>

              <div v-else class="space-y-4">
                <div 
                  v-for="(member, index) in aboutpageForm.teamMembers" 
                  :key="index"
                  class="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 relative group"
                >
                  <button 
                    type="button" 
                    @click="removeTeamMember(index)"
                    class="absolute top-3 right-3 text-red-500 hover:text-red-700 opacity-60 hover:opacity-100 transition-opacity flex items-center space-x-0.5"
                    title="Xóa thành viên này"
                  >
                    <Trash2 class="h-3 w-3" />
                    <span class="font-bold text-[10px]">Xóa</span>
                  </button>
                  
                  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="space-y-1">
                      <label class="text-[10px] font-bold text-slate-500 uppercase">Họ và Tên</label>
                      <input v-model="member.name" type="text" required class="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 focus:outline-none text-xs font-bold" />
                    </div>
                    <div class="space-y-1">
                      <label class="text-[10px] font-bold text-slate-500 uppercase">Chức vụ / Vai trò</label>
                      <input v-model="member.role" type="text" required class="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 focus:outline-none text-xs font-bold" />
                    </div>
                    <div class="space-y-1">
                      <label class="text-[10px] font-bold text-slate-500 uppercase">Ký tự đại diện (fallback)</label>
                      <input v-model="member.avatarText" type="text" maxlength="1" required class="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 focus:outline-none text-xs font-bold uppercase text-center" />
                    </div>
                    <div class="space-y-1">
                      <label class="text-[10px] font-bold text-slate-500 uppercase">Ảnh đại diện (Link/File)</label>
                      <div class="flex space-x-1">
                        <input v-model="member.avatar" type="text" placeholder="https://..." class="flex-grow bg-white px-2 py-1.5 rounded-xl border border-slate-200 focus:outline-none text-[10px] font-semibold" />
                        <label class="bg-primary hover:bg-opacity-95 text-white font-bold text-[9px] px-2 py-1.5 rounded-xl transition-all shadow-sm flex items-center justify-center cursor-pointer select-none">
                          <span>Tải lên</span>
                          <input type="file" accept="image/*" class="hidden" @change="e => handleMemberAvatarUpload(e, index)" />
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div v-if="member.avatar" class="mt-2 flex items-center space-x-2 bg-white p-2 rounded-xl border border-slate-100">
                    <img :src="getImageUrl(member.avatar)" class="h-6 w-6 rounded-full object-cover border border-slate-200 bg-slate-50" />
                    <span class="text-[9px] text-slate-400 truncate max-w-[300px] font-mono">{{ member.avatar }}</span>
                    <button type="button" @click="member.avatar = ''" class="text-red-500 hover:text-red-700 text-[10px] font-extrabold ml-auto">Xóa ảnh</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end pt-4">
            <button type="submit" class="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md text-xs">
              Lưu Cấu Hình Trang Giới Thiệu
            </button>
          </div>
        </form>
      </div>

      <!-- Cấu hình Trang Danh mục sách -->
      <div v-if="activeSubTab === 'catalog'" class="space-y-6">
        <form @submit.prevent="saveCatalogpageSettings" class="space-y-4">
          <!-- Section 1: Hero banner -->
          <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div 
              @click="toggleSection('catalog_hero')" 
              class="flex justify-between items-center bg-slate-50/70 px-6 py-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-all select-none"
            >
              <h3 class="font-sans font-bold text-slate-800 text-xs uppercase">Phần 1: Banner chính & Tiêu đề</h3>
              <ChevronDown 
                :class="collapsedSections.catalog_hero ? '' : 'rotate-180'" 
                class="h-4 w-4 text-slate-400 transition-transform duration-200" 
              />
            </div>
            <div v-show="!collapsedSections.catalog_hero" class="p-6 md:p-8 space-y-6">
              <div class="grid grid-cols-1 gap-6 text-sm">
                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-600 uppercase">Tiêu đề Hero chính</label>
                  <input v-model="catalogpageForm.heroTitle" type="text" required class="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none font-bold" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-600 uppercase">Mô tả Hero phụ</label>
                  <textarea v-model="catalogpageForm.heroSubtitle" rows="3" required class="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none leading-relaxed"></textarea>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end pt-4">
            <button type="submit" class="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md text-xs">
              Lưu Cấu Hình Danh Mục Sách
            </button>
          </div>
        </form>
      </div>

      <!-- Cấu hình Trang Gói hội viên -->
      <div v-if="activeSubTab === 'membership'" class="space-y-6">
        <form @submit.prevent="saveMembershippageSettings" class="space-y-4">
          <!-- Section 1: Hero Intro -->
          <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div 
              @click="toggleSection('membership_hero')" 
              class="flex justify-between items-center bg-slate-50/70 px-6 py-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-all select-none"
            >
              <h3 class="font-sans font-bold text-slate-800 text-xs uppercase">Phần 1: Banner giới thiệu</h3>
              <ChevronDown 
                :class="collapsedSections.membership_hero ? '' : 'rotate-180'" 
                class="h-4 w-4 text-slate-400 transition-transform duration-200" 
              />
            </div>
            <div v-show="!collapsedSections.membership_hero" class="p-6 md:p-8 space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div class="space-y-1 md:col-span-2">
                  <label class="text-xs font-bold text-slate-600 uppercase">Tiêu đề Hero chính</label>
                  <input v-model="membershippageForm.heroTitle" type="text" required class="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none font-bold" />
                </div>
                <div class="space-y-1 md:col-span-2">
                  <label class="text-xs font-bold text-slate-600 uppercase">Mô tả Hero phụ</label>
                  <textarea v-model="membershippageForm.heroSubtitle" rows="3" required class="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none leading-relaxed"></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 2: QR Payment -->
          <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div 
              @click="toggleSection('membership_qr')" 
              class="flex justify-between items-center bg-slate-50/70 px-6 py-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-all select-none"
            >
              <h3 class="font-sans font-bold text-slate-800 text-xs uppercase">Phần 2: Hướng dẫn thanh toán QR</h3>
              <ChevronDown 
                :class="collapsedSections.membership_qr ? '' : 'rotate-180'" 
                class="h-4 w-4 text-slate-400 transition-transform duration-200" 
              />
            </div>
            <div v-show="!collapsedSections.membership_qr" class="p-6 md:p-8 space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-600 uppercase">Tiêu đề thanh toán</label>
                  <input v-model="membershippageForm.qrTitle" type="text" required class="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none font-bold" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-600 uppercase">Hướng dẫn thanh toán</label>
                  <textarea v-model="membershippageForm.qrInstruction" rows="3" required class="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none leading-relaxed"></textarea>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end pt-4">
            <button type="submit" class="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md text-xs">
              Lưu Cấu Hình Gói Hội Viên
            </button>
          </div>
        </form>
      </div>

      <!-- Cấu hình Trang Liên hệ -->
      <div v-if="activeSubTab === 'contact'" class="space-y-6">
        <form @submit.prevent="saveContactpageSettings" class="space-y-4">
          <!-- Section 1: Hero & Map -->
          <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div 
              @click="toggleSection('contact_hero')" 
              class="flex justify-between items-center bg-slate-50/70 px-6 py-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-all select-none"
            >
              <h3 class="font-sans font-bold text-slate-800 text-xs uppercase">Phần 1: Banner & Bản đồ nhúng</h3>
              <ChevronDown 
                :class="collapsedSections.contact_hero ? '' : 'rotate-180'" 
                class="h-4 w-4 text-slate-400 transition-transform duration-200" 
              />
            </div>
            <div v-show="!collapsedSections.contact_hero" class="p-6 md:p-8 space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div class="space-y-1 md:col-span-2">
                  <label class="text-xs font-bold text-slate-600 uppercase">Tiêu đề trang liên hệ</label>
                  <input v-model="contactpageForm.title" type="text" required class="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none font-bold" />
                </div>
                <div class="space-y-1 md:col-span-2">
                  <label class="text-xs font-bold text-slate-600 uppercase">Mô tả phụ</label>
                  <textarea v-model="contactpageForm.subtitle" rows="2" required class="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none leading-relaxed"></textarea>
                </div>
                <div class="space-y-1 md:col-span-2">
                  <label class="text-xs font-bold text-slate-600 uppercase">Đường dẫn nhúng bản đồ Google Maps (Embed Map Iframe URL)</label>
                  <input v-model="contactpageForm.mapUrl" type="text" required class="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none font-mono text-xs" />
                </div>
              </div>
            </div>
          </div>

          <!-- Section 2: Basic Info -->
          <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div 
              @click="toggleSection('contact_info')" 
              class="flex justify-between items-center bg-slate-50/70 px-6 py-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-all select-none"
            >
              <h3 class="font-sans font-bold text-slate-800 text-xs uppercase">Phần 2: Thông tin liên hệ cơ bản</h3>
              <ChevronDown 
                :class="collapsedSections.contact_info ? '' : 'rotate-180'" 
                class="h-4 w-4 text-slate-400 transition-transform duration-200" 
              />
            </div>
            <div v-show="!collapsedSections.contact_info" class="p-6 md:p-8 space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-600 uppercase">Tên đơn vị thư viện</label>
                  <input v-model="contactpageForm.libraryName" type="text" required class="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none font-bold" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-600 uppercase">Địa chỉ chi tiết</label>
                  <input v-model="contactpageForm.address" type="text" required class="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-600 uppercase">Số điện thoại Hotline</label>
                  <input v-model="contactpageForm.hotline" type="text" required class="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-600 uppercase">Địa chỉ Email</label>
                  <input v-model="contactpageForm.email" type="email" required class="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none" />
                </div>
              </div>
            </div>
          </div>

          <!-- Section 3: Extra Info -->
          <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div 
              @click="toggleSection('contact_more')" 
              class="flex justify-between items-center bg-slate-50/70 px-6 py-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-all select-none"
            >
              <h3 class="font-sans font-bold text-slate-800 text-xs uppercase">Phần 3: Giờ làm việc & Lưu ý</h3>
              <ChevronDown 
                :class="collapsedSections.contact_more ? '' : 'rotate-180'" 
                class="h-4 w-4 text-slate-400 transition-transform duration-200" 
              />
            </div>
            <div v-show="!collapsedSections.contact_more" class="p-6 md:p-8 space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-600 uppercase">Tiêu đề thông tin thêm</label>
                  <input v-model="contactpageForm.moreTitle" type="text" required class="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none font-bold" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-600 uppercase">Giờ làm việc</label>
                  <textarea v-model="contactpageForm.moreHours" rows="2" required class="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none leading-relaxed"></textarea>
                </div>
                <div class="space-y-1 md:col-span-2">
                  <label class="text-xs font-bold text-slate-600 uppercase">Lưu ý khi mượn sách</label>
                  <textarea v-model="contactpageForm.moreNote" rows="2" required class="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none leading-relaxed"></textarea>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end pt-4">
            <button type="submit" class="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md text-xs">
              Lưu Cấu Hình Liên Hệ
            </button>
          </div>
        </form>
      </div>
    </section>

    <!-- Plans Modal -->
    <Teleport to="body">
      <div 
        v-if="showPlanModal" 
        class="fixed inset-0 bg-slate-900 bg-opacity-65 z-[9999] overflow-y-auto p-4 md:py-8 flex items-start justify-center backdrop-blur-sm"
        @click.self="showPlanModal = false"
      >
      <div class="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 space-y-6 shadow-2xl relative my-auto">
        <button @click="showPlanModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X class="h-6 w-6" />
        </button>

        <h2 class="font-sans text-xl font-extrabold text-slate-900 border-b pb-2">
          {{ isPlanEdit ? 'SỬA GÓI HỘI VIÊN' : 'THÊM GÓI HỘI VIÊN MỚI' }}
        </h2>

        <form class="space-y-4 text-sm" @submit.prevent="savePlan">
          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-600 uppercase">Tên gói</label>
            <input v-model="planForm.tenGoi" type="text" required placeholder="Gói VIP Mới" class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-600 uppercase">Giá tiền (VND)</label>
              <input v-model="planForm.giaTien" type="number" required placeholder="99000" class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" />
            </div>
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-600 uppercase">Thời hạn (ngày)</label>
              <input v-model="planForm.soNgayHieuLuc" type="number" required placeholder="30" class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-600 uppercase">Sách mượn tối đa</label>
              <input v-model="planForm.soSachToiDa" type="number" required placeholder="10" class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" />
            </div>
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-600 uppercase">Ngày mượn tối đa</label>
              <input v-model="planForm.soNgayMuonToiDa" type="number" required placeholder="30" class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" />
            </div>
          </div>

          <div class="flex items-center space-x-2 pt-2">
            <input type="checkbox" v-model="planForm.mienTienCoc" id="mienTienCoc" class="h-4 w-4 rounded text-primary focus:ring-primary" />
            <label for="mienTienCoc" class="text-xs font-bold text-slate-600 uppercase">Miễn tiền đặt cọc sách</label>
          </div>

          <button type="submit" class="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition-all shadow-md">
            Lưu gói
          </button>
        </form>
      </div>
    </div>
    </Teleport>

    <!-- Discounts Modal -->
    <Teleport to="body">
      <div 
        v-if="showDiscountModal" 
        class="fixed inset-0 bg-slate-900 bg-opacity-65 z-[9999] overflow-y-auto p-4 md:py-8 flex items-start justify-center backdrop-blur-sm"
        @click.self="showDiscountModal = false"
      >
      <div class="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 space-y-6 shadow-2xl relative my-auto">
        <button @click="showDiscountModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X class="h-6 w-6" />
        </button>

        <h2 class="font-sans text-xl font-extrabold text-slate-900 border-b pb-2">
          {{ isDiscountEdit ? 'SỬA MÃ GIẢM GIÁ' : 'TẠO MÃ GIẢM GIÁ MỚI' }}
        </h2>

        <form class="space-y-4 text-sm" @submit.prevent="saveDiscount">
          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-600 uppercase">Mã code</label>
            <input v-model="discountForm.maCode" type="text" :disabled="isDiscountEdit" required placeholder="KM2026..." class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none uppercase" />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-600 uppercase">Tên khuyến mại</label>
            <input v-model="discountForm.tenKhuyenMai" type="text" required placeholder="Giảm giá mượn hè" class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-600 uppercase">Số tiền giảm (VND)</label>
              <input v-model="discountForm.giaTriGiam" type="number" required placeholder="10000" class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" />
            </div>
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-600 uppercase">Số lượng mã tối đa</label>
              <input v-model="discountForm.soLuongMaToiDa" type="number" required placeholder="100" class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" />
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-600 uppercase">Đơn tối thiểu áp dụng (VND)</label>
            <input v-model="discountForm.giaTriDonToiThieu" type="number" required placeholder="50000" class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-600 uppercase">Ngày bắt đầu</label>
              <input v-model="discountForm.ngayBatDau" type="date" required class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" />
            </div>
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-600 uppercase">Ngày kết thúc</label>
              <input v-model="discountForm.ngayKetThuc" type="date" required class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" />
            </div>
          </div>

          <button type="submit" class="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition-all shadow-md">
            Lưu mã giảm
          </button>
        </form>
      </div>
    </div>
    </Teleport>
    
    <!-- Custom Confirm Dialog -->
    <ConfirmModal ref="confirmModal" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../services/api';
import { X, ChevronDown, Plus, Trash2 } from '@lucide/vue';
import ConfirmModal from '../../components/ConfirmModal.vue';
import { useToastStore } from '../../stores/toast';

const confirmModal = ref(null);
const toast = useToastStore();
const activeTab = ref('plans');
const activeSubTab = ref('home');

const collapsedSections = ref({
  // Homepage
  home_hero: false,
  home_steps: false,
  home_faqs: false,
  // Aboutpage
  about_intro: false,
  about_history: false,
  about_vision: false,
  about_stats: false,
  about_team: false,
  // Catalogpage
  catalog_hero: false,
  // Membershippage
  membership_hero: false,
  membership_qr: false,
  // Contactpage
  contact_hero: false,
  contact_info: false,
  contact_more: false
});

const toggleSection = (sectionName) => {
  collapsedSections.value[sectionName] = !collapsedSections.value[sectionName];
};

const plans = ref([]);
const discounts = ref([]);

const showPlanModal = ref(false);
const isPlanEdit = ref(false);
const planEditId = ref(null);
const planForm = ref({
  tenGoi: '',
  giaTien: 0,
  soNgayHieuLuc: 30,
  soSachToiDa: 10,
  soNgayMuonToiDa: 30,
  mienTienCoc: true
});

const showDiscountModal = ref(false);
const isDiscountEdit = ref(false);
const discountEditId = ref(null);
const discountForm = ref({
  maCode: '',
  tenKhuyenMai: '',
  giaTriGiam: 10000,
  giaTriDonToiThieu: 50000,
  soLuongMaToiDa: 100,
  ngayBatDau: '',
  ngayKetThuc: ''
});

const formatCurrency = (val) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

const fetchPlans = async () => {
  try {
    const res = await api.get('/memberships/plans');
    if (res.success) plans.value = res.data;
  } catch (error) {
    console.error('Fetch plans settings error:', error);
  }
};

const fetchDiscounts = async () => {
  try {
    const res = await api.get('/discounts');
    if (res.success) discounts.value = res.data;
  } catch (error) {
    console.error('Fetch discounts settings error:', error);
  }
};

// Plan Operations
const openPlanModal = () => {
  isPlanEdit.value = false;
  planEditId.value = null;
  planForm.value = { tenGoi: '', giaTien: 99000, soNgayHieuLuc: 30, soSachToiDa: 10, soNgayMuonToiDa: 30, mienTienCoc: true };
  showPlanModal.value = true;
};

const editPlan = (plan) => {
  isPlanEdit.value = true;
  planEditId.value = plan._id;
  planForm.value = { ...plan };
  showPlanModal.value = true;
};

const savePlan = async () => {
  const ok = await confirmModal.value.ask({ message: 'Bạn có chắc chắn muốn lưu (thêm/sửa) thông tin gói hội viên này không?' });
  if (!ok) return;
  try {
    if (isPlanEdit.value) {
      await api.put(`/memberships/plans/${planEditId.value}`, planForm.value);
      toast.show('Cập nhật gói hội viên thành công!');
    } else {
      await api.post('/memberships/plans', planForm.value);
      toast.show('Tạo gói hội viên mới thành công!');
    }
    showPlanModal.value = false;
    fetchPlans();
  } catch (error) {
    toast.show(error.message, 'error');
  }
};

const deletePlan = async (id) => {
  const ok = await confirmModal.value.ask({ message: 'Bạn có chắc chắn muốn xóa gói hội viên này không?' });
  if (!ok) return;
  try {
    await api.delete(`/memberships/plans/${id}`);
    toast.show('Xóa gói hội viên thành công!');
    fetchPlans();
  } catch (error) {
    toast.show(error.message, 'error');
  }
};

// Discount Operations
const openDiscountModal = () => {
  isDiscountEdit.value = false;
  discountEditId.value = null;
  discountForm.value = {
    maCode: '',
    tenKhuyenMai: '',
    giaTriGiam: 10000,
    giaTriDonToiThieu: 50000,
    soLuongMaToiDa: 100,
    ngayBatDau: new Date().toISOString().split('T')[0],
    ngayKetThuc: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  };
  showDiscountModal.value = true;
};

const editDiscount = (code) => {
  isDiscountEdit.value = true;
  discountEditId.value = code._id;
  discountForm.value = {
    ...code,
    ngayBatDau: new Date(code.ngayBatDau).toISOString().split('T')[0],
    ngayKetThuc: new Date(code.ngayKetThuc).toISOString().split('T')[0]
  };
  showDiscountModal.value = true;
};

const saveDiscount = async () => {
  const ok = await confirmModal.value.ask({ message: 'Bạn có chắc chắn muốn lưu (thêm/sửa) mã giảm giá này không?' });
  if (!ok) return;
  try {
    if (isDiscountEdit.value) {
      await api.put(`/discounts/${discountEditId.value}`, discountForm.value);
      toast.show('Cập nhật mã giảm giá thành công!');
    } else {
      await api.post('/discounts', discountForm.value);
      toast.show('Tạo mã giảm giá mới thành công!');
    }
    showDiscountModal.value = false;
    fetchDiscounts();
  } catch (error) {
    toast.show(error.message, 'error');
  }
};

const deleteDiscount = async (id) => {
  const ok = await confirmModal.value.ask({ message: 'Bạn có chắc chắn muốn xóa mã giảm giá này không?' });
  if (!ok) return;
  try {
    await api.delete(`/discounts/${id}`);
    toast.show('Xóa mã giảm giá thành công!');
    fetchDiscounts();
  } catch (error) {
    toast.show(error.message, 'error');
  }
};

// Interface Settings Operations
const homepageForm = ref({
  heroTitle: '',
  heroSubtitle: '',
  heroBanner: '',
  step1Title: '',
  step1Desc: '',
  step2Title: '',
  step2Desc: '',
  step3Title: '',
  step3Desc: '',
  step4Title: '',
  step4Desc: '',
  faqs: []
});

const addFaq = async () => {
  const ok = await confirmModal.value.ask({ message: 'Bạn có chắc chắn muốn thêm một câu hỏi thường gặp (FAQ) mới không?' });
  if (!ok) return;
  if (!homepageForm.value.faqs) {
    homepageForm.value.faqs = [];
  }
  homepageForm.value.faqs.push({ question: '', answer: '' });
};

const removeFaq = async (index) => {
  const ok = await confirmModal.value.ask({ message: 'Bạn có chắc chắn muốn xóa câu hỏi thường gặp này không?' });
  if (!ok) return;
  homepageForm.value.faqs.splice(index, 1);
};

const aboutpageForm = ref({
  title: '',
  description: '',
  historyTitle: '',
  historyContent: '',
  vision: '',
  mission: '',
  values: '',
  stats: {
    years: '10+',
    readers: '50,000+',
    branches: '02'
  },
  teamMembers: []
});

const addTeamMember = async () => {
  const ok = await confirmModal.value.ask({ message: 'Bạn có chắc chắn muốn thêm một thành viên ban điều hành mới không?' });
  if (!ok) return;
  if (!aboutpageForm.value.teamMembers) {
    aboutpageForm.value.teamMembers = [];
  }
  aboutpageForm.value.teamMembers.push({ name: '', role: '', avatarText: 'T', avatar: '' });
};

const removeTeamMember = async (index) => {
  const ok = await confirmModal.value.ask({ message: 'Bạn có chắc chắn muốn xóa thành viên này khỏi ban điều hành không?' });
  if (!ok) return;
  aboutpageForm.value.teamMembers.splice(index, 1);
};

const catalogpageForm = ref({
  heroTitle: '',
  heroSubtitle: ''
});

const membershippageForm = ref({
  heroTitle: '',
  heroSubtitle: '',
  qrTitle: '',
  qrInstruction: ''
});

const contactpageForm = ref({
  title: '',
  subtitle: '',
  mapUrl: '',
  libraryName: '',
  address: '',
  hotline: '',
  email: '',
  moreTitle: '',
  moreHours: '',
  moreNote: ''
});

const fetchSettings = async () => {
  try {
    const homeRes = await api.get('/settings/homepage');
    if (homeRes.success) {
      homepageForm.value = { faqs: [], ...homeRes.data };
    }

    const aboutRes = await api.get('/settings/aboutpage');
    if (aboutRes.success) {
      aboutpageForm.value = {
        title: '',
        description: '',
        historyTitle: '',
        historyContent: '',
        vision: '',
        mission: '',
        values: '',
        stats: { years: '10+', readers: '50,000+', branches: '02' },
        teamMembers: [],
        ...aboutRes.data
      };
      if (!aboutpageForm.value.stats) {
        aboutpageForm.value.stats = { years: '10+', readers: '50,000+', branches: '02' };
      }
      if (!aboutpageForm.value.teamMembers) {
        aboutpageForm.value.teamMembers = [];
      }
    }

    const catalogRes = await api.get('/settings/catalogpage');
    if (catalogRes.success) catalogpageForm.value = catalogRes.data;

    const membershipRes = await api.get('/settings/membershippage');
    if (membershipRes.success) membershippageForm.value = membershipRes.data;

    const contactRes = await api.get('/settings/contactpage');
    if (contactRes.success) contactpageForm.value = contactRes.data;
  } catch (error) {
    console.error('Fetch settings error:', error);
  }
};

const handleImageUpload = async (event, formKey, fieldName) => {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    toast.show('Vui lòng chọn tệp tin hình ảnh (.png, .jpg, .jpeg, .webp, .gif)', 'error');
    return;
  }

  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = async () => {
    try {
      const base64Data = reader.result;
      const res = await api.post('/settings/upload-image', {
        fileData: base64Data,
        fileName: file.name
      });
      if (res.success && res.data && res.data.url) {
        if (formKey === 'homepage') {
          homepageForm.value[fieldName] = res.data.url;
        } else if (formKey === 'aboutpage') {
          aboutpageForm.value[fieldName] = res.data.url;
        } else if (formKey === 'catalogpage') {
          catalogpageForm.value[fieldName] = res.data.url;
        } else if (formKey === 'membershippage') {
          membershippageForm.value[fieldName] = res.data.url;
        } else if (formKey === 'contactpage') {
          contactpageForm.value[fieldName] = res.data.url;
        }
        toast.show('Tải ảnh lên thành công!');
      } else {
        toast.show('Tải ảnh thất bại: ' + (res.message || 'Lỗi không xác định'), 'error');
      }
    } catch (error) {
      console.error(error);
      toast.show('Lỗi khi tải ảnh lên: ' + error.message, 'error');
    }
  };
};

const saveHomepageSettings = async () => {
  const ok = await confirmModal.value.ask({ message: 'Bạn có chắc chắn muốn lưu cấu hình trang chủ không?' });
  if (!ok) return;
  try {
    const res = await api.put('/settings/homepage', { value: homepageForm.value });
    if (res.success) {
      toast.show('Cập nhật cấu hình trang chủ thành công!');
    }
  } catch (error) {
    toast.show(error.message, 'error');
  }
};

const saveAboutpageSettings = async () => {
  const ok = await confirmModal.value.ask({ message: 'Bạn có chắc chắn muốn lưu cấu hình trang giới thiệu không?' });
  if (!ok) return;
  try {
    const res = await api.put('/settings/aboutpage', { value: aboutpageForm.value });
    if (res.success) {
      toast.show('Cập nhật cấu hình trang giới thiệu thành công!');
    }
  } catch (error) {
    toast.show(error.message, 'error');
  }
};

const saveCatalogpageSettings = async () => {
  const ok = await confirmModal.value.ask({ message: 'Bạn có chắc chắn muốn lưu cấu hình trang danh mục sách không?' });
  if (!ok) return;
  try {
    const res = await api.put('/settings/catalogpage', { value: catalogpageForm.value });
    if (res.success) {
      toast.show('Cập nhật cấu hình trang danh mục sách thành công!');
    }
  } catch (error) {
    toast.show(error.message, 'error');
  }
};

const saveMembershippageSettings = async () => {
  const ok = await confirmModal.value.ask({ message: 'Bạn có chắc chắn muốn lưu cấu hình trang gói hội viên không?' });
  if (!ok) return;
  try {
    const res = await api.put('/settings/membershippage', { value: membershippageForm.value });
    if (res.success) {
      toast.show('Cập nhật cấu hình trang gói hội viên thành công!');
    }
  } catch (error) {
    toast.show(error.message, 'error');
  }
};

const saveContactpageSettings = async () => {
  const ok = await confirmModal.value.ask({ message: 'Bạn có chắc chắn muốn lưu cấu hình trang liên hệ không?' });
  if (!ok) return;
  try {
    const res = await api.put('/settings/contactpage', { value: contactpageForm.value });
    if (res.success) {
      toast.show('Cập nhật cấu hình trang liên hệ thành công!');
    }
  } catch (error) {
    toast.show(error.message, 'error');
  }
};

const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:image')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `http://localhost:3000${cleanPath}`;
};

const handleMemberAvatarUpload = async (event, index) => {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    toast.show('Vui lòng chọn tệp tin hình ảnh (.png, .jpg, .jpeg, .webp, .gif)', 'error');
    return;
  }

  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = async () => {
    try {
      const base64Data = reader.result;
      const res = await api.post('/settings/upload-image', {
        fileData: base64Data,
        fileName: file.name
      });
      if (res.success && res.data && res.data.url) {
        aboutpageForm.value.teamMembers[index].avatar = res.data.url;
        toast.show('Tải ảnh đại diện lên thành công!');
      } else {
        toast.show('Tải ảnh thất bại: ' + (res.message || 'Lỗi không xác định'), 'error');
      }
    } catch (error) {
      console.error(error);
      toast.show('Lỗi khi tải ảnh lên: ' + error.message, 'error');
    }
  };
};

onMounted(() => {
  fetchPlans();
  fetchDiscounts();
  fetchSettings();
});
</script>
