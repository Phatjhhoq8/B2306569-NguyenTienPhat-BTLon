<template>
  <transition name="chat-pop">
    <section
      v-if="chatStore.isOpen"
      class="fixed bottom-5 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
    >
      <header class="bg-primary px-4 py-3 text-white flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <div class="h-9 w-9 rounded-2xl bg-secondary text-primary flex items-center justify-center shadow-sm">
            <Bot class="h-5 w-5" />
          </div>
          <div>
            <h2 class="text-sm font-extrabold leading-tight">Trợ lý CTU eLibrary</h2>
            <p class="text-[10px] text-white/75 font-semibold">Tìm sách, chọn sách, tư vấn gói hội viên</p>
          </div>
        </div>
        <div class="flex items-center space-x-1.5">
          <button
            @click="resetConversation"
            class="px-2.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[10px] font-extrabold transition-colors"
            title="Làm mới đoạn chat"
          >
            Làm mới
          </button>
          <button @click="chatStore.closeChat" class="p-2 rounded-full hover:bg-white/10 transition-colors" title="Đóng chat">
            <X class="h-5 w-5" />
          </button>
        </div>
      </header>

      <div ref="messageList" class="h-[62vh] max-h-[620px] overflow-y-auto bg-slate-50 p-4 space-y-4">
        <div v-if="!authStore.isAuthenticated" class="bg-white rounded-2xl border border-slate-200 p-4 text-sm text-slate-600 shadow-sm space-y-3">
          <p class="font-bold text-slate-900">Vui lòng đăng nhập để dùng trợ lý AI</p>
          <p class="text-xs leading-relaxed">Trợ lý cần tài khoản của bạn để lấy lịch sử mượn sách, lưu sở thích đọc và hỗ trợ chọn sách/gói hội viên chính xác.</p>
          <button @click="goToLogin" class="w-full rounded-xl bg-primary text-white py-2 text-xs font-extrabold">Đăng nhập ngay</button>
        </div>

        <div v-else-if="chatStore.messages.length === 0" class="bg-white rounded-2xl border border-slate-200 p-4 text-sm text-slate-600 shadow-sm space-y-2">
          <p class="font-bold text-slate-900">Bạn cần tìm sách gì?</p>
          <p class="text-xs leading-relaxed">Bạn có thể mô tả cốt truyện, nhân vật, thể loại, hoặc hỏi so sánh gói hội viên.</p>
        </div>

        <article v-for="(message, index) in chatStore.messages" :key="index" class="space-y-2">
          <div class="flex" :class="message.role === 'user' ? 'justify-end' : 'justify-start'">
            <div
              class="max-w-[86%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm whitespace-pre-line"
              :class="message.role === 'user' ? 'bg-primary text-white rounded-br-md' : 'bg-white text-slate-700 border border-slate-200 rounded-bl-md'"
            >
              {{ message.content }}
            </div>
          </div>

          <div v-if="message.suggested_books?.length" class="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-xs font-extrabold text-slate-900">Sách trong thư viện</h3>
              <div class="flex items-center space-x-1">
                <button @click="scrollBooks(index, -1)" class="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200"><ChevronLeft class="h-4 w-4" /></button>
                <button @click="scrollBooks(index, 1)" class="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200"><ChevronRight class="h-4 w-4" /></button>
              </div>
            </div>

            <div :ref="el => setBookScroller(index, el)" class="flex gap-3 overflow-x-auto scroll-smooth pb-1 no-scrollbar">
              <div v-for="(book, bookIdx) in message.suggested_books" :key="book._id + '_' + bookIdx" class="w-36 flex-shrink-0 rounded-2xl border border-slate-200 bg-white overflow-hidden">
                <div class="relative h-44 bg-slate-100">
                  <img :src="getImageUrl(book.hinhAnh)" :alt="book.tenSach" class="h-full w-full object-cover" />
                </div>
                <div class="p-2.5 space-y-2">
                  <h4 class="text-xs font-extrabold text-slate-900 line-clamp-2 h-8">{{ book.tenSach }}</h4>
                  <p class="text-[10px] text-slate-500 truncate font-semibold">{{ formatAuthors(book.tacGia) }}</p>
                  <p class="text-[10px] text-primary font-bold truncate">{{ book.theLoai?.tenTheLoai || 'Thể loại' }}</p>
                  <div class="flex items-center justify-between text-[10px] text-slate-500 font-bold">
                    <span>{{ book.rating || 0 }} sao</span>
                    <span>{{ book.soLuotMuon || 0 }} lượt</span>
                  </div>
                  <button
                    @click="toggleBook(message, book._id)"
                    class="w-full rounded-xl py-1.5 text-[10px] font-extrabold transition-colors"
                    :class="message.selectedBookIds?.includes(book._id) ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700 hover:bg-primary-light hover:text-primary'"
                  >
                    {{ message.selectedBookIds?.includes(book._id) ? 'Đã chọn' : 'Chọn' }}
                  </button>
                  <button @click="viewBook(book._id)" class="w-full rounded-xl py-1.5 text-[10px] font-bold text-primary hover:bg-primary-light">Xem chi tiết</button>
                </div>
              </div>
            </div>

            <button
              @click="addSelectedBooks(message)"
              :disabled="!message.selectedBookIds?.length"
              class="w-full rounded-xl bg-secondary text-primary-dark py-2 text-xs font-extrabold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Thêm sách đã chọn vào giỏ mượn
            </button>
          </div>

          <div v-if="message.external_suggestions?.length" class="bg-amber-50 border border-amber-100 rounded-2xl p-3 shadow-sm space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-xs font-extrabold text-amber-900">Tác phẩm liên quan nhưng thư viện chưa có</h3>
              <div class="flex items-center space-x-1">
                <button @click="scrollExternalBooks(index, -1)" class="p-1.5 rounded-full bg-amber-100/70 hover:bg-amber-200/80 text-amber-900 transition-colors">
                  <ChevronLeft class="h-4 w-4" />
                </button>
                <button @click="scrollExternalBooks(index, 1)" class="p-1.5 rounded-full bg-amber-100/70 hover:bg-amber-200/80 text-amber-900 transition-colors">
                  <ChevronRight class="h-4 w-4" />
                </button>
              </div>
            </div>

            <div :ref="el => setExternalBookScroller(index, el)" class="flex gap-3 overflow-x-auto scroll-smooth pb-1 no-scrollbar">
              <div v-for="(item, extIdx) in message.external_suggestions" :key="item.title + '_' + extIdx" class="w-36 flex-shrink-0 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm flex flex-col justify-between hover:-translate-y-0.5 hover:shadow transition-all duration-300">
                <div>
                  <div class="relative h-44 bg-slate-100">
                    <div 
                      class="relative h-full w-full bg-gradient-to-br flex flex-col justify-between p-3 select-none overflow-hidden"
                      :class="getBookBgGradient(item.title)"
                    >
                      <!-- Spine shadow 3D effect -->
                      <div class="absolute top-0 left-0 w-2.5 h-full bg-black/15 shadow-[inset_-1px_0_2px_rgba(0,0,0,0.2)]"></div>
                      <div class="absolute top-0 left-2.5 w-0.5 h-full bg-white/20"></div>
                      
                      <div class="pl-2 space-y-1 text-left mt-2">
                        <span class="text-[7px] font-black tracking-widest uppercase opacity-75">Tác Phẩm Ngoài</span>
                        <h5 class="text-[9px] font-black leading-tight line-clamp-4 font-serif">{{ item.title }}</h5>
                      </div>
                      
                      <div class="pl-2 text-left mb-2">
                        <p class="text-[8px] font-bold opacity-80 truncate max-w-full font-sans">{{ item.author || 'Khuyết danh' }}</p>
                      </div>
                    </div>
                  </div>
                  <div class="p-2.5 space-y-1.5">
                    <h4 class="text-xs font-extrabold text-slate-900 line-clamp-2 h-8 leading-snug">{{ item.title }}</h4>
                    <p class="text-[9px] text-slate-500 truncate font-semibold">Tác giả: {{ item.author || 'Khuyết danh' }}</p>
                    <p class="text-[9px] leading-relaxed text-slate-500 font-medium line-clamp-3 h-10 border-t border-slate-50 pt-1.5">{{ item.reason }}</p>
                  </div>
                </div>
                
                <div class="p-2.5 pt-0 space-y-1">
                  <div class="text-[8px] text-center font-bold text-amber-700 bg-amber-50 border border-amber-100 rounded-lg py-1 select-none">
                    Chưa có trong thư viện
                  </div>
                  <a 
                    v-if="item.source_url" 
                    :href="item.source_url" 
                    target="_blank" 
                    class="w-full text-center block rounded-xl py-1.5 text-[9px] font-bold text-primary bg-slate-50 hover:bg-primary-light hover:text-primary transition-colors border border-slate-100"
                  >
                    Xem chi tiết web
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div v-if="message.membership_plans?.length" class="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm space-y-3">
            <h3 class="text-xs font-extrabold text-slate-900">Gói hội viên</h3>
            <div class="space-y-2">
              <div
                v-for="plan in message.membership_plans"
                :key="plan._id"
                @click="message.selectedPlanId = plan._id"
                class="w-full text-left rounded-2xl border p-3.5 transition-all cursor-pointer select-none"
                :class="message.selectedPlanId === plan._id ? 'border-primary bg-primary-light/50 ring-1 ring-primary/25' : 'border-slate-200 hover:border-primary/40'"
              >
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <p class="text-xs font-extrabold text-slate-900">{{ plan.tenGoi }}</p>
                    <p class="text-[10px] text-slate-500 font-bold">{{ plan.formatted_price || formatPrice(plan.giaTien) }} / {{ plan.soNgayHieuLuc }} ngày</p>
                  </div>
                  <span v-if="message.plan_comparison?.recommended_plan_id === plan._id" class="text-[9px] font-extrabold bg-primary text-white rounded-full px-2 py-1">Khuyên dùng</span>
                </div>
                <div class="grid grid-cols-2 gap-2 mt-2 text-[10px] text-slate-600 font-semibold">
                  <span>• Mượn tối đa: {{ plan.soSachToiDa }} sách</span>
                  <span>• Ngày mượn: {{ plan.soNgayMuonToiDa }} ngày</span>
                </div>
              </div>
            </div>

            <!-- Bảng so sánh thuộc tính hệ thống có sẵn -->
            <div class="mt-4 space-y-2 border-t border-slate-100 pt-3">
              <h4 class="text-[10px] font-extrabold text-slate-900 uppercase tracking-wider">So sánh chi tiết các gói</h4>
              <div class="overflow-x-auto border border-slate-200 rounded-xl bg-slate-50/50">
                <table class="w-full text-[9px] text-left text-slate-650 border-collapse min-w-[320px]">
                  <thead>
                    <tr class="border-b border-slate-200 bg-slate-100/70 text-slate-800 font-extrabold">
                      <th class="p-2">Đặc tính</th>
                      <th v-for="plan in message.membership_plans" :key="plan._id" class="p-2 text-center font-black">
                        {{ plan.tenGoi }}
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-150 font-semibold text-slate-600">
                    <tr>
                      <td class="p-2 pl-2.5 font-bold text-slate-800">Mượn cùng lúc</td>
                      <td v-for="plan in message.membership_plans" :key="plan._id" class="p-2 text-center font-black text-slate-900">
                        {{ plan.soSachToiDa }} cuốn
                      </td>
                    </tr>
                    <tr>
                      <td class="p-2 pl-2.5 font-bold text-slate-800">Thời hạn mượn</td>
                      <td v-for="plan in message.membership_plans" :key="plan._id" class="p-2 text-center font-black text-slate-900">
                        {{ plan.soNgayMuonToiDa }} ngày
                      </td>
                    </tr>
                    <tr>
                      <td class="p-2 pl-2.5 font-bold text-slate-800">Phí mượn giấy</td>
                      <td v-for="plan in message.membership_plans" :key="plan._id" class="p-2 text-center font-black text-slate-900">
                        {{ getPlanPhiMuon(plan) }}
                      </td>
                    </tr>
                    <tr>
                      <td class="p-2 pl-2.5 font-bold text-slate-800">Phạt trễ/ngày</td>
                      <td v-for="plan in message.membership_plans" :key="plan._id" class="p-2 text-center font-black text-red-650">
                        {{ getPlanPhatTre(plan) }}
                      </td>
                    </tr>
                    <tr>
                      <td class="p-2 pl-2.5 font-bold text-slate-800">Gia hạn online</td>
                      <td v-for="plan in message.membership_plans" :key="plan._id" class="p-2 text-center text-slate-900">
                        {{ getPlanGiaHanOnline(plan) }}
                      </td>
                    </tr>
                    <tr>
                      <td class="p-2 pl-2.5 font-bold text-slate-800">Đọc Ebook</td>
                      <td v-for="plan in message.membership_plans" :key="plan._id" class="p-2 text-center text-slate-900">
                        {{ getPlanEbook(plan) }}
                      </td>
                    </tr>
                    <tr>
                      <td class="p-2 pl-2.5 font-bold text-slate-800">Giao tận nhà</td>
                      <td v-for="plan in message.membership_plans" :key="plan._id" class="p-2 text-center text-slate-900">
                        {{ getPlanGiaoSach(plan) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <button 
                @click="goToMemberships"
                class="w-full rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 text-[10px] font-extrabold transition-all border border-slate-200 flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <span>Xem so sánh chi tiết trên Website</span>
                <ExternalLink class="h-3 w-3" />
              </button>
            </div>

            <button @click="confirmPlan(message.selectedPlanId)" :disabled="!message.selectedPlanId" class="w-full rounded-xl bg-primary text-white py-2 text-xs font-extrabold disabled:opacity-50 disabled:cursor-not-allowed">
              Tiếp tục đến xác nhận thanh toán
            </button>
            <p class="text-[10px] text-slate-500 font-semibold">Agent không tự đăng ký hoặc thanh toán. Bạn phải tự kiểm tra và xác nhận ở bước tiếp theo.</p>
          </div>
        </article>

        <div v-if="chatStore.loading" class="flex justify-start">
          <div class="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-3.5 py-2.5 text-xs text-slate-500 shadow-sm">Đang tìm dữ liệu...</div>
        </div>
      </div>

      <form @submit.prevent="submit" class="bg-white border-t border-slate-200 p-3 flex items-end gap-2">
        <textarea
          v-model="input"
          rows="1"
          placeholder="Mô tả sách, nhân vật, cốt truyện hoặc hỏi gói hội viên..."
          class="max-h-24 min-h-[42px] flex-grow resize-none rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary"
          @keydown.enter.exact.prevent="submit"
          :disabled="!authStore.isAuthenticated"
        ></textarea>
        <button type="submit" :disabled="chatStore.loading || !input.trim() || !authStore.isAuthenticated" class="h-10 w-10 rounded-2xl bg-primary text-white flex items-center justify-center disabled:opacity-50">
          <Send class="h-4 w-4" />
        </button>
      </form>
    </section>
  </transition>

  <!-- Configure and Payment Modal (Claude-style) -->
  <Teleport to="body">
    <div v-if="activePlan" class="fixed inset-0 bg-slate-900 bg-opacity-65 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div class="checkout-modal-scroll bg-white rounded-3xl max-w-5xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[95vh] overflow-y-auto font-sans text-slate-800">
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

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
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
                  <div class="relative w-[300px] h-[180px] bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 rounded-2xl p-5 text-white shadow-lg flex flex-col justify-between border border-white/10 select-none overflow-hidden font-sans">
                    <div class="absolute -right-12 -top-12 w-28 h-28 bg-primary/20 rounded-full blur-2xl"></div>
                    
                    <div class="flex justify-between items-start">
                      <div class="space-y-0.5">
                        <span class="text-[8px] uppercase font-bold tracking-widest text-slate-400">Gói Hội Viên</span>
                        <h4 class="text-[10px] font-extrabold text-secondary tracking-wide uppercase">{{ activePlan?.tenGoi }}</h4>
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
                      :src="getVietQrUrlForPlan()" 
                      alt="VietQR Code" 
                      class="w-44 h-44 object-contain bg-white p-2 rounded-xl border border-slate-100"
                    />
                    <div class="mt-2.5 text-[10px] font-bold text-slate-700 space-y-0.5">
                      <p>Số tiền: {{ formatPrice(membershipFinalAmount) }}</p>
                      <p>Nội dung: <span class="text-primary uppercase font-mono">DK {{ activePlan?.maGoi }} {{ authStore.user?.maDocGia || 'DG00001' }}</span></p>
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
                  <h4 class="text-sm font-extrabold text-slate-900">{{ activePlan?.tenGoi }}</h4>
                  <span class="text-xs text-slate-500 font-semibold">Chu kỳ sử dụng: {{ activePlan?.soNgayHieuLuc }} ngày</span>
                </div>
                <span class="text-sm font-extrabold text-slate-900">{{ formatPrice(activePlan?.giaTien) }}</span>
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
                  <span>{{ formatPrice(activePlan?.giaTien) }}</span>
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
                      Hệ thống sẽ tự động trừ số tiền {{ formatPrice(membershipFinalAmount) }} và gia hạn thêm {{ activePlan?.soNgayHieuLuc }} ngày sau mỗi chu kỳ qua Thẻ tín dụng đã liên kết.
                    </span>
                    <span v-else>
                      Hệ thống sẽ gửi thông báo nhắc nhở thanh toán khi gói sắp hết hạn để đảm bảo trải nghiệm không bị gián đoạn.
                    </span>
                  </p>
                  <p class="leading-relaxed font-normal text-[11px] text-slate-600" v-else>
                    Gói dịch vụ này sẽ tự động hết hạn / hủy sau {{ activePlan?.soNgayHieuLuc }} ngày nếu bạn không thực hiện quét thanh toán tiếp. Không tự động trừ tiền.
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
  </Teleport>

  <!-- Custom Confirm Dialog -->
  <ConfirmModal ref="confirmModal" />
</template>

<script setup>
import { nextTick, ref, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Bot, X, Send, ChevronLeft, ChevronRight, CreditCard, QrCode, Wifi, Battery, CheckCircle, Award, Info, ExternalLink, Check } from '@lucide/vue';
import { useChatStore } from '../../stores/chat';
import { useCartStore } from '../../stores/cart';
import { useAuthStore } from '../../stores/auth';
import api from '../../services/api';
import { useToastStore } from '../../stores/toast';
import ConfirmModal from '../ConfirmModal.vue';

const chatStore = useChatStore();
const cartStore = useCartStore();
const authStore = useAuthStore();
const router = useRouter();
const toast = useToastStore();
const confirmModal = ref(null);
const input = ref('');
const messageList = ref(null);
const bookScrollers = ref({});
const externalBookScrollers = ref({});

const setBookScroller = (index, el) => {
  if (el) bookScrollers.value[index] = el;
};

const setExternalBookScroller = (index, el) => {
  if (el) externalBookScrollers.value[index] = el;
};

const scrollExternalBooks = (index, direction) => {
  const el = externalBookScrollers.value[index];
  if (el) el.scrollBy({ left: direction * 300, behavior: 'smooth' });
};

const getBookBgGradient = (title) => {
  const gradients = [
    'from-amber-600 via-amber-800 to-stone-900 text-amber-100',
    'from-emerald-700 via-teal-900 to-slate-900 text-emerald-100',
    'from-indigo-950 via-slate-900 to-zinc-950 text-indigo-100',
    'from-rose-900 via-purple-950 to-stone-950 text-rose-100',
    'from-cyan-800 via-blue-950 to-indigo-950 text-cyan-100',
    'from-violet-850 via-indigo-950 to-neutral-950 text-violet-100'
  ];
  if (!title) return gradients[0];
  let sum = 0;
  for (let i = 0; i < title.length; i++) {
    sum += title.charCodeAt(i);
  }
  return gradients[sum % gradients.length];
};

const getImageUrl = (path) => {
  if (!path) return '/placeholder_book.png';
  if (path.startsWith('http') || path.startsWith('data:image')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `http://localhost:3000${cleanPath}`;
};

const formatAuthors = (authors = []) => {
  if (!Array.isArray(authors)) return authors?.tenTacGia || 'Tác giả';
  return authors.map(author => author.tenTacGia || author.name || author).filter(Boolean).join(', ') || 'Tác giả';
};

const formatPrice = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

const scrollToBottom = async () => {
  await nextTick();
  if (messageList.value) messageList.value.scrollTop = messageList.value.scrollHeight;
};

const submit = async () => {
  if (!authStore.isAuthenticated) {
    goToLogin();
    return;
  }
  const text = input.value;
  input.value = '';
  await chatStore.sendMessage(text);
  scrollToBottom();
};

const goToLogin = () => {
  chatStore.closeChat();
  router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath, reason: 'agent' } });
};

