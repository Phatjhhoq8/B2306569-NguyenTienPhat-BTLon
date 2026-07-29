<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
    <div class="bg-gradient-to-r from-slate-950 via-primary to-indigo-900 rounded-[2rem] p-6 md:p-8 text-white shadow-xl overflow-hidden relative">
      <div class="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/10"></div>
      <div class="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="flex items-center gap-4">
          <div class="h-20 w-20 rounded-3xl bg-white/15 border border-white/20 flex items-center justify-center text-3xl font-black">
            {{ authStore.user?.ten?.charAt(0) }}
          </div>
          <div class="space-y-1">
            <span class="text-xs uppercase tracking-[0.25em] text-white/60 font-black">Hồ sơ độc giả</span>
            <h1 class="font-serif text-3xl font-bold">{{ authStore.user?.hoLot }} {{ authStore.user?.ten }}</h1>
            <p class="text-sm text-white/70 font-semibold">{{ authStore.user?.maDocGia }} · {{ activeSub?.goiDocGia?.tenGoi || 'Chưa có gói hội viên' }}</p>
          </div>
        </div>
        <router-link to="/memberships" class="bg-white text-slate-950 hover:bg-secondary transition-all text-sm font-black py-3 px-5 rounded-2xl shadow-lg text-center">
          Quản lý hội viên
        </router-link>
      </div>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div v-for="stat in profileStats" :key="stat.label" class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <span class="text-[10px] uppercase tracking-wider font-black text-slate-400">{{ stat.label }}</span>
        <p class="text-2xl font-black text-slate-900 mt-1">{{ stat.value }}</p>
        <span class="text-[10px] font-bold" :class="stat.tone">{{ stat.caption }}</span>
      </div>
    </div>

    <div class="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm flex flex-wrap gap-2">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        @click="activeTab = tab.value"
        class="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
        :class="activeTab === tab.value ? 'bg-primary text-white shadow' : 'text-slate-500 hover:bg-slate-50'"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Left Info Column (4/12) -->
      <aside class="lg:col-span-4 space-y-6">
        <!-- Personal Info Card -->
        <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="bg-primary text-white h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg">
                {{ authStore.user?.ten?.charAt(0) }}
              </div>
              <div>
                <h3 class="font-bold text-slate-800">{{ authStore.user?.hoLot }} {{ authStore.user?.ten }}</h3>
                <span class="text-xs font-semibold text-slate-400">ĐỘC GIẢ ({{ authStore.user?.maDocGia }})</span>
              </div>
            </div>
            <button 
              @click="openEditProfileModal"
              class="text-primary hover:text-primary-dark p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              title="Chỉnh sửa hồ sơ"
            >
              <Edit class="h-4 w-4" />
            </button>
          </div>

          <hr class="border-slate-100" />

          <ul class="space-y-3 text-sm text-slate-600 font-medium">
            <li class="flex items-center"><Mail class="h-4 w-4 mr-2 text-primary" /> {{ authStore.user?.email }}</li>
            <li class="flex items-center"><Phone class="h-4 w-4 mr-2 text-primary" /> {{ authStore.user?.dienThoai }}</li>
            <li class="flex items-center"><MapPin class="h-4 w-4 mr-2 text-primary" /> {{ authStore.user?.diachi }}</li>
            <li class="flex items-center"><Calendar class="h-4 w-4 mr-2 text-primary" /> Sinh ngày: {{ formatDate(authStore.user?.ngaySinh) }}</li>
          </ul>
          
          <button 
            @click="openChangePasswordModal"
            class="w-full mt-4 bg-primary/10 hover:bg-primary/20 text-primary font-black py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center space-x-1 border border-primary/20"
          >
            <Lock class="h-3.5 w-3.5" /> <span>Đổi mật khẩu tài khoản</span>
          </button>
        </div>

        <!-- Membership Active Subscription card -->
        <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 class="font-serif text-lg font-bold text-slate-800 flex items-center">
            <Award class="h-5 w-5 mr-2 text-primary" /> Thẻ hội viên
          </h3>
          
          <div v-if="activeSubs.length > 0" class="space-y-3">
            <div
              v-for="sub in activeSubs"
              :key="sub._id"
              class="bg-gradient-to-r from-primary to-indigo-900 text-white p-4 rounded-2xl space-y-2 relative overflow-hidden"
            >
              <div class="absolute -right-6 -bottom-6 w-16 h-16 bg-white/10 rounded-full"></div>
              <span
                v-if="sub._id === bestActiveSub?._id"
                class="absolute top-3 right-3 bg-white/15 text-secondary text-[9px] font-black px-2 py-0.5 rounded-full uppercase"
              >Quyền cao nhất</span>
              <span class="text-[10px] uppercase font-bold tracking-widest block opacity-70">Gói hoạt động</span>
              <h4 class="font-bold text-lg text-secondary">{{ sub.goiDocGia?.tenGoi || 'Standard' }}</h4>
              <span class="text-[10px] block opacity-90">Hạn dùng: {{ (sub.goiDocGia?.tenGoi || '').toLowerCase().normalize('NFC').includes('tiêu chuẩn') ? 'Vĩnh viễn' : formatDate(sub.ngayKetThuc) }}</span>
              <div class="grid grid-cols-2 gap-2 pt-2 text-[10px] font-bold">
                <div class="rounded-xl bg-white/10 border border-white/10 px-2 py-1.5">
                  <span class="block text-white/60 uppercase tracking-wide">Giá gốc</span>
                  <span class="text-white">{{ formatCurrency(getSubscriptionBaseAmount(sub)) }}</span>
                </div>
                <div class="rounded-xl bg-white/10 border border-white/10 px-2 py-1.5">
                  <span class="block text-white/60 uppercase tracking-wide">Đã thanh toán</span>
                  <span class="text-secondary">{{ formatCurrency(getSubscriptionPaidAmount(sub)) }}</span>
                </div>
              </div>
              <span v-if="sub.maGiamGia || sub.soTienGiam" class="text-[10px] block text-white/80">
                Mã giảm: <strong>{{ sub.maGiamGia || 'Đã áp dụng' }}</strong> · Giảm {{ formatCurrency(sub.soTienGiam || 0) }}
              </span>
            </div>
            <ul class="text-xs space-y-1 text-slate-500 font-medium pt-2">
              <li>• Quyền áp dụng: {{ activeSub.goiDocGia?.tenGoi }}</li>
              <li>• Mượn tối đa: {{ activeSub.goiDocGia?.soSachToiDa }} cuốn</li>
              <li>• Thời gian mượn: {{ activeSub.goiDocGia?.soNgayMuonToiDa }} ngày</li>
              <li>• Tiền cọc: {{ activeSub.goiDocGia?.mienTienCoc ? 'Miễn cọc' : formatCurrency(activeSub.goiDocGia?.tienDatCoc || 0) }}</li>
              <li class="pt-2 text-slate-700 flex flex-col gap-1.5 border-t border-slate-100 mt-2">
                <span class="block">
                  <strong>Đang có:</strong> {{ activeSubs.length }} gói hội viên còn hiệu lực
                </span>
                
                <span v-if="cardAutoRenewSub" class="flex items-center gap-1.5">
                  <span class="h-2 w-2 rounded-full" :class="cardAutoRenewSub.tuDongGiaHan ? 'bg-green-500 animate-pulse' : 'bg-slate-400'"></span>
                  <span>Tự động gia hạn thẻ: <strong>{{ cardAutoRenewSub.tuDongGiaHan ? 'Đang bật' : 'Đã tắt' }}</strong></span>
                </span>
                <span v-else class="text-slate-500 italic text-[11px] block">Thanh toán từng kỳ (Không tự động gia hạn)</span>

                <button 
                  v-if="cardAutoRenewSub && cardAutoRenewSub.tuDongGiaHan && cardAutoRenewSub.trangThai === 'DANG_HIEU_LUC'"
                  @click="cancelSubscription"
                  :disabled="renewLoading"
                  class="mt-1 w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-1.5 px-3 rounded-xl text-[10px] transition-colors border border-red-200"
                >
                  {{ renewLoading ? 'Đang xử lý...' : 'Hủy tự động gia hạn' }}
                </button>
                <button
                  v-else-if="cardAutoRenewSub && !cardAutoRenewSub.tuDongGiaHan && cardAutoRenewSub.trangThai === 'DANG_HIEU_LUC'"
                  @click="enableAutoRenew"
                  :disabled="renewLoading"
                  class="mt-1 w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold py-1.5 px-3 rounded-xl text-[10px] transition-colors border border-emerald-200"
                >
                  {{ renewLoading ? 'Đang xử lý...' : 'Bật lại tự động gia hạn' }}
                </button>
              </li>
            </ul>
          </div>
          
          <div v-else class="text-center py-4 space-y-3">
            <p class="text-xs text-slate-400 font-medium">Bạn chưa đăng ký gói hội viên VIP nào.</p>
            <router-link to="/memberships" class="bg-primary-light text-primary hover:bg-primary hover:text-white transition-all text-xs font-semibold py-2 px-4 rounded-xl inline-block">
              Nâng cấp gói ngay
            </router-link>
          </div>
        </div>
      </aside>

      <!-- Right Tab Content Column (8/12) -->
      <div class="lg:col-span-8 space-y-8">
        <!-- Loan History Section -->
        <div v-show="activeTab === 'loans'" class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          <h2 class="font-serif text-xl font-bold text-slate-800 border-b pb-2 flex items-center">
            <BookOpen class="h-5 w-5 mr-2 text-primary" /> Sách Đang Mượn & Lịch sử
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            <input
              v-model="borrowSearchQuery"
              type="text"
              placeholder="Tìm mã phiếu, tên sách, mã sách..."
              class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-primary"
            />
            <select v-model="borrowStatusFilter" class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none">
              <option value="">Tất cả trạng thái</option>
              <option value="SAN_SANG">Sẵn sàng lấy sách</option>
              <option value="DANG_MUON">Đang mượn</option>
              <option value="DA_TRA">Đã trả sách</option>
              <option value="QUA_HAN">Quá hạn trả</option>
              <option value="HUY">Đã hủy</option>
            </select>
            <select v-model="borrowReturnFilter" class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none">
              <option value="">Tất cả tình trạng trả</option>
              <option value="has_unreturned">Có sách chưa trả</option>
              <option value="all_returned">Đã trả toàn bộ</option>
              <option value="has_late">Có sách trả trễ</option>
            </select>
            <div class="flex gap-2">
              <select v-model="borrowTimeFilter" class="min-w-0 flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none">
                <option value="">Tất cả thời gian</option>
                <option value="7d">7 ngày gần đây</option>
                <option value="30d">30 ngày gần đây</option>
                <option value="this_month">Tháng này</option>
                <option value="this_year">Năm nay</option>
              </select>
              <button v-if="hasBorrowFilters" @click="resetBorrowFilters" class="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black whitespace-nowrap">
                Đặt lại
              </button>
            </div>
          </div>

          <div v-if="receipts.length > 0" class="space-y-6">
            <div 
              v-for="receipt in filteredReceipts" 
              :key="receipt._id"
              class="border border-slate-100 rounded-2xl p-5 bg-slate-50 space-y-4"
            >
              <div class="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <span class="text-xs text-slate-400 font-bold">MÃ PHIẾU: {{ receipt.maPhieu }}</span>
                  <span class="text-[10px] text-slate-500 block">Mượn ngày: {{ formatDate(receipt.ngayMuon) }} | Hẹn trả: {{ formatDate(receipt.ngayHenTra) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span 
                    class="text-xs font-bold px-3 py-1 rounded-full uppercase"
                    :class="getReceiptStatusClass(receipt.trangThai)"
                  >
                    {{ getReceiptStatusText(receipt.trangThai) }}
                  </span>
                  <button 
                    v-if="receipt.trangThai === 'SAN_SANG'"
                    @click="cancelBorrow(receipt)"
                    class="bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[10px] py-1 px-2.5 rounded-lg border border-red-200 transition-colors shadow-sm"
                  >
                    Hủy yêu cầu
                  </button>
                  <button 
                    v-if="['DANG_MUON', 'QUA_HAN'].includes(receipt.trangThai) && activeSub?.goiDocGia?.choPhepGiaHanOnline"
                    @click="openRenewModal(receipt)"
                    class="bg-blue-50 hover:bg-blue-100 text-primary font-bold text-[10px] py-1 px-2.5 rounded-lg border border-blue-200 transition-colors shadow-sm"
                  >
                    Gia hạn
                  </button>
                  <button 
                    v-if="receipt.trangThai === 'CHO_THANH_TOAN'"
                    @click="openPaymentModal(receipt)"
                    class="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold text-[10px] py-1 px-2.5 rounded-lg border border-emerald-200 transition-colors shadow-sm"
                  >
                    Thanh toán
                  </button>
                </div>
              </div>

              <!-- Books inside Receipt -->
              <div class="space-y-3">
                <div 
                  v-for="item in receipt.chiTietMuon" 
                  :key="item._id"
                  class="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200"
                >
                  <div class="flex items-center space-x-3">
                    <div class="h-12 w-8 bg-slate-100 rounded overflow-hidden flex-shrink-0 border border-slate-200">
                      <img :src="getImageUrl(item.sach?.dauSach?.hinhAnh)" class="h-full w-full object-cover" />
                    </div>
                    <div>
                      <span class="font-bold text-xs text-slate-800 line-clamp-1 max-w-[200px]">{{ item.sach?.dauSach?.tenSach }}</span>
                      <span class="text-[9px] text-slate-400 block font-medium">Bản Specimen: {{ item.sach?.maSach }} | Vị trí: {{ item.sach?.viTriKe }}</span>
                    </div>
                  </div>
                  <span 
                    class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    :class="receipt.trangThai === 'HUY' ? 'bg-slate-100 text-slate-500' : 
                            (item.daTraChua ? 
                              (item.ngayTraThucTe && new Date(item.ngayTraThucTe) > new Date(receipt.ngayHenTra) ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700') 
                              : 'bg-amber-100 text-amber-700')"
                  >
                    {{ receipt.trangThai === 'HUY' ? 'Đã hủy' : 
                       (item.daTraChua ? 
                         (item.ngayTraThucTe && new Date(item.ngayTraThucTe) > new Date(receipt.ngayHenTra) ? 'Trả trễ' : 'Đã trả') 
                         : 'Chưa trả') }}
                  </span>
                </div>
              </div>

              <!-- Receipt checkout breakdown -->
              <div class="flex justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-medium">
                <span>Phí thanh toán: {{ formatCurrency(receipt.tongTienThanhToan) }}</span>
                <span v-if="receipt.fineAmount > 0" class="text-red-600 font-bold">
                  Phạt trễ hạn: {{ formatCurrency(receipt.fineAmount) }}
                </span>
              </div>
            </div>
            <div v-if="filteredReceipts.length === 0" class="text-center py-8 text-sm text-slate-400 font-medium">
              Không tìm thấy phiếu mượn phù hợp với bộ lọc.
            </div>
          </div>
          
          <div v-else class="text-center py-8 text-sm text-slate-400 font-medium">
            Bạn chưa thực hiện phiếu mượn sách nào.
          </div>
        </div>

        <!-- Thống kê tài chính cá nhân -->
        <div v-show="activeTab === 'financial'" class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 class="font-serif text-xl font-bold text-slate-800 border-b pb-2 flex items-center">
            <Banknote class="h-5 w-5 mr-2 text-green-600" /> Thống Kê Tài Chính Cá Nhân
          </h2>

          <div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <!-- Tiền mượn sách đã trả -->
            <div class="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-2xl p-4 space-y-0.5">
              <span class="text-[10px] text-blue-400 uppercase font-bold tracking-wider block">Phí mượn đã trả</span>
              <p class="text-lg font-black text-blue-700">{{ formatCurrency(myFinancials.tongPhiMuon) }}</p>
              <span class="text-[10px] text-slate-400 font-medium">{{ myFinancials.soPhieuDaTra }} phiếu đã trả</span>
            </div>
            <div class="bg-gradient-to-br from-primary-light to-white border border-primary/10 rounded-2xl p-4 space-y-0.5">
              <span class="text-[10px] text-primary uppercase font-bold tracking-wider block">Phí chờ thanh toán</span>
              <p class="text-lg font-black text-primary">{{ formatCurrency(myFinancials.phiMuonDangXuLy) }}</p>
              <span class="text-[10px] text-slate-400 font-medium">{{ myFinancials.soPhieuDangXuLyPhi }} phiếu đang xử lý/mượn</span>
            </div>
            <!-- Tiền phạt -->
            <div class="bg-gradient-to-br from-red-50 to-white border border-red-100 rounded-2xl p-4 space-y-0.5">
              <span class="text-[10px] text-red-400 uppercase font-bold tracking-wider block">Tiền phạt</span>
              <p class="text-lg font-black text-red-700">{{ formatCurrency(myFinancials.tongTienPhat) }}</p>
              <span class="text-[10px] text-slate-400 font-medium">Chưa trả: {{ formatCurrency(myFinancials.tienPhatChuaTra) }}</span>
            </div>
            <!-- Tiền cọc đang giữ -->
            <div class="bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-2xl p-4 space-y-0.5">
              <span class="text-[10px] text-amber-400 uppercase font-bold tracking-wider block">Tiền cọc</span>
              <p class="text-lg font-black text-amber-700">{{ formatCurrency(myFinancials.tongTienCoc) }}</p>
              <span class="text-[10px] text-slate-400 font-medium">{{ myFinancials.soPhieuDangMuon }} phiếu đang mượn</span>
            </div>
            <!-- Tiền hội viên -->
            <div class="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl p-4 space-y-0.5">
              <span class="text-[10px] text-indigo-400 uppercase font-bold tracking-wider block">Hội viên</span>
              <p class="text-lg font-black text-indigo-700">{{ formatCurrency(myFinancials.doanhThuHoiVien) }}</p>
              <span class="text-[10px] text-slate-400 font-medium">{{ myFinancials.soGoiDaMua }} gói đã mua</span>
            </div>
            <!-- Tổng chi phí -->
            <div class="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-2xl p-4 space-y-0.5">
              <span class="text-[10px] text-emerald-400 uppercase font-bold tracking-wider block">Tổng đã chi</span>
              <p class="text-lg font-black text-emerald-700">{{ formatCurrency(myFinancials.tongDaChi) }}</p>
              <span class="text-[10px] text-slate-400 font-medium">Phí mượn + phạt đã trả + hội viên</span>
            </div>
          </div>
        </div>

        <!-- Penalty Tickets Section -->
        <div v-show="activeTab === 'penalties'" class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          <h2 class="font-serif text-xl font-bold text-slate-800 border-b pb-2 flex items-center">
            <AlertTriangle class="h-5 w-5 mr-2 text-red-500" /> Danh sách Phiếu Phạt
          </h2>

          <div v-if="penalties.length > 0" class="space-y-4">
            <div 
              v-for="ticket in penalties" 
              :key="ticket._id"
              class="border border-slate-100 rounded-2xl p-4 bg-red-50/30 flex justify-between items-center flex-wrap gap-4"
            >
              <div>
                <span class="text-xs text-slate-400 font-bold">MÃ PHIẾU PHẠT: {{ ticket.maPhieuPhat }}</span>
                <p class="text-sm font-semibold text-slate-700 mt-1">Lỗi phạt: {{ ticket.lyDoPhat }}</p>
                <span class="text-xs text-red-600 font-bold block">Số tiền: {{ formatCurrency(ticket.soTienPhat) }}</span>
              </div>
              <div>
                <span 
                  v-if="ticket.daThanhToan"
                  class="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase"
                >
                  Đã thanh toán
                </span>
                <button 
                  v-else
                  @click="payPenalty(ticket)"
                  class="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-1.5 px-4 rounded-xl transition-colors shadow"
                >
                  Mô phỏng thanh toán
                </button>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-8 text-sm text-slate-400 font-medium">
            Tuyệt vời! Bạn không có phiếu phạt chưa thanh toán.
          </div>
        </div>
      </div>
    </div>
    <!-- Renew Date Modal -->
    <Teleport to="body">
      <div 
        v-if="isRenewModalOpen" 
        class="fixed inset-0 bg-slate-900/60 z-[99999] flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-300"
      >
        <div class="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-150 transform scale-100 transition-all duration-300">
          <div class="flex items-center space-x-3 text-primary">
            <div class="bg-blue-50 p-2.5 rounded-xl">
              <Calendar class="h-6 w-6 text-primary" />
            </div>
            <h3 class="font-sans font-extrabold text-slate-900 text-sm uppercase tracking-wide">
              Gia hạn phiếu mượn
            </h3>
          </div>

          <div class="space-y-3 text-xs text-slate-600 font-medium">
            <p><strong>Mã phiếu:</strong> {{ renewingReceipt?.maPhieu }}</p>
            <p><strong>Ngày mượn gốc:</strong> {{ formatDate(renewingReceipt?.ngayMuon) }}</p>
            <p><strong>Hạn trả hiện tại:</strong> {{ formatDate(renewingReceipt?.ngayHenTra) }}</p>
            <p><strong>Hạn trả tối đa cho phép:</strong> {{ formatDate(getMaxRenewDate(renewingReceipt)) }}</p>
            
            <div class="space-y-1 pt-2">
              <label class="block text-slate-700 font-bold">Chọn ngày hẹn trả mới:</label>
              <input 
                type="date" 
                v-model="newDueDateStr"
                :min="getMinRenewDateStr(renewingReceipt)"
                :max="getMaxRenewDateStr(renewingReceipt)"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:border-primary"
              />
            </div>

            <!-- Phí phát sinh dự tính -->
            <div v-if="estimatedExtraFee > 0" class="p-3 bg-amber-50 rounded-xl border border-amber-100 text-amber-900 font-bold space-y-1">
              <p>Phí gia hạn phát sinh thêm: {{ formatCurrency(estimatedExtraFee) }}</p>
              <p class="text-[10px] text-slate-500 font-normal">
                (Số ngày gia hạn thêm: {{ estimatedRenewDays }} ngày × {{ formatCurrency(activeSub?.goiDocGia?.phiMuonSachGiay) }}/ngày/sách)
              </p>
            </div>
            <div v-else class="p-3 bg-green-50 rounded-xl border border-green-100 text-green-800 font-bold">
              Gia hạn miễn phí (giáo trình hoặc gói mượn miễn phí).
            </div>
          </div>

          <div class="flex space-x-3 pt-2">
            <button 
              @click="isRenewModalOpen = false"
              class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold py-2.5 rounded-xl text-xs transition-colors"
            >
              Hủy bỏ
            </button>
            <button 
              @click="submitRenew"
              :disabled="!newDueDateStr || isRenewSubmitting"
              class="flex-1 bg-primary hover:bg-primary-dark text-white font-extrabold py-2.5 rounded-xl text-xs transition-all shadow-md disabled:opacity-50"
            >
              {{ isRenewSubmitting ? 'Đang xử lý...' : 'Xác nhận gia hạn' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Payment Modal -->
    <Teleport to="body">
      <div 
        v-if="isPaymentModalOpen" 
        class="fixed inset-0 bg-slate-900/65 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-300"
        @click.self="isPaymentModalOpen = false"
      >
        <div class="bg-white rounded-3xl max-w-4xl w-full p-6 space-y-4 shadow-2xl border border-slate-150 transform scale-100 transition-all duration-300 max-h-[95vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex items-center justify-between border-b pb-3">
            <div class="flex items-center space-x-3 text-emerald-600">
              <div class="bg-emerald-50 p-2.5 rounded-xl">
                <CreditCard class="h-6 w-6 text-emerald-600" />
              </div>
              <h3 class="font-sans font-extrabold text-slate-900 text-base uppercase tracking-wide">
                Thanh toán hóa đơn mượn sách
              </h3>
            </div>
            <button @click="isPaymentModalOpen = false" class="text-slate-400 hover:text-slate-600">
              <span class="text-xl">✕</span>
            </button>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6" v-if="paymentReceipt">
            <!-- Left Panel (7/12): Checkout options (THE_TIN_DUNG / VIETQR) -->
            <div class="lg:col-span-7 space-y-4">
              <!-- Chọn phương thức -->
              <div class="space-y-2">
                <label class="block text-slate-700 font-bold text-xs uppercase tracking-wider">Chọn phương thức thanh toán</label>
                <div class="grid grid-cols-2 gap-3">
                  <!-- Thẻ tín dụng option -->
                  <label 
                    class="border-2 rounded-2xl p-4 flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all hover:bg-slate-50"
                    :class="selectedPaymentMethod === 'THE_TIN_DUNG' ? 'border-primary bg-primary-light/10 text-primary-dark shadow-sm' : 'border-slate-200 text-slate-600'"
                  >
                    <input type="radio" value="THE_TIN_DUNG" v-model="selectedPaymentMethod" class="sr-only" />
                    <CreditCard class="h-6 w-6" />
                    <span class="text-xs font-bold">Thẻ Tín dụng / Ghi nợ</span>
                    <span class="text-[9px] font-semibold text-slate-400">Hỗ trợ VISA / Mastercard</span>
                  </label>

                  <!-- VietQR option -->
                  <label 
                    class="border-2 rounded-2xl p-4 flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all hover:bg-slate-50"
                    :class="selectedPaymentMethod === 'VIETQR' ? 'border-primary bg-primary-light/10 text-primary-dark shadow-sm' : 'border-slate-200 text-slate-600'"
                  >
                    <input type="radio" value="VIETQR" v-model="selectedPaymentMethod" class="sr-only" />
                    <QrCode class="h-6 w-6" />
                    <span class="text-xs font-bold">Chuyển khoản VietQR</span>
                    <span class="text-[9px] font-semibold text-slate-400">Quét mã thanh toán tức thời</span>
                  </label>
                </div>
              </div>

              <!-- Detail Form for THE_TIN_DUNG -->
              <div v-show="selectedPaymentMethod === 'THE_TIN_DUNG'" class="space-y-6 pt-2">
                <div class="flex flex-col md:flex-row gap-6 items-center justify-center bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
                  <!-- Credit Card Visual Mock -->
                  <div class="flex-shrink-0">
                    <div class="relative w-[280px] h-[170px] bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 rounded-2xl p-4 text-white shadow-lg flex flex-col justify-between border border-white/10 select-none overflow-hidden">
                      <div class="absolute -right-12 -top-12 w-28 h-28 bg-primary/20 rounded-full blur-2xl"></div>
                      
                      <div class="flex justify-between items-start">
                        <div class="space-y-0.5">
                          <span class="text-[7px] uppercase font-bold tracking-widest text-slate-400">Hóa đơn sách</span>
                          <h4 class="text-[9px] font-extrabold text-secondary tracking-wide uppercase">{{ paymentReceipt.maPhieu }}</h4>
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
                        <div class="font-mono text-xs tracking-widest text-white/95 font-semibold text-center">
                          {{ formattedCardNumber || '•••• •••• •••• ••••' }}
                        </div>
                        <div class="flex justify-between items-center text-[8px] font-medium text-slate-300">
                          <div>
                            <span class="text-[6px] uppercase tracking-wider text-slate-500 block mb-0.5">Chủ thẻ</span>
                            <span class="font-bold tracking-wider uppercase text-white truncate max-w-[100px] block">
                              {{ cardName || 'TÊN CHỦ THẺ' }}
                            </span>
                          </div>
                          <div>
                            <span class="text-[6px] uppercase tracking-wider text-slate-500 block mb-0.5">Hạn dùng</span>
                            <span class="font-bold text-white block">{{ cardExpiry || 'MM/YY' }}</span>
                          </div>
                          <div>
                            <span class="text-[6px] uppercase tracking-wider text-slate-500 block mb-0.5">CVC</span>
                            <span class="font-bold text-white block">{{ cardCvc || '•••' }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Input fields for Credit Card -->
                  <div class="flex-grow space-y-3 w-full text-xs">
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
              <div v-show="selectedPaymentMethod === 'VIETQR'" class="space-y-4 pt-2">
                <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center justify-center">
                  <!-- QR Code (5/12) -->
                  <div class="md:col-span-5 flex flex-col items-center">
                    <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-inner flex flex-col items-center text-center w-full">
                      <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Mã thanh toán VietQR</span>
                      <img 
                        :src="getVietQrUrl(appliedDiscount ? appliedDiscount.finalAmount : paymentReceipt.phiMuon, paymentReceipt.maPhieu)" 
                        alt="VietQR Code" 
                        class="w-36 h-36 object-contain bg-white p-2 rounded-xl border border-slate-100"
                      />
                      <div class="mt-2.5 text-[9px] font-bold text-slate-700 space-y-0.5">
                        <p>Số tiền: {{ formatCurrency(appliedDiscount ? appliedDiscount.finalAmount : paymentReceipt.phiMuon) }}</p>
                        <p>Nội dung: <span class="text-primary uppercase font-mono">TT {{ paymentReceipt.maPhieu }}</span></p>
                      </div>
                    </div>
                  </div>

                  <!-- physical simulator phone (7/12) -->
                  <div class="md:col-span-7 flex flex-col items-center">
                    <div class="relative w-48 h-[340px] bg-slate-950 rounded-[30px] p-2 shadow-2xl ring-6 ring-slate-800 border-2 border-slate-900 overflow-visible flex flex-col justify-between">
                      <div class="absolute top-2 left-1/2 -translate-x-1/2 bg-black h-3.5 w-12 rounded-full z-30 flex items-center justify-end px-1.5">
                        <div class="h-1 w-1 rounded-full bg-green-500 opacity-80 animate-pulse"></div>
                      </div>
                      <div class="relative flex-grow bg-slate-950 rounded-[24px] overflow-hidden flex flex-col justify-between p-2 pt-4 text-white text-center border border-white/5">
                        <div class="flex justify-between items-center text-[7px] text-slate-400 font-semibold px-1.5">
                          <span>9:41</span>
                          <span class="flex items-center space-x-1">
                            <Wifi class="h-2 w-2" />
                            <span class="text-[6px]">5G</span>
                            <Battery class="h-2.5 w-2.5" />
                          </span>
                        </div>
                        <div class="flex-grow bg-slate-900 rounded-xl flex flex-col items-center justify-center p-2 relative border border-slate-800 overflow-hidden shadow-inner mt-2">
                          <QrCode class="h-8 w-8 text-green-400/90 mb-1 animate-pulse" />
                          <span class="text-[8px] font-black text-green-400 tracking-wider">CAMERA GIẢ LẬP</span>
                          <p class="text-[7px] text-slate-400 mt-1 max-w-[100px] leading-tight">Đang quét mã VietQR tự động...</p>
                          <div class="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent shadow-[0_0_8px_rgba(74,222,128,0.8)] scan-laser z-10"></div>
                        </div>
                        <div class="mt-2">
                          <button 
                            @click="submitPayment"
                            class="w-full bg-green-500 hover:bg-green-600 text-slate-950 font-black py-1.5 rounded-xl text-[9px] transition-all shadow-md active:scale-95 flex items-center justify-center space-x-1"
                          >
                            <CheckCircle class="h-3 w-3" />
                            <span>Mô phỏng thanh toán QR</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Panel (5/12): Bill breakdown -->
            <div class="lg:col-span-5 bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-5 text-xs">
              <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-2">Tóm tắt hóa đơn</h3>
              
              <div class="space-y-3 font-medium text-slate-600">
                <div class="flex justify-between items-center">
                  <span>Mã phiếu mượn:</span>
                  <span class="text-slate-900 font-bold font-mono">{{ paymentReceipt.maPhieu }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span>Phí mượn tạm tính:</span>
                  <span class="text-slate-950 font-bold">{{ formatCurrency(paymentReceipt.phiMuon) }}</span>
                </div>
                <div v-if="paymentReceipt.tienCoc > 0" class="flex justify-between items-center text-slate-400">
                  <span>Tiền cọc sách (hoàn trả):</span>
                  <span>{{ formatCurrency(paymentReceipt.tienCoc) }}</span>
                </div>

                <!-- Mã giảm giá -->
                <div class="space-y-1.5 pt-1">
                  <label class="block text-slate-700 font-bold">Mã giảm giá</label>
                  <div class="flex space-x-2">
                    <input 
                      type="text" 
                      v-model="discountCodeInput"
                      placeholder="Nhập mã giảm giá..."
                      :disabled="appliedDiscount"
                      class="flex-1 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-primary uppercase font-bold"
                    />
                    <button 
                      v-if="!appliedDiscount"
                      @click="applyDiscountCode"
                      :disabled="isApplyingDiscount || !discountCodeInput"
                      class="bg-primary hover:bg-primary-dark text-white font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm text-[10px] disabled:opacity-50"
                    >
                      Áp dụng
                    </button>
                    <button 
                      v-else
                      @click="removeDiscountCode"
                      class="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-3 py-1.5 rounded-xl border border-red-200 transition-colors shadow-sm text-[10px]"
                    >
                      Gỡ bỏ
                    </button>
                  </div>
                  <p v-if="discountError" class="text-[9px] text-red-500 font-bold mt-1">{{ discountError }}</p>
                  <p v-if="appliedDiscount" class="text-[9px] text-green-600 font-bold mt-1">
                    ✓ Đã giảm: {{ formatCurrency(appliedDiscount.discountAmount) }}
                  </p>
                </div>

                <hr class="border-slate-200" />

                <!-- Tổng thanh toán thực tế -->
                <div class="flex justify-between items-center pt-2">
                  <span class="text-slate-800 font-bold text-xs uppercase tracking-wider">Tổng cần trả:</span>
                  <span class="text-base font-black text-emerald-650">
                    {{ formatCurrency(appliedDiscount ? appliedDiscount.finalAmount : paymentReceipt.phiMuon) }}
                  </span>
                </div>
              </div>

              <!-- Nút xác nhận thanh toán (chỉ hiển thị khi chọn Thẻ) -->
              <div v-show="selectedPaymentMethod === 'THE_TIN_DUNG'" class="pt-3">
                <button 
                  @click="submitPayment"
                  :disabled="isPaymentSubmitting || !isCardFormValid"
                  class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-2xl text-xs transition-all shadow-md disabled:opacity-50"
                >
                  {{ isPaymentSubmitting ? 'Đang xử lý...' : `Thanh toán ${formatCurrency(appliedDiscount ? appliedDiscount.finalAmount : paymentReceipt.phiMuon)}` }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Edit Profile Modal -->
    <Teleport to="body">
      <div 
        v-if="isEditProfileModalOpen" 
        class="fixed inset-0 bg-slate-900/65 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-300"
        @click.self="isEditProfileModalOpen = false"
      >
        <div class="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-150 transform scale-100 transition-all duration-300">
          <div class="flex items-center space-x-3 text-primary">
            <div class="bg-blue-50 p-2.5 rounded-xl">
              <span class="text-xl">👤</span>
            </div>
            <h3 class="font-sans font-extrabold text-slate-900 text-sm uppercase tracking-wide">
              Chỉnh sửa thông tin cá nhân
            </h3>
          </div>

          <div class="space-y-3 text-xs">
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="block text-slate-600 font-bold">Họ lót <span class="text-red-500">*</span>:</label>
                <input 
                  type="text" 
                  v-model="editForm.hoLot"
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:border-primary"
                />
              </div>
              <div class="space-y-1">
                <label class="block text-slate-600 font-bold">Tên <span class="text-red-500">*</span>:</label>
                <input 
                  type="text" 
                  v-model="editForm.ten"
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div class="space-y-1">
              <label class="block text-slate-600 font-bold">Số điện thoại <span class="text-red-500">*</span>:</label>
              <input 
                type="text" 
                v-model="editForm.dienThoai"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:border-primary"
              />
            </div>

            <div class="space-y-1">
              <label class="block text-slate-600 font-bold">Địa chỉ:</label>
              <input 
                type="text" 
                v-model="editForm.diachi"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:border-primary"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="block text-slate-600 font-bold">Ngày sinh:</label>
                <input 
                  type="date" 
                  v-model="editForm.ngaySinh"
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:border-primary"
                />
              </div>
              <div class="space-y-1">
                <label class="block text-slate-600 font-bold">Giới tính:</label>
                <select 
                  v-model="editForm.gioiTinh"
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:border-primary"
                >
                  <option value="NAM">Nam</option>
                  <option value="NU">Nữ</option>
                  <option value="KHAC">Khác</option>
                </select>
              </div>
            </div>
          </div>

          <div class="flex space-x-3 pt-2">
            <button 
              @click="isEditProfileModalOpen = false"
              class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold py-2.5 rounded-xl text-xs transition-colors"
            >
              Hủy bỏ
            </button>
            <button 
              @click="submitEditProfile"
              :disabled="isSubmittingProfile"
              class="flex-1 bg-primary hover:bg-primary-dark text-white font-extrabold py-2.5 rounded-xl text-xs transition-all shadow-md disabled:opacity-50"
            >
              {{ isSubmittingProfile ? 'Đang cập nhật...' : 'Lưu thay đổi' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Change Password Modal -->
    <Teleport to="body">
      <div 
        v-if="isChangePasswordModalOpen" 
        class="fixed inset-0 bg-slate-900/65 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-300"
        @click.self="isChangePasswordModalOpen = false"
      >
        <div class="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-150 transform scale-100 transition-all duration-300">
          <div class="flex items-center space-x-3 text-primary">
            <div class="bg-blue-50 p-2.5 rounded-xl">
              <Lock class="h-5 w-5 text-primary" />
            </div>
            <h3 class="font-sans font-extrabold text-slate-900 text-sm uppercase tracking-wide">
              Đổi mật khẩu tài khoản
            </h3>
          </div>

          <div class="space-y-3 text-xs">
            <div class="space-y-1">
              <label class="block text-slate-600 font-bold">Mật khẩu hiện tại <span class="text-red-500">*</span>:</label>
              <input 
                type="password" 
                v-model="passwordForm.matKhauCu"
                placeholder="••••••"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:border-primary"
              />
            </div>

            <div class="space-y-1">
              <label class="block text-slate-600 font-bold">Mật khẩu mới <span class="text-red-500">*</span>:</label>
              <input 
                type="password" 
                v-model="passwordForm.matKhauMoi"
                placeholder="Tối thiểu 6 ký tự"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:border-primary"
              />
            </div>

            <div class="space-y-1">
              <label class="block text-slate-600 font-bold">Xác nhận mật khẩu mới <span class="text-red-500">*</span>:</label>
              <input 
                type="password" 
                v-model="passwordForm.confirmPassword"
                placeholder="••••••"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div class="flex space-x-3 pt-2">
            <button 
              @click="isChangePasswordModalOpen = false"
              class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold py-2.5 rounded-xl text-xs transition-colors"
            >
              Hủy bỏ
            </button>
            <button 
              @click="submitChangePassword"
              :disabled="isSubmittingPassword"
              class="flex-1 bg-primary hover:bg-primary-dark text-white font-extrabold py-2.5 rounded-xl text-xs transition-all shadow-md disabled:opacity-50"
            >
              {{ isSubmittingPassword ? 'Đang đổi...' : 'Đổi mật khẩu' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Custom Confirm Dialog -->
    <ConfirmModal ref="confirmModal" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import api from '../services/api';
import { User, Mail, Phone, MapPin, Calendar, Award, BookOpen, AlertTriangle, Banknote, Edit, Lock, CreditCard, QrCode, Wifi, Battery, CheckCircle } from '@lucide/vue';
import { useToastStore } from '../stores/toast';
import ConfirmModal from '../components/ConfirmModal.vue';

const authStore = useAuthStore();
const toast = useToastStore();
const confirmModal = ref(null);

// Edit Profile logic
const isEditProfileModalOpen = ref(false);
const isSubmittingProfile = ref(false);
const editForm = ref({
  hoLot: '',
  ten: '',
  dienThoai: '',
  diachi: '',
  ngaySinh: '',
  gioiTinh: 'NAM'
});

// Change Password logic
const isChangePasswordModalOpen = ref(false);
const isSubmittingPassword = ref(false);
const passwordForm = ref({
  matKhauCu: '',
  matKhauMoi: '',
  confirmPassword: ''
});

const openChangePasswordModal = () => {
  passwordForm.value = {
    matKhauCu: '',
    matKhauMoi: '',
    confirmPassword: ''
  };
  isChangePasswordModalOpen.value = true;
};

const submitChangePassword = async () => {
  const { matKhauCu, matKhauMoi, confirmPassword } = passwordForm.value;
  if (!matKhauCu || !matKhauMoi || !confirmPassword) {
    toast.show('Vui lòng nhập đầy đủ thông tin!', 'error');
    return;
  }
  if (matKhauMoi.length < 6) {
    toast.show('Mật khẩu mới phải có tối thiểu 6 ký tự!', 'error');
    return;
  }
  if (matKhauMoi !== confirmPassword) {
    toast.show('Mật khẩu xác nhận không khớp!', 'error');
    return;
  }

  isSubmittingPassword.value = true;
  try {
    const res = await api.put('/users/me/password', {
      matKhauCu,
      matKhauMoi
    });
    if (res.success) {
      toast.show('Đổi mật khẩu tài khoản thành công!', 'success');
      isChangePasswordModalOpen.value = false;
    }
  } catch (error) {
    toast.show(error.message || 'Lỗi khi đổi mật khẩu', 'error');
  } finally {
    isSubmittingPassword.value = false;
  }
};

const openEditProfileModal = () => {
  if (authStore.user) {
    editForm.value = {
      hoLot: authStore.user.hoLot || '',
      ten: authStore.user.ten || '',
      dienThoai: authStore.user.dienThoai || '',
      diachi: authStore.user.diachi || '',
      ngaySinh: authStore.user.ngaySinh ? authStore.user.ngaySinh.split('T')[0] : '',
      gioiTinh: authStore.user.gioiTinh || 'NAM'
    };
    isEditProfileModalOpen.value = true;
  }
};

const submitEditProfile = async () => {
  if (!editForm.value.hoLot || !editForm.value.ten || !editForm.value.dienThoai) {
    toast.show('Vui lòng nhập đầy đủ thông tin bắt buộc!', 'error');
    return;
  }
  isSubmittingProfile.value = true;
  try {
    const res = await api.put('/users/me', editForm.value);
    if (res.success) {
      toast.show('Cập nhật thông tin cá nhân thành công!', 'success');
      isEditProfileModalOpen.value = false;
      await authStore.fetchUser(); // Cập nhật lại thông tin hiển thị trên toàn trang
    }
  } catch (error) {
    toast.show(error.message || 'Lỗi khi cập nhật thông tin cá nhân', 'error');
  } finally {
    isSubmittingProfile.value = false;
  }
};

const isRenewModalOpen = ref(false);
const renewingReceipt = ref(null);
const newDueDateStr = ref('');
const isRenewSubmitting = ref(false);

const getMinRenewDateStr = (receipt) => {
  if (!receipt) return '';
  const date = new Date(receipt.ngayHenTra);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
};

const getMaxRenewDate = (receipt) => {
  if (!receipt || !activeSub.value || !activeSub.value.goiDocGia) return null;
  const maxDays = activeSub.value.goiDocGia.soNgayMuonToiDa || 14;
  const date = new Date(receipt.ngayMuon);
  date.setDate(date.getDate() + maxDays);
  return date;
};

const getMaxRenewDateStr = (receipt) => {
  const maxDate = getMaxRenewDate(receipt);
  return maxDate ? maxDate.toISOString().split('T')[0] : '';
};

const estimatedRenewDays = computed(() => {
  if (!renewingReceipt.value || !newDueDateStr.value) return 0;
  const newDate = new Date(newDueDateStr.value);
  const oldDate = new Date(renewingReceipt.value.ngayHenTra);
  newDate.setHours(12, 0, 0, 0);
  oldDate.setHours(12, 0, 0, 0);
  const diffTime = newDate.getTime() - oldDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

const estimatedExtraFee = computed(() => {
  if (!renewingReceipt.value || !newDueDateStr.value || !activeSub.value || !activeSub.value.goiDocGia) return 0;
  const days = estimatedRenewDays.value;
  const baseRate = activeSub.value.goiDocGia.phiMuonSachGiay || 0;
  
  let chargeableCount = 0;
  for (const item of renewingReceipt.value.chiTietMuon) {
    if (item.sach && item.sach.dauSach) {
      const title = item.sach.dauSach;
      const isGiaoTrinh = (title.tenSach || '').toLowerCase().includes('giáo trình') ||
                           (title.tenSach || '').toLowerCase().includes('bài tập') ||
                           (title.tenSach || '').toLowerCase().includes('sách giáo khoa') ||
                           (title.theLoai || '').toString().toLowerCase().includes('giáo dục') ||
                           (title.theLoai || '').toString().toLowerCase().includes('ngoại ngữ') ||
                           (title.theLoai || '').toString().toLowerCase().includes('khoa học');
      if (!isGiaoTrinh) {
        chargeableCount++;
      }
    }
  }
  return days * baseRate * chargeableCount;
});

const openRenewModal = (receipt) => {
  renewingReceipt.value = receipt;
  const minDateStr = getMinRenewDateStr(receipt);
  const maxDateStr = getMaxRenewDateStr(receipt);
  
  if (minDateStr > maxDateStr) {
    toast.show('Phiếu mượn đã đạt thời hạn tối đa của gói hội viên, không thể gia hạn thêm!', 'error');
    return;
  }
  
  newDueDateStr.value = minDateStr;
  isRenewModalOpen.value = true;
};

const submitRenew = async () => {
  if (!renewingReceipt.value || !newDueDateStr.value) return;
  isRenewSubmitting.value = true;
  try {
    const res = await api.post(`/borrowing/receipts/${renewingReceipt.value._id}/renew`, {
      ngayHenTraMoi: newDueDateStr.value
    });
    if (res.success) {
      toast.show('Gia hạn phiếu mượn thành công!', 'success');
      isRenewModalOpen.value = false;
      loadData();
    }
  } catch (error) {
    toast.show(error.message || 'Lỗi khi gia hạn phiếu mượn', 'error');
  } finally {
    isRenewSubmitting.value = false;
  }
};

// Payment logic
const isPaymentModalOpen = ref(false);
const paymentReceipt = ref(null);
const discountCodeInput = ref('');
const discountError = ref('');
const appliedDiscount = ref(null);
const isApplyingDiscount = ref(false);
const selectedPaymentMethod = ref('THE_TIN_DUNG');
const isPaymentSubmitting = ref(false);

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

const openPaymentModal = (receipt) => {
  paymentReceipt.value = receipt;
  discountCodeInput.value = '';
  discountError.value = '';
  appliedDiscount.value = null;
  selectedPaymentMethod.value = 'THE_TIN_DUNG';
  cardNumber.value = '';
  cardName.value = (authStore.user ? `${authStore.user.hoLot} ${authStore.user.ten}`.toUpperCase() : '');
  cardExpiry.value = '';
  cardCvc.value = '';
  isPaymentModalOpen.value = true;
};

const applyDiscountCode = async () => {
  if (!discountCodeInput.value.trim()) return;
  isApplyingDiscount.value = true;
  discountError.value = '';
  try {
    const res = await api.post('/discounts/validate', {
      code: discountCodeInput.value.trim().toUpperCase(),
      orderAmount: paymentReceipt.value.phiMuon,
      apDungCho: 'MUON_SACH'
    });
    if (res.success) {
      appliedDiscount.value = res.data;
      toast.show('Áp dụng mã giảm giá thành công!', 'success');
    }
  } catch (error) {
    discountError.value = error.message || 'Mã giảm giá không hợp lệ';
    appliedDiscount.value = null;
  } finally {
    isApplyingDiscount.value = false;
  }
};

const removeDiscountCode = () => {
  discountCodeInput.value = '';
  appliedDiscount.value = null;
  discountError.value = '';
};

const submitPayment = async () => {
  if (selectedPaymentMethod.value === 'THE_TIN_DUNG' && !isCardFormValid.value) {
    toast.show('Vui lòng điền đầy đủ thông tin thẻ tín dụng', 'error');
    return;
  }
  isPaymentSubmitting.value = true;
  try {
    const res = await api.post(`/borrowing/receipts/${paymentReceipt.value._id}/pay`, {
      maGiamGia: appliedDiscount.value ? appliedDiscount.value.discountCode?.maCode : '',
      phuongThucThanhToan: selectedPaymentMethod.value
    });
    if (res.success) {
      toast.show('Thanh toán thành công! Trạng thái phiếu đã chuyển sang Đã trả.', 'success');
      isPaymentModalOpen.value = false;
      loadData();
    }
  } catch (error) {
    toast.show(error.message || 'Thanh toán thất bại', 'error');
  } finally {
    isPaymentSubmitting.value = false;
  }
};

const getVietQrUrl = (amount, maPhieu) => {
  const bankId = 'MB';
  const accountNo = '0339569696';
  const addInfo = encodeURIComponent(`Thanh toan phieu muon ${maPhieu}`);
  return `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${addInfo}`;
};

const activeSubs = ref([]);
const receipts = ref([]);
const penalties = ref([]);
const myFinancials = ref({
  tongPhiMuon: 0,
  soPhieuDaTra: 0,
  phiMuonDangXuLy: 0,
  soPhieuDangXuLyPhi: 0,
  tongTienPhat: 0,
  tienPhatDaTra: 0,
  tienPhatChuaTra: 0,
  doanhThuHoiVien: 0,
  soGoiDaMua: 0,
  tongTienCoc: 0,
  soPhieuDangMuon: 0,
  tongDaChi: 0,
  soSachDaMuon: 0,
  borrowRank: null,
  totalRankedReaders: 0,
  previousRankBookCount: null
});
const renewLoading = ref(false);
const activeTab = ref('loans');
const borrowSearchQuery = ref('');
const borrowStatusFilter = ref('');
const borrowReturnFilter = ref('');
const borrowTimeFilter = ref('');

const getPlanScore = (plan) => {
  if (!plan) return 0;
  return (plan.giaTien || 0) * 1000000 +
    (plan.soSachToiDa || 0) * 1000 +
    (plan.soNgayMuonToiDa || 0) * 100 +
    (plan.mienTienCoc ? 50 : 0) +
    (plan.choPhepGiaHanOnline ? 30 : 0);
};

const isStandardPlan = (plan) => (plan?.tenGoi || '').toLowerCase().normalize('NFC').includes('tiêu chuẩn');

const bestActiveSub = computed(() => {
  return [...activeSubs.value]
    .filter(sub => sub.trangThai === 'DANG_HIEU_LUC' && sub.goiDocGia)
    .sort((a, b) => getPlanScore(b.goiDocGia) - getPlanScore(a.goiDocGia))[0] || null;
});

const activeSub = computed(() => {
  return bestActiveSub.value;
});

const cardAutoRenewSub = computed(() => {
  return activeSubs.value.find(sub => sub.phuongThucThanhToan === 'THE_TIN_DUNG' && sub.trangThai === 'DANG_HIEU_LUC') || null;
});

const tabs = [
  { label: 'Lịch sử mượn', value: 'loans' },
  { label: 'Tài chính', value: 'financial' },
  { label: 'Phiếu phạt', value: 'penalties' }
];

const profileStats = computed(() => {
  const activeLoans = receipts.value.filter(r => ['DANG_MUON', 'QUA_HAN', 'SAN_SANG'].includes(r.trangThai)).length;
  const overdue = receipts.value.filter(r => r.trangThai === 'QUA_HAN').length;
  const unpaidFine = penalties.value.filter(p => !p.daThanhToan).reduce((sum, p) => sum + (p.soTienPhat || 0), 0);
  const borrowRank = myFinancials.value.borrowRank;
  const totalRankedReaders = myFinancials.value.totalRankedReaders || 0;
  const borrowedBooks = myFinancials.value.soSachDaMuon || 0;
  const previousRankBookCount = myFinancials.value.previousRankBookCount;
  const borrowRankCaption = borrowedBooks === 0
    ? 'Chưa phát sinh lượt mượn'
    : (borrowRank === 1
      ? `Bạn đang dẫn đầu với ${borrowedBooks} cuốn`
      : `Bạn: ${borrowedBooks} cuốn · Hạng trên: ${previousRankBookCount || 0} cuốn`);
  return [
    { label: 'Phiếu đang xử lý', value: activeLoans, caption: overdue > 0 ? `${overdue} phiếu quá hạn` : 'Không có quá hạn', tone: overdue > 0 ? 'text-red-600' : 'text-emerald-600' },
    { label: 'Tổng phiếu mượn', value: receipts.value.length, caption: 'Toàn bộ lịch sử', tone: 'text-slate-500' },
    { label: 'Phạt chưa trả', value: formatCurrency(unpaidFine), caption: unpaidFine > 0 ? 'Cần thanh toán' : 'Đã hoàn tất', tone: unpaidFine > 0 ? 'text-red-600' : 'text-emerald-600' },
    {
      label: 'Xếp hạng mượn sách',
      value: borrowRank ? `#${borrowRank}` : 'Chưa xếp hạng',
      caption: totalRankedReaders > 0 ? `${borrowRankCaption} / ${totalRankedReaders} độc giả` : borrowRankCaption,
      tone: borrowRank ? 'text-primary' : 'text-slate-500'
    }
  ];
});

const hasBorrowFilters = computed(() => {
  return !!(borrowSearchQuery.value.trim() || borrowStatusFilter.value || borrowReturnFilter.value || borrowTimeFilter.value);
});

const isReceiptInTimeRange = (receipt) => {
  if (!borrowTimeFilter.value) return true;
  const borrowedAt = receipt.ngayMuon ? new Date(receipt.ngayMuon) : null;
  if (!borrowedAt || Number.isNaN(borrowedAt.getTime())) return false;

  const now = new Date();
  if (borrowTimeFilter.value === '7d') return borrowedAt >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (borrowTimeFilter.value === '30d') return borrowedAt >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  if (borrowTimeFilter.value === 'this_month') return borrowedAt.getFullYear() === now.getFullYear() && borrowedAt.getMonth() === now.getMonth();
  if (borrowTimeFilter.value === 'this_year') return borrowedAt.getFullYear() === now.getFullYear();
  return true;
};

const receiptMatchesReturnFilter = (receipt) => {
  if (!borrowReturnFilter.value) return true;
  const details = receipt.chiTietMuon || [];
  const hasUnreturned = details.some(item => !item.daTraChua);
  const allReturned = details.length > 0 && details.every(item => item.daTraChua);
  const hasLate = details.some(item => item.daTraChua && item.ngayTraThucTe && new Date(item.ngayTraThucTe) > new Date(receipt.ngayHenTra));

  if (borrowReturnFilter.value === 'has_unreturned') return hasUnreturned;
  if (borrowReturnFilter.value === 'all_returned') return allReturned;
  if (borrowReturnFilter.value === 'has_late') return hasLate;
  return true;
};

const filteredReceipts = computed(() => {
  const keyword = borrowSearchQuery.value.trim().toLowerCase();
  return receipts.value.filter((receipt) => {
    const matchStatus = !borrowStatusFilter.value || receipt.trangThai === borrowStatusFilter.value;
    const matchTime = isReceiptInTimeRange(receipt);
    const matchReturn = receiptMatchesReturnFilter(receipt);
    let matchKeyword = true;

    if (keyword) {
      const books = (receipt.chiTietMuon || []).map(item => [
        item.sach?.dauSach?.tenSach,
        item.sach?.maSach,
        item.sach?.viTriKe
      ].filter(Boolean).join(' ')).join(' ');
      const searchable = [receipt.maPhieu, books].filter(Boolean).join(' ').toLowerCase();
      matchKeyword = searchable.includes(keyword);
    }

    return matchStatus && matchTime && matchReturn && matchKeyword;
  });
});

const resetBorrowFilters = () => {
  borrowSearchQuery.value = '';
  borrowStatusFilter.value = '';
  borrowReturnFilter.value = '';
  borrowTimeFilter.value = '';
};

const cancelSubscription = async () => {
  const ok = await confirmModal.value.ask({
    title: 'Xác nhận hủy tự động gia hạn',
    message: 'Bạn có chắc chắn muốn hủy tự động gia hạn cho gói dịch vụ này? Gói vẫn sẽ hoạt động cho đến ngày hết hạn và không tự động trừ tiền kỳ tiếp theo.',
    confirmText: 'Hủy gia hạn',
    cancelText: 'Quay lại'
  });
  if (!ok) return;

  renewLoading.value = true;
  try {
    const res = await api.post('/memberships/cancel-auto-renew');
    if (res.success) {
      toast.show('Đã hủy tự động gia hạn thành công! Gói hội viên của bạn sẽ hết hạn khi tới hạn.', 'success');
      await loadData();
    }
  } catch (error) {
    toast.show(error.message || 'Có lỗi xảy ra khi hủy gia hạn.', 'error');
  } finally {
    renewLoading.value = false;
  }
};

const enableAutoRenew = async () => {
  const ok = await confirmModal.value.ask({
    title: 'Bật lại tự động gia hạn',
    message: 'Bạn muốn bật lại tự động gia hạn cho gói hội viên hiện tại? Hệ thống sẽ dùng thông tin thẻ đã lưu để gia hạn khi đến hạn.',
    confirmText: 'Bật lại',
    cancelText: 'Quay lại'
  });
  if (!ok) return;

  renewLoading.value = true;
  try {
    const res = await api.post('/memberships/enable-auto-renew');
    if (res.success) {
      toast.show('Đã bật lại tự động gia hạn thành công!', 'success');
      await loadData();
    }
  } catch (error) {
    toast.show(error.message || 'Có lỗi xảy ra khi bật lại tự động gia hạn.', 'error');
  } finally {
    renewLoading.value = false;
  }
};

const getImageUrl = (path) => {
  if (!path) return '/placeholder_book.png';
  if (path.startsWith('http') || path.startsWith('data:image')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `http://localhost:3000${cleanPath}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

const formatCurrency = (val) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
};

const getSubscriptionBaseAmount = (sub) => {
  return sub?.giaGoc ?? sub?.goiDocGia?.giaTien ?? sub?.tongTien ?? 0;
};

const getSubscriptionPaidAmount = (sub) => {
  return sub?.tongTienThanhToan ?? sub?.tongTien ?? getSubscriptionBaseAmount(sub);
};

const getReceiptStatusText = (status) => {
  const map = {
    'CHO_DUYET': 'Chờ duyệt',
    'SAN_SANG': 'Sẵn sàng lấy sách',
    'DANG_MUON': 'Đang mượn',
    'CHO_THANH_TOAN': 'Chờ thanh toán',
    'DA_TRA': 'Đã trả sách',
    'QUA_HAN': 'Quá hạn trả',
    'HUY': 'Đã hủy'
  };
  return map[status] || status;
};

const getReceiptStatusClass = (status) => {
  const map = {
    'CHO_DUYET': 'bg-slate-100 text-slate-700',
    'SAN_SANG': 'bg-amber-100 text-amber-700',
    'DANG_MUON': 'bg-primary-light text-primary-dark',
    'CHO_THANH_TOAN': 'bg-blue-100 text-blue-700 border border-blue-200',
    'DA_TRA': 'bg-green-100 text-green-700',
    'QUA_HAN': 'bg-red-100 text-red-700',
    'HUY': 'bg-red-50 text-red-400'
  };
  return map[status] || 'bg-slate-100';
};

const payPenalty = async (ticket) => {
  const ok = await confirmModal.value.ask({
    title: 'Xác nhận thanh toán phạt',
    message: `Bạn muốn thực hiện mô phỏng thanh toán số tiền ${formatCurrency(ticket.soTienPhat)} cho phiếu phạt ${ticket.maPhieuPhat}?`,
    confirmText: 'Mô phỏng thanh toán',
    cancelText: 'Hủy bỏ'
  });
  if (!ok) return;

  try {
    const res = await api.post(`/borrowing/penalties/${ticket._id}/pay`);
    if (res.success) {
      toast.show('Thanh toán tiền phạt thành công!', 'success');
      loadData();
    }
  } catch (error) {
    toast.show(error.message || 'Lỗi khi thanh toán phạt', 'error');
  }
};

const cancelBorrow = async (receipt) => {
  const ok = await confirmModal.value.ask({
    title: 'Xác nhận hủy phiếu mượn',
    message: `Bạn có chắc chắn muốn hủy phiếu mượn ${receipt.maPhieu}? Sách đã đăng ký mượn sẽ được giải phóng.`,
    confirmText: 'Xác nhận hủy',
    cancelText: 'Quay lại'
  });
  if (!ok) return;

  try {
    const res = await api.post(`/borrowing/receipts/${receipt._id}/cancel`);
    if (res.success) {
      toast.show('Đã hủy phiếu mượn thành công!', 'success');
      loadData();
    }
  } catch (error) {
    toast.show(error.message || 'Lỗi khi hủy phiếu mượn', 'error');
  }
};

const loadData = async () => {
  try {
    const [subResult, receiptResult, penaltyResult, financialResult] = await Promise.allSettled([
      api.get('/memberships/my-subscriptions'),
      api.get('/borrowing/my-receipts'),
      api.get('/borrowing/my-penalties'),
      api.get('/borrowing/my-financial-stats')
    ]);

    const subRes = subResult.status === 'fulfilled' ? subResult.value : null;
    const receiptRes = receiptResult.status === 'fulfilled' ? receiptResult.value : null;
    const penaltyRes = penaltyResult.status === 'fulfilled' ? penaltyResult.value : null;
    const financialRes = financialResult.status === 'fulfilled' ? financialResult.value : null;
    
    if (subRes?.success) {
      const rawSubs = (subRes.data || []).filter(s => s.trangThai === 'DANG_HIEU_LUC' && s.goiDocGia);
      const hasOtherPlan = rawSubs.some(s => !isStandardPlan(s.goiDocGia));
      if (hasOtherPlan) {
        activeSubs.value = rawSubs.filter(s => !isStandardPlan(s.goiDocGia));
      } else {
        activeSubs.value = rawSubs;
      }
    } else {
      activeSubs.value = [];
    }
    if (receiptRes?.success) {
      receipts.value = receiptRes.data;
    }
    if (penaltyRes?.success) {
      penalties.value = penaltyRes.data;
    }
    if (financialRes?.success) {
      myFinancials.value = financialRes.data;
    }
  } catch (error) {
    console.error('Profile load error:', error);
  }
};

onMounted(() => {
  loadData();
});
</script>
