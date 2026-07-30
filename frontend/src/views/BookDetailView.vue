<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <!-- Nút quay lại trang trước -->
    <div class="flex items-center">
      <button 
        @click="router.back()" 
        class="flex items-center space-x-2 text-slate-500 hover:text-primary font-bold text-sm bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl shadow-sm transition-all"
      >
        <ChevronLeft class="h-4 w-4" />
        <span>Quay lại</span>
      </button>
    </div>

    <div v-if="book" class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      <!-- Cột trái: Thông tin tác phẩm & Bình luận (8/12) -->
      <div class="lg:col-span-8 space-y-8">
        <!-- Main Card -->
        <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-8">
          <div class="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
            <!-- Cover image (5/12) -->
            <div class="md:col-span-5">
              <div class="bg-slate-100 rounded-2xl overflow-hidden shadow-md pt-[135%] relative border border-slate-200">
                <img 
                  :src="getImageUrl(book.hinhAnh)" 
                  :alt="book.tenSach" 
                  class="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>
            
            <!-- Book title & info (7/12) -->
            <div class="md:col-span-7 flex flex-col justify-between space-y-4">
              <div class="space-y-4">
                <span class="bg-primary-light text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide inline-block">
                  {{ book.theLoai?.tenTheLoai }}
                </span>
                <h1 class="font-sans text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
                  {{ book.tenSach }}
                </h1>
                <p class="text-xs text-slate-500 font-bold">
                  Tác giả: <span class="text-slate-800 font-extrabold">{{ book.tacGia?.map(t => t.tenTacGia).join(', ') }}</span>
                </p>
                
                <!-- Ratings -->
                <div class="flex items-center space-x-3 text-xs font-bold flex-wrap gap-y-2">
                  <span class="flex items-center px-2.5 py-1 rounded-lg" :class="book.rating > 0 ? 'text-amber-500 bg-amber-50' : 'text-slate-400 bg-slate-50'">
                    <Star class="h-3.5 w-3.5 mr-1" :class="book.rating > 0 ? 'fill-amber-500 text-amber-550' : 'text-slate-350'" /> {{ book.rating > 0 ? book.rating.toFixed(1) : 'Chưa có đánh giá' }}
                  </span>
                  <span class="text-slate-300">|</span>
                  <span class="text-slate-500">{{ book.soLuotMuon || 0 }} lượt mượn</span>
                  <span class="text-slate-300">|</span>
                  
                  <!-- Nút thích sách -->
                  <button 
                    @click="handleLikeToggle" 
                    class="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border shadow-sm"
                    :class="isLiked ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'"
                  >
                    <Heart 
                      class="h-3.5 w-3.5" 
                      :class="isLiked ? 'fill-red-500 text-red-500 animate-pulse' : 'text-slate-500'" 
                    />
                    <span>{{ likesCount }} Thích</span>
                  </button>
                </div>
              </div>

              <!-- General Info Small Metadata list -->
              <div class="text-xs space-y-1.5 border-t border-slate-100 pt-4 text-slate-500 font-medium">
                <div>Nhà xuất bản: <span class="text-slate-800 font-bold">{{ book.nhaXuatBan?.tenNXB }}</span></div>
                <div>Năm sản xuất: <span class="text-slate-800 font-bold">{{ book.namSanXuat }}</span></div>
              </div>
            </div>
          </div>
          
          <!-- Specifications (Thông số chi tiết) -->
          <div class="pt-6 border-t border-slate-100 space-y-4">
            <h2 class="font-sans text-base font-extrabold text-slate-900 flex items-center">
              <Layers class="h-4.5 w-4.5 mr-2 text-primary" /> Thông số chi tiết
            </h2>
            
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
              <div class="bg-slate-50 p-2.5 rounded-2xl border border-slate-150 flex flex-col items-center justify-center space-y-1 shadow-sm">
                <BookOpen class="h-5 w-5 text-slate-500" />
                <span class="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Số trang</span>
                <span class="text-xs font-extrabold text-slate-800">{{ (book.tenSach ? book.tenSach.length * 5 + 150 : 250) }} trang</span>
              </div>

              <div class="bg-slate-50 p-2.5 rounded-2xl border border-slate-150 flex flex-col items-center justify-center space-y-1 shadow-sm">
                <Languages class="h-5 w-5 text-slate-500" />
                <span class="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Ngôn ngữ</span>
                <span class="text-xs font-extrabold text-slate-800">Tiếng Việt</span>
              </div>

              <div class="bg-slate-50 p-2.5 rounded-2xl border border-slate-150 flex flex-col items-center justify-center space-y-1 shadow-sm">
                <Building2 class="h-5 w-5 text-slate-500" />
                <span class="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Nhà xuất bản</span>
                <span class="text-[10px] font-extrabold text-slate-800 truncate max-w-full px-1">{{ book.nhaXuatBan?.tenNXB || 'CTU Publisher' }}</span>
              </div>

              <div class="bg-slate-50 p-2.5 rounded-2xl border border-slate-150 flex flex-col items-center justify-center space-y-1 shadow-sm">
                <Calendar class="h-5 w-5 text-slate-500" />
                <span class="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Năm sản xuất</span>
                <span class="text-xs font-extrabold text-slate-800">{{ book.namSanXuat || '2022' }}</span>
              </div>

              <div class="bg-slate-50 p-2.5 rounded-2xl border border-slate-150 flex flex-col items-center justify-center space-y-1 shadow-sm">
                <Ruler class="h-5 w-5 text-slate-500" />
                <span class="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Kích thước</span>
                <span class="text-xs font-extrabold text-slate-800">14.5 x 20.5 cm</span>
              </div>

              <div class="bg-slate-50 p-2.5 rounded-2xl border border-slate-150 flex flex-col items-center justify-center space-y-1 shadow-sm">
                <Book class="h-5 w-5 text-slate-500" />
                <span class="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Hình thức</span>
                <span class="text-xs font-extrabold text-slate-800">Bìa mềm</span>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="pt-6 border-t border-slate-100 space-y-3">
            <h2 class="font-sans text-base font-extrabold text-slate-900 flex items-center">
              <BookOpen class="h-4.5 w-4.5 mr-2 text-primary" /> Mô tả tóm tắt
            </h2>
            <p class="text-slate-600 text-xs leading-relaxed whitespace-pre-line">
              {{ book.moTa || 'Chưa có mô tả tóm tắt cho đầu sách này.' }}
            </p>
          </div>
        </div>

        <!-- Reviews & Comments -->
        <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
          <div class="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 class="font-sans text-base font-extrabold text-slate-900 flex items-center">
              <Star class="h-4.5 w-4.5 mr-2 text-amber-500 fill-amber-500" /> Đánh giá & Bình luận
            </h2>
            <span class="text-xs text-slate-400 font-bold">({{ book.soLuotDanhGia || 0 }} lượt đánh giá)</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <div class="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 pb-5 md:pb-0">
              <span class="text-4xl font-black text-slate-900 leading-none">{{ book.rating > 0 ? book.rating.toFixed(1) : '0.0' }}</span>
              <div class="flex items-center mt-2">
                <Star 
                  v-for="star in 5" 
                  :key="star" 
                  class="h-3.5 w-3.5" 
                  :class="book.rating > 0 && star <= Math.round(book.rating) ? 'text-amber-500 fill-amber-500' : 'text-slate-300'"
                />
              </div>
              <span class="text-[9px] text-slate-400 font-bold mt-2 uppercase tracking-wide">Điểm đánh giá trung bình</span>
            </div>

            <div class="md:col-span-8 space-y-3">
              <div v-if="book.binhLuan && book.binhLuan.length > 0" class="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                <div 
                  v-for="(rv, index) in book.binhLuan" 
                  :key="index"
                  class="bg-white p-3.5 rounded-xl border border-slate-150 shadow-sm space-y-1.5 hover:border-slate-350 transition-colors"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex items-center space-x-2">
                      <div class="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        {{ rv.hoTen?.charAt(0).toUpperCase() || 'D' }}
                      </div>
                      <div>
                        <span class="font-bold text-slate-900 text-xs block">{{ rv.hoTen }}</span>
                        <span class="text-[9px] text-slate-400 font-medium block">{{ formatDate(rv.ngayTao) }}</span>
                      </div>
                    </div>
                    <div class="flex items-center">
                      <Star 
                        v-for="star in 5" 
                        :key="star" 
                        class="h-3 w-3" 
                        :class="star <= rv.soSao ? 'text-amber-500 fill-amber-500' : 'text-slate-200'"
                      />
                    </div>
                  </div>
                  <p class="text-slate-650 text-xs leading-relaxed pl-9 whitespace-pre-line">{{ rv.noiDung }}</p>
                  
                  <!-- Nút sửa/xóa bình luận của chính mình -->
                  <div v-if="authStore.isAuthenticated && (rv.docGia === authStore.user?._id || rv.docGia?._id === authStore.user?._id)" class="pl-9 flex items-center space-x-3 pt-1 text-[10px] font-bold">
                    <button @click="startEditReview" class="text-primary hover:underline flex items-center space-x-0.5">
                      <Edit class="h-3 w-3" />
                      <span>Sửa</span>
                    </button>
                    <button @click="deleteReview" class="text-red-600 hover:underline flex items-center space-x-0.5">
                      <Trash class="h-3 w-3" />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="h-full flex flex-col items-center justify-center text-center py-4 text-slate-400 space-y-1">
                <span class="text-xs font-semibold text-slate-400">Chưa có bình luận hay đánh giá nào cho đầu sách này.</span>
              </div>
            </div>
          </div>

          <!-- Write a Review Form -->
          <div v-if="!hasReviewed || isEditingReview" class="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
            <h3 class="font-bold text-slate-900 text-xs flex items-center">
              {{ isEditingReview ? 'Chỉnh sửa đánh giá của bạn' : 'Viết đánh giá của bạn' }}
            </h3>

            <div v-if="authStore.isAuthenticated" class="space-y-3">
              <!-- Chặn tài khoản Staff/Admin -->
              <div v-if="authStore.isStaff" class="text-amber-700 bg-amber-50 border border-amber-100 p-3 rounded-xl text-xs font-bold text-center">
                Tài khoản quản lý không có quyền đánh giá tác phẩm này.
              </div>
              
              <div v-else class="space-y-3">
                <div class="flex items-center space-x-2">
                  <span class="text-xs text-slate-500 font-bold">Chọn số sao:</span>
                  <div class="flex items-center space-x-1">
                    <button 
                      v-for="star in 5" 
                      :key="star" 
                      type="button"
                      @click="userRating = star"
                      class="text-slate-350 hover:scale-110 transition-transform focus:outline-none"
                    >
                      <Star 
                        class="h-4.5 w-4.5" 
                        :class="star <= userRating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'"
                      />
                    </button>
                  </div>
                  <span class="text-xs text-slate-600 font-bold ml-2">({{ userRating }}/5 sao)</span>
                </div>

                <div class="space-y-1">
                  <textarea 
                    v-model="userComment" 
                    rows="2" 
                    placeholder="Chia sẻ cảm nhận thực tế của bạn..."
                    class="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder-slate-400"
                  ></textarea>
                </div>

                <div v-if="reviewError" class="text-red-650 text-[10px] font-bold bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg">
                  {{ reviewError }}
                </div>
                <div v-if="reviewSuccess" class="text-green-655 text-[10px] font-bold bg-green-50 border border-green-100 px-3 py-1.5 rounded-lg">
                  {{ reviewSuccess }}
                </div>

                <div class="flex justify-end space-x-2">
                  <button 
                    v-if="isEditingReview"
                    type="button"
                    @click="cancelEditReview"
                    class="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-1.5 px-4 rounded-xl text-xs transition-colors"
                  >
                    <span>Hủy</span>
                  </button>
                  <button 
                    @click="submitReview"
                    :disabled="submittingReview"
                    class="bg-primary hover:bg-primary-dark text-white font-bold py-1.5 px-4 rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50"
                  >
                    <span>{{ submittingReview ? 'Đang gửi...' : (isEditingReview ? 'Cập nhật' : 'Gửi đánh giá') }}</span>
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-3 bg-white border border-dashed border-slate-200 rounded-xl">
              <p class="text-xs text-slate-500 font-semibold">
                Vui lòng <router-link :to="{ name: 'login' }" class="text-primary hover:underline font-bold">đăng nhập</router-link> để viết đánh giá.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Cột phải: Sidebar Action Box (4/12) -->
      <div class="lg:col-span-4">
        <div class="sticky top-6 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <!-- Book Price Header -->
          <div class="space-y-2">
            <span class="text-xs text-slate-400 font-bold uppercase tracking-wider block">Giá gốc / Gói của bạn</span>
            <div class="flex items-baseline space-x-1.5 flex-wrap">
              <span class="text-2xl font-black text-slate-900">{{ formatCurrency(book.giaBia) }}</span>
              <span class="text-slate-300 font-normal">|</span>
              <span class="text-xs text-slate-500 font-bold">
                Gói: <span class="text-primary font-black uppercase">{{ authStore.user?.subscriptionPlan?.tenGoi || 'Tiêu chuẩn' }}</span>
              </span>
            </div>
            
            <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-150 text-[11px] font-bold text-slate-650 space-y-1">
              <div class="flex justify-between">
                <span>Phí mượn sách giấy:</span>
                <span class="text-emerald-600 font-extrabold">{{ getBookBorrowFee(authStore.user?.subscriptionPlan) > 0 ? formatCurrency(getBookBorrowFee(authStore.user?.subscriptionPlan)) : 'Miễn phí' }}</span>
              </div>
              <div class="flex justify-between">
                <span>Phí phạt trễ hạn:</span>
                <span class="text-red-655 font-extrabold">{{ formatCurrency(getBookOverdueFee(authStore.user?.subscriptionPlan)) }}/ngày</span>
              </div>
            </div>
          </div>
          
          <!-- Bảng giá mượn & phạt trễ hạn chi tiết theo gói -->
          <div class="space-y-2 pt-2 border-t border-slate-100">
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Bảng giá mượn theo gói</span>
            <div class="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
              <table class="w-full text-left border-collapse text-[10px] font-semibold text-slate-600">
                <thead>
                  <tr class="border-b border-slate-200 text-slate-400 uppercase text-[9px]">
                    <th class="pb-1 w-[35%]">Gói hội viên</th>
                    <th class="pb-1 text-center">Phí mượn</th>
                    <th class="pb-1 text-center">Đặt cọc</th>
                    <th class="pb-1 text-right">Phạt trễ/ngày</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-150 text-slate-750">
                  <tr>
                    <td class="py-1 font-bold text-slate-800">Tiêu chuẩn</td>
                    <td class="py-1 text-center">{{ isBookGiaoTrinh ? 'Miễn phí' : '5.000 ₫' }}</td>
                    <td class="py-1 text-center">100k</td>
                    <td class="py-1 text-right text-red-600 font-bold">5k</td>
                  </tr>
                  <tr>
                    <td class="py-1 font-bold text-slate-800">Pro</td>
                    <td class="py-1 text-center">{{ isBookGiaoTrinh ? 'Miễn phí' : '3.000 ₫' }}</td>
                    <td class="py-1 text-center">50k</td>
                    <td class="py-1 text-right text-red-600 font-bold">3k</td>
                  </tr>
                  <tr>
                    <td class="py-1 font-bold text-slate-800">VIP</td>
                    <td class="py-1 text-center text-emerald-600 font-bold">Miễn phí</td>
                    <td class="py-1 text-center text-emerald-600 font-bold">Miễn</td>
                    <td class="py-1 text-right text-red-600 font-bold">2k</td>
                  </tr>
                  <tr>
                    <td class="py-1 font-bold text-slate-800">Family</td>
                    <td class="py-1 text-center text-emerald-600 font-bold">Miễn phí</td>
                    <td class="py-1 text-center text-emerald-600 font-bold">Miễn</td>
                    <td class="py-1 text-right text-red-600 font-bold">2k</td>
                  </tr>
                  <tr>
                    <td class="py-1 font-bold text-slate-800">Enterprise</td>
                    <td class="py-1 text-center text-emerald-600 font-bold">Miễn phí</td>
                    <td class="py-1 text-center text-emerald-600 font-bold">Miễn</td>
                    <td class="py-1 text-right text-red-600 font-bold">1k</td>
                  </tr>
                </tbody>
              </table>
              <span v-if="isBookGiaoTrinh" class="text-[9px] text-emerald-600 font-bold block mt-1 leading-relaxed">* Đây là Giáo trình/Giáo khoa học thuật, được miễn phí dịch vụ mượn sách giấy đối với mọi gói hội viên.</span>
            </div>
          </div>
          
          <hr class="border-slate-100" />
          
          <!-- Stock status -->
          <div class="space-y-2">
            <div class="flex justify-between items-center text-xs">
              <span class="text-slate-500 font-bold">Tình trạng kho:</span>
              <span 
                class="font-extrabold"
                :class="book.soLuongKhaDung > 0 && book.trangThai === 'ACTIVE' ? 'text-green-600' : 'text-amber-600'"
              >
                {{ getStatusText() }}
              </span>
            </div>
            <div class="flex justify-between items-center text-xs">
              <span class="text-slate-500 font-bold">Vị trí kệ:</span>
              <span class="font-extrabold text-slate-800 flex items-center">
                <MapPin class="h-3.5 w-3.5 mr-1 text-primary" /> {{ book.viTriKe || 'Kệ trống' }}
              </span>
            </div>
          </div>
          
          <hr class="border-slate-100" />
          
          <!-- Date Picker for Quick Borrow -->
          <div v-if="book.trangThai === 'ACTIVE' && book.soLuongKhaDung > 0" class="space-y-4">
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-500 flex items-center">
                <Calendar class="h-3.5 w-3.5 mr-1.5 text-primary" /> Ngày hẹn trả sách
              </label>
              <input 
                type="date" 
                v-model="ngayHenTra" 
                :min="minDate"
                :max="maxDate"
                class="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
              />
              <span class="text-[9px] text-slate-400 block font-medium leading-relaxed">Hạn trả tối đa: {{ maxBorrowDays }} ngày (theo gói thẻ của bạn).</span>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-500">Số lượng muốn mượn</label>
              <div class="flex items-center gap-3">
                <div class="inline-flex items-center rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                  <button
                    @click="changeBorrowQuantity(-1)"
                    :disabled="borrowQuantity <= 1"
                    class="h-9 w-9 text-sm font-black text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >-</button>
                  <input
                    v-model.number="borrowQuantity"
                    type="number"
                    min="1"
                    :max="book.soLuongKhaDung"
                    @input="clampBorrowQuantity"
                    class="h-9 w-14 bg-white border-x border-slate-200 text-center text-xs font-extrabold text-slate-800 focus:outline-none"
                  />
                  <button
                    @click="changeBorrowQuantity(1)"
                    :disabled="borrowQuantity >= book.soLuongKhaDung"
                    class="h-9 w-9 text-sm font-black text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >+</button>
                </div>
                <span class="text-[10px] font-semibold text-slate-400">Còn {{ book.soLuongKhaDung }} bản khả dụng</span>
              </div>
            </div>
            
            <!-- Quick Borrow Alert -->
            <div v-if="quickBorrowError" class="text-red-600 text-[10px] font-bold bg-red-50 border border-red-100 px-3 py-2 rounded-xl">
              {{ quickBorrowError }}
            </div>
            <div v-if="quickBorrowSuccess" class="text-green-600 text-[10px] font-bold bg-green-50 border border-green-100 px-3 py-2 rounded-xl">
              {{ quickBorrowSuccess }}
            </div>

            <!-- Action buttons -->
            <div class="space-y-3 pt-2">
              <!-- Mượn ngay -->
              <button 
                @click="handleQuickBorrow"
                :disabled="submittingQuickBorrow"
                class="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold py-3 px-6 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 text-xs"
              >
                <span>{{ submittingQuickBorrow ? 'Đang đăng ký mượn...' : 'Mượn Ngay' }}</span>
              </button>

              <!-- Thêm vào giỏ -->
              <button 
                v-if="!cartStore.hasBook(book._id)"
                @click="addToCart"
                class="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 text-xs"
              >
                <ShoppingBag class="h-4.5 w-4.5" />
                <span>Thêm vào giỏ mượn</span>
              </button>
              <button 
                v-else
                @click="goToCart"
                class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 text-xs"
              >
                <Check class="h-4.5 w-4.5" />
                <span>Đã có trong giỏ - Xem giỏ</span>
              </button>
            </div>
          </div>
          
          <div v-else class="bg-red-50 text-red-700 border border-red-100 rounded-xl p-3 text-xs text-center font-medium">
            Hiện tại không thể mượn sách này (Hết bản sao khả dụng hoặc sách đã ngừng phục vụ).
          </div>
        </div>
      </div>

    </div>

    <!-- Related Books Section (Sách liên quan cùng tác giả) -->
    <div v-if="book && relatedBooks.length > 0" class="mt-10 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 transition-all duration-300" :class="isRelatedCollapsed ? 'space-y-0' : 'space-y-6'">
      <div class="flex items-center justify-between transition-all duration-300" :class="isRelatedCollapsed ? '' : 'border-b border-slate-100 pb-4'">
        <h2 class="font-sans text-base font-extrabold text-slate-900 flex items-center">
          <BookOpen class="h-4.5 w-4.5 mr-2 text-primary" /> Sách liên quan cùng tác giả
        </h2>
        <button 
          @click="isRelatedCollapsed = !isRelatedCollapsed" 
          class="text-xs font-bold text-primary hover:underline flex items-center space-x-1"
        >
          <span>{{ isRelatedCollapsed ? 'Mở rộng' : 'Thu gọn' }}</span>
        </button>
      </div>

      <div v-show="!isRelatedCollapsed" class="relative group">
        <!-- Nút cuộn trái -->
        <button 
          @click="scrollRelated('prev')"
          class="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-slate-50 text-slate-700 hover:text-primary h-9 w-9 rounded-full border border-slate-200 shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <ChevronLeft class="h-5 w-5" />
        </button>

        <!-- Container cuộn ngang -->
        <div ref="scrollContainer" class="flex overflow-x-auto gap-4 pb-2 snap-x custom-horizontal-scroll scroll-smooth">
          <div 
            v-for="rb in relatedBooks" 
            :key="rb._id"
            @click="navigateToBook(rb._id)"
            class="w-40 sm:w-44 flex-shrink-0 snap-start bg-slate-50 hover:bg-white rounded-2xl border border-slate-150 p-3 hover:border-primary hover:shadow-md cursor-pointer transition-all duration-300 space-y-3"
          >
            <!-- Cover image -->
            <div class="bg-slate-200 rounded-xl overflow-hidden pt-[135%] relative">
              <img 
                :src="getImageUrl(rb.hinhAnh)" 
                :alt="rb.tenSach" 
                class="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <!-- Text info -->
            <div class="space-y-1">
              <h4 class="font-bold text-xs text-slate-800 line-clamp-2 h-8 leading-snug">{{ rb.tenSach }}</h4>
              <p class="text-[9px] text-slate-400 font-bold truncate">{{ rb.tacGia?.map(t => t.tenTacGia).join(', ') || 'Tác giả' }}</p>
              <div class="flex items-center justify-between pt-1">
                <span class="text-[10px] font-extrabold text-primary">Miễn phí</span>
                <span class="text-[9px] text-slate-400 font-bold">{{ formatCurrency(rb.giaBia) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Nút cuộn phải -->
        <button 
          @click="scrollRelated('next')"
          class="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-slate-50 text-slate-700 hover:text-primary h-9 w-9 rounded-full border border-slate-200 shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <ChevronRight class="h-5 w-5" />
        </button>
      </div>
    </div>

    <div v-else-if="loading" class="text-center py-20 text-slate-400 font-medium">Đang tải chi tiết sách...</div>
    <div v-else class="text-center py-20 text-slate-400 font-medium bg-white rounded-3xl border border-slate-200">
      Đầu sách không tồn tại hoặc đã bị xóa.
    </div>

    <ConfirmModal ref="confirmModal" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart';
import { useAuthStore } from '../stores/auth';
import api from '../services/api';
import { Star, MapPin, ShoppingBag, Check, BookOpen, X, Lock, Layers, Globe, Calendar, Bookmark, Edit, Trash, ChevronLeft, ChevronRight, Heart, Languages, Building2, Ruler, Book } from '@lucide/vue';
import { useToastStore } from '../stores/toast';
import ConfirmModal from '../components/ConfirmModal.vue';

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();
const toast = useToastStore();

const confirmModal = ref(null);

const book = ref(null);
const loading = ref(true);

// State cho đánh giá và bình luận
const userRating = ref(5);
const userComment = ref('');
const submittingReview = ref(false);
const reviewError = ref('');
const reviewSuccess = ref('');
const isEditingReview = ref(false);

const isLiked = computed(() => {
  if (!authStore.isAuthenticated || !authStore.user?._id || !book.value?.yeuThich) return false;
  return book.value.yeuThich.includes(authStore.user._id);
});

const likesCount = computed(() => {
  return book.value?.yeuThich?.length || 0;
});

const handleLikeToggle = async () => {
  if (!authStore.isAuthenticated) {
    const ok = await confirmModal.value.ask({
      title: 'Yêu cầu đăng nhập',
      message: 'Bạn cần đăng nhập tài khoản Độc giả để thực hiện hành động này. Đi đến trang đăng nhập?',
      confirmText: 'Đăng nhập ngay',
      cancelText: 'Hủy bỏ'
    });
    if (ok) {
      router.push({ name: 'login', query: { redirect: route.fullPath } });
    }
    return;
  }
  if (authStore.isStaff) {
    toast.show('Tài khoản quản lý không có quyền thích sách.', 'warning');
    return;
  }
  try {
    const res = await api.post(`/books/${book.value._id}/like-toggle`);
    if (res.success) {
      book.value.yeuThich = res.data.yeuThich;
      if (res.data.isLiked) {
        toast.show('Đã thích sách thành công!', 'success');
      } else {
        toast.show('Đã bỏ thích sách thành công!', 'success');
      }
    } else {
      toast.show(res.message || 'Lỗi thao tác thích sách.', 'error');
    }
  } catch (err) {
    console.error('Like toggle error:', err);
    toast.show(err.response?.data?.message || 'Không thể thực hiện thích sách lúc này.', 'error');
  }
};

const hasReviewed = computed(() => {
  if (!authStore.isAuthenticated || !authStore.user?._id || !book.value?.binhLuan) return false;
  return book.value.binhLuan.some(rv => (rv.docGia === authStore.user._id || rv.docGia?._id === authStore.user._id));
});

const myReview = computed(() => {
  if (!authStore.isAuthenticated || !authStore.user?._id || !book.value?.binhLuan) return null;
  return book.value.binhLuan.find(rv => (rv.docGia === authStore.user._id || rv.docGia?._id === authStore.user._id));
});

const startEditReview = () => {
  if (myReview.value) {
    userRating.value = myReview.value.soSao;
    userComment.value = myReview.value.noiDung;
    isEditingReview.value = true;
  }
};

const cancelEditReview = () => {
  isEditingReview.value = false;
  userRating.value = 5;
  userComment.value = '';
  reviewError.value = '';
  reviewSuccess.value = '';
};

const deleteReview = async () => {
  const ok = await confirmModal.value.ask({ message: 'Bạn có chắc chắn muốn xóa đánh giá này không?' });
  if (!ok) return;
  reviewError.value = '';
  reviewSuccess.value = '';
  try {
    const res = await api.delete(`/books/${book.value._id}/reviews`);
    if (res.success) {
      toast.show('Đã xóa đánh giá thành công!', 'success');
      book.value.rating = res.data.rating;
      book.value.soLuotDanhGia = res.data.soLuotDanhGia;
      book.value.binhLuan = res.data.binhLuan;
      userComment.value = '';
      userRating.value = 5;
      isEditingReview.value = false;
    } else {
      toast.show(res.message || 'Xóa đánh giá thất bại.', 'error');
    }
  } catch (err) {
    console.error('Delete review error:', err);
    toast.show(err.response?.data?.message || 'Có lỗi xảy ra khi xóa đánh giá.', 'error');
  }
};

// State cho mượn lẻ nhanh (Quick Borrow)
const ngayHenTra = ref('');
const borrowQuantity = ref(1);
const submittingQuickBorrow = ref(false);
const quickBorrowError = ref('');
const quickBorrowSuccess = ref('');

// Computed properties cho ngayHenTra min/max
const minDate = computed(() => {
  const today = new Date();
  today.setDate(today.getDate() + 1); // Trả ít nhất ngày mai
  return today.toISOString().split('T')[0];
});

const maxBorrowDays = computed(() => {
  return authStore.user?.subscriptionPlan?.soNgayMuonToiDa || 14;
});

const isBookGiaoTrinh = computed(() => {
  if (!book.value) return false;
  const name = (book.value.tenSach || '').toLowerCase();
  const categoryName = (book.value.theLoai?.tenTheLoai || book.value.theLoai || '').toString().toLowerCase();
  
  return categoryName.includes('giáo dục') || 
         categoryName.includes('ngoại ngữ') || 
         categoryName.includes('khoa học') ||
         name.includes('giáo trình') || 
         name.includes('bài tập') ||
         name.includes('sách giáo khoa') ||
         name.includes('tài liệu học tập');
});

const maxDate = computed(() => {
  const max = new Date();
  max.setDate(max.getDate() + maxBorrowDays.value);
  return max.toISOString().split('T')[0];
});

// Khởi tạo ngày hẹn trả mặc định (14 ngày sau hoặc max hạn của thẻ)
const setDefaultReturnDate = () => {
  const defDate = new Date();
  defDate.setDate(defDate.getDate() + Math.min(14, maxBorrowDays.value));
  ngayHenTra.value = defDate.toISOString().split('T')[0];
};

const getBookBorrowFee = (plan) => {
  if (!plan) return 5000;
  if (isBookGiaoTrinh.value) return 0;
  return plan.phiMuonSachGiay !== undefined ? plan.phiMuonSachGiay : 5000;
};

const getBookOverdueFee = (plan) => {
  if (!plan) return 5000;
  return plan.phiPhatTreHan !== undefined ? plan.phiPhatTreHan : 5000;
};

const quickBorrowDaysCount = computed(() => {
  if (!ngayHenTra.value) return 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const returnDate = new Date(ngayHenTra.value);
  returnDate.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((returnDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
});

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatBorrowDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const submitReview = async () => {
  reviewError.value = '';
  reviewSuccess.value = '';
  const isEdit = isEditingReview.value;
  const commentPreview = userComment.value.trim()
    ? `\n\nNội dung: ${userComment.value.trim().slice(0, 160)}${userComment.value.trim().length > 160 ? '...' : ''}`
    : '\n\nBạn chưa nhập nội dung bình luận kèm theo.';
  const ok = await confirmModal.value.ask({
    title: isEdit ? 'Xác nhận cập nhật đánh giá' : 'Xác nhận gửi đánh giá',
    message: `Bạn muốn ${isEdit ? 'cập nhật' : 'gửi'} đánh giá ${userRating.value}/5 sao cho sách "${book.value.tenSach}"?${commentPreview}`,
    confirmText: isEdit ? 'Cập nhật đánh giá' : 'Gửi đánh giá',
    cancelText: 'Xem lại'
  });
  if (!ok) return;

  submittingReview.value = true;
  try {
    const res = await api.post(`/books/${book.value._id}/reviews`, {
      soSao: userRating.value,
      noiDung: userComment.value
    });
    if (res.success) {
      if (isEdit) {
        toast.show('Đã cập nhật đánh giá thành công!', 'success');
      } else {
        toast.show('Đã gửi đánh giá thành công!', 'success');
      }
      book.value.rating = res.data.rating;
      book.value.soLuotDanhGia = res.data.soLuotDanhGia;
      book.value.binhLuan = res.data.binhLuan;
      userComment.value = '';
      userRating.value = 5;
      isEditingReview.value = false;
    } else {
      reviewError.value = res.message || 'Gửi đánh giá thất bại.';
    }
  } catch (err) {
    console.error('Submit review error:', err);
    reviewError.value = err.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá.';
  } finally {
    submittingReview.value = false;
  }
};

const getImageUrl = (path) => {
  if (!path) return '/placeholder_book.png';
  if (path.startsWith('http') || path.startsWith('data:image')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `http://localhost:3000${cleanPath}`;
};

const formatCurrency = (val) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
};

const getStatusText = () => {
  if (!book.value) return '';
  if (book.value.trangThai === 'DISCONTINUED') return 'Ngừng phục vụ (Drain)';
  return book.value.soLuongKhaDung > 0 
    ? `Còn sách (${book.value.soLuongKhaDung} bản khả dụng)` 
    : 'Hết sách khả dụng';
};

const addToCart = async () => {
  if (!book.value) return;
  if (!authStore.isAuthenticated) {
    const ok = await confirmModal.value.ask({
      title: 'Yêu cầu đăng nhập',
      message: 'Bạn cần đăng nhập tài khoản Độc giả để thực hiện mượn sách. Đi đến trang đăng nhập?',
      confirmText: 'Đăng nhập ngay',
      cancelText: 'Hủy bỏ'
    });
    if (ok) {
      router.push({ name: 'login', query: { redirect: route.fullPath } });
    }
    return;
  }
  if (authStore.isStaff) {
    toast.show('Tài khoản nhân viên không có quyền đăng ký mượn sách.', 'warning');
    return;
  }
  cartStore.addBook(book.value, borrowQuantity.value);
};

const clampBorrowQuantity = () => {
  if (!book.value) return;
  const max = Math.max(1, Number(book.value.soLuongKhaDung) || 1);
  borrowQuantity.value = Math.min(Math.max(1, Number(borrowQuantity.value) || 1), max);
};

const changeBorrowQuantity = (delta) => {
  borrowQuantity.value += delta;
  clampBorrowQuantity();
};

const goToCart = () => {
  router.push({ name: 'cart' });
};

const relatedBooks = ref([]);
const isRelatedCollapsed = ref(false);
const scrollContainer = ref(null);

const navigateToBook = (id) => {
  router.push(`/books/${id}`);
};

const scrollRelated = (direction) => {
  if (!scrollContainer.value) return;
  const container = scrollContainer.value;
  const card = container.children[0];
  if (!card) return;
  const cardWidth = card.offsetWidth + 16; // w-40/44 + gap
  if (direction === 'prev') {
    container.scrollBy({ left: -cardWidth, behavior: 'smooth' });
  } else {
    container.scrollBy({ left: cardWidth, behavior: 'smooth' });
  }
};

const handleQuickBorrow = async () => {
  if (!authStore.isAuthenticated) {
    const ok = await confirmModal.value.ask({
      title: 'Yêu cầu đăng nhập',
      message: 'Bạn cần đăng nhập tài khoản Độc giả để thực hiện mượn sách. Đi đến trang đăng nhập?',
      confirmText: 'Đăng nhập ngay',
      cancelText: 'Hủy bỏ'
    });
    if (ok) {
      router.push({ name: 'login', query: { redirect: route.fullPath } });
    }
    return;
  }
  if (authStore.isStaff) {
    toast.show('Tài khoản nhân viên không có quyền đăng ký mượn sách.', 'warning');
    return;
  }
  if (!ngayHenTra.value) {
    quickBorrowError.value = 'Vui lòng chọn ngày hẹn trả sách!';
    return;
  }

  const ok = await confirmModal.value.ask({
    title: 'Xác nhận mượn sách',
    message: `Bạn có chắc chắn muốn đăng ký mượn ${borrowQuantity.value} bản sách này không?\n\n${book.value.tenSach}\n\nThời gian mượn dự kiến: ${quickBorrowDaysCount.value} ngày, từ ${formatBorrowDate(new Date())} đến ${formatBorrowDate(ngayHenTra.value)}.`,
    confirmText: 'Mượn ngay',
    cancelText: 'Hủy bỏ'
  });
  if (!ok) return;

  quickBorrowError.value = '';
  quickBorrowSuccess.value = '';
  submittingQuickBorrow.value = true;

  try {
    const chiTietMuon = [{
      sach: book.value._id,
      soLuong: borrowQuantity.value
    }];

    const phi = getBookBorrowFee(authStore.user?.subscriptionPlan) * borrowQuantity.value * quickBorrowDaysCount.value;
    const payload = {
      chiTietMuon,
      ngayHenTra: ngayHenTra.value,
      phiMuon: phi,
      soTienGiam: 0,
      tongTienThanhToan: phi,
    };

    const res = await api.post('/borrowing/receipts', payload);
    if (res.success) {
      quickBorrowSuccess.value = 'Đăng ký mượn sách thành công! Vui lòng tới thư viện nhận sách.';
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
    }
  } catch (error) {
    quickBorrowError.value = error.response?.data?.message || error.message || 'Lỗi tạo phiếu mượn nhanh.';
  } finally {
    submittingQuickBorrow.value = false;
  }
};

const fetchBookDetail = async (id) => {
  loading.value = true;
  try {
    const res = await api.get(`/books/${id}`);
    if (res.success) {
      book.value = res.data.book;
      relatedBooks.value = res.data.relatedBooks || [];
      // Reset form reviews
      userRating.value = 5;
      userComment.value = '';
      reviewError.value = '';
      reviewSuccess.value = '';
      
      // Set default ngày hẹn trả
      setDefaultReturnDate();
    }
  } catch (error) {
    console.error('Fetch book detail error:', error);
  } finally {
    loading.value = false;
  }
};

watch(() => route.params.id, (newId) => {
  if (newId) {
    fetchBookDetail(newId);
  }
});

onMounted(() => {
  fetchBookDetail(route.params.id);
});
</script>

<style scoped>
.custom-horizontal-scroll {
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none;  /* IE and Edge */
}
.custom-horizontal-scroll::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}
</style>