const resetConversation = () => {
  input.value = '';
  bookScrollers.value = {};
  chatStore.newConversation();
};

const scrollBooks = (index, direction) => {
  const el = bookScrollers.value[index];
  if (el) el.scrollBy({ left: direction * 300, behavior: 'smooth' });
};

const toggleBook = (message, bookId) => {
  if (!message.selectedBookIds) message.selectedBookIds = [];
  message.selectedBookIds = message.selectedBookIds.includes(bookId)
    ? message.selectedBookIds.filter(id => id !== bookId)
    : [...message.selectedBookIds, bookId];
};

const addSelectedBooks = (message) => {
  const selected = message.suggested_books.filter(book => message.selectedBookIds?.includes(book._id));
  selected.forEach(book => cartStore.addBook(book));
};

const viewBook = (bookId) => {
  chatStore.closeChat();
  router.push({ name: 'book-detail', params: { id: bookId } });
};

// Membership checkout integration
const activePlan = ref(null);
const paymentMethod = ref('THE_TIN_DUNG');
const billingName = ref('');
const billingCountry = ref('VN');
const autoRenew = ref(true);
const subscribing = ref(false);
const membershipCouponCode = ref('');
const membershipCouponInfo = ref(null);
const membershipCouponMsg = ref('');
const membershipCouponSuccess = ref(false);

const cardNumber = ref('');
const cardName = ref('');
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

const membershipDiscountAmount = computed(() => {
  if (membershipCouponSuccess.value && membershipCouponInfo.value) {
    return membershipCouponInfo.value.discountAmount || 0;
  }
  return 0;
});

const membershipFinalAmount = computed(() => {
  if (!activePlan.value) return 0;
  const base = activePlan.value.giaTien || 0;
  const finalAmt = base - membershipDiscountAmount.value;
  return finalAmt < 0 ? 0 : finalAmt;
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

const formatCurrencyAmount = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

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

const getVietQrUrlForPlan = () => {
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
      window.location.reload();
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
      window.location.reload();
    }
  } catch (error) {
    toast.show(error.message || 'Có lỗi xảy ra khi xác nhận thanh toán.', 'error');
  } finally {
    subscribing.value = false;
  }
};

const confirmPlan = async (planId) => {
  if (!planId) return;
  
  try {
    const res = await api.get('/memberships/plans');
    if (res.success) {
      const plan = res.data.find(p => p._id === planId);
      if (plan) {
        activePlan.value = plan;
        paymentMethod.value = 'THE_TIN_DUNG';
        billingName.value = authStore.user ? `${authStore.user.hoLot} ${authStore.user.ten}` : '';
        cardName.value = authStore.user ? `${authStore.user.hoLot} ${authStore.user.ten}`.toUpperCase() : '';
        cardNumber.value = '';
        cardExpiry.value = '';
        cardCvc.value = '';
        membershipCouponCode.value = '';
        membershipCouponInfo.value = null;
        membershipCouponMsg.value = '';
        membershipCouponSuccess.value = false;
      }
    }
  } catch (error) {
    toast.show('Lỗi khi lấy thông tin gói hội viên', 'error');
  }
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
  return '20 đầu sách';
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

const goToMemberships = () => {
  chatStore.closeChat();
  router.push({ name: 'memberships' });
};

watch(() => chatStore.messages.length, scrollToBottom);
</script>

<style scoped>
.chat-pop-enter-active,
.chat-pop-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.chat-pop-enter-from,
.chat-pop-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.98);
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.checkout-modal-scroll {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.checkout-modal-scroll::-webkit-scrollbar {
  display: none;
}
.scan-laser {
  animation: scan 2.2s infinite linear;
}
@keyframes scan {
  0% { top: 10%; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 90%; opacity: 0; }
}
</style>
