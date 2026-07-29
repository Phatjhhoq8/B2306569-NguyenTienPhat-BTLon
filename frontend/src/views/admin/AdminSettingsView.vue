<template>
  <div class="space-y-12">
    <!-- Tab selector -->
    <div class="flex bg-white p-1 rounded-2xl border border-slate-200 w-full sm:w-[580px] shadow-sm">
      <button 
        @click="activeTab = 'plans'"
        class="flex-1 text-center py-2 text-xs font-bold rounded-xl transition-all"
        :class="activeTab === 'plans' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'"
      >
        Gói hội viên
      </button>
      <button 
        @click="activeTab = 'subscriptions'"
        class="flex-1 text-center py-2 text-xs font-bold rounded-xl transition-all"
        :class="activeTab === 'subscriptions' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'"
      >
        Thống kê &amp; Đăng ký
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
        <div class="space-y-1.5">
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

      <!-- Tab Phân loại Gói hội viên -->
      <div class="flex space-x-2 bg-slate-50 p-1 rounded-2xl border border-slate-200 w-full sm:w-80 shadow-inner">
        <button 
          @click="adminPlansTab = 'INDIVIDUAL'"
          class="flex-1 text-center py-2 text-xs font-bold rounded-xl transition-all"
          :class="adminPlansTab === 'INDIVIDUAL' ? 'bg-primary text-white shadow-sm' : 'text-slate-650 hover:text-slate-900'"
        >
          Cá nhân (Individual)
        </button>
        <button 
          @click="adminPlansTab = 'TEAM'"
          class="flex-1 text-center py-2 text-xs font-bold rounded-xl transition-all"
          :class="adminPlansTab === 'TEAM' ? 'bg-primary text-white shadow-sm' : 'text-slate-650 hover:text-slate-900'"
        >
          Nhóm & Business (Team)
        </button>
      </div>

      <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <th class="pb-3">Tên gói</th>
              <th class="pb-3">Mã gói</th>
              <th class="pb-3">Phân loại</th>
              <th class="pb-3">Giá tiền</th>
              <th class="pb-3">Thời hạn sử dụng</th>
              <th class="pb-3 text-center">Sách tối đa</th>
              <th class="pb-3 text-center">Ngày mượn tối đa</th>
              <th class="pb-3 text-center">Phí mượn</th>
              <th class="pb-3 text-center">Tiền cọc</th>
              <th class="pb-3 text-center">Phạt trễ/ngày</th>
              <th class="pb-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50 text-sm font-medium text-slate-700">
            <tr v-for="plan in filteredPlansForAdmin" :key="plan._id" class="hover:bg-slate-50/55 transition-colors">
              <td class="py-4 font-bold text-slate-955 flex items-center gap-1.5">
                {{ plan.tenGoi }}
                <span v-if="plan.khuyenDung" class="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  Khuyên dùng
                </span>
              </td>
              <td class="py-4 font-mono text-xs text-slate-400">{{ plan.maGoi }}</td>
              <td class="py-4 text-xs">
                <span class="px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide text-[9px]" :class="plan.loaiGoi === 'TEAM' ? 'bg-indigo-50 text-indigo-650' : 'bg-slate-100 text-slate-600'">
                  {{ plan.loaiGoi === 'TEAM' ? 'Nhóm & Gia đình' : 'Cá nhân' }}
                </span>
              </td>
              <td class="py-4">{{ formatCurrency(plan.giaTien) }}</td>
              <td class="py-4">
                <span v-if="plan.giaTien > 0 && plan.soNgayHieuLuc !== 99999">{{ plan.soNgayHieuLuc }} ngày</span>
                <span v-else class="text-slate-400 font-bold italic">Vĩnh viễn</span>
              </td>
              <td class="py-4 text-center font-bold text-slate-800">{{ plan.soSachToiDa }} cuốn</td>
              <td class="py-4 text-center font-bold text-slate-800">{{ plan.soNgayMuonToiDa }} ngày</td>
              <td class="py-4 text-center font-bold text-slate-800">{{ formatCurrency(plan.phiMuonSachGiay) }}</td>
              <td class="py-4 text-center font-bold text-slate-800">{{ formatCurrency(plan.tienDatCoc) }}</td>
              <td class="py-4 text-center font-bold text-red-500">{{ formatCurrency(plan.phiPhatTreHan) }}</td>
              <td class="py-4 text-right space-x-2">
                <button @click="editPlan(plan)" class="text-xs font-bold text-primary hover:underline">Sửa</button>
                <button @click="deletePlan(plan._id)" class="text-xs font-bold text-red-600 hover:text-red-800 transition-colors">Xóa</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- ==================== THỐNG KÊ & ĐĂNG KÝ GÓI ==================== -->
    <section v-if="activeTab === 'subscriptions'" class="space-y-8">
      <div class="border-b pb-3 space-y-1.5">
        <h2 class="font-sans text-2xl font-extrabold text-slate-900">Thống Kê &amp; Lịch Sử Đăng Ký</h2>
        <p class="text-sm text-slate-500 font-medium">Theo dõi doanh thu, mức độ phổ biến của gói và hoạt động của độc giả</p>
      </div>

      <!-- Overview Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div class="space-y-1">
            <span class="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Tổng doanh thu gói</span>
            <p class="text-2xl font-black text-primary">{{ formatCurrency(totalRevenue) }}</p>
          </div>
          <div class="h-11 w-11 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center">
            <Award class="h-5.5 w-5.5" />
          </div>
        </div>
        
        <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div class="space-y-1">
            <span class="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Lượt đăng ký Premium</span>
            <p class="text-2xl font-black text-slate-900">{{ premiumSubCount }}</p>
          </div>
          <div class="h-11 w-11 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
            <Users class="h-5.5 w-5.5" />
          </div>
        </div>

        <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div class="space-y-1">
            <span class="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Sách hội viên đã mượn</span>
            <p class="text-2xl font-black text-slate-900">{{ vipBorrowedBooksCount }} cuốn</p>
          </div>
          <div class="h-11 w-11 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <BookMarked class="h-5.5 w-5.5" />
          </div>
        </div>

        <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div class="space-y-1">
            <span class="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Đang gia hạn qua Thẻ</span>
            <p class="text-2xl font-black text-slate-900">{{ activeCardAutoRenewCount }}</p>
          </div>
          <div class="h-11 w-11 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center">
            <CreditCard class="h-5.5 w-5.5" />
          </div>
        </div>
      </div>

      <!-- Split Layout: Left is Package Popularity, Right is Top Books -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Popularity Table (7/12) -->
        <div class="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col">
          <h3 class="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0">
            <Award class="h-4.5 w-4.5 text-primary" /> Xếp hạng độ phổ biến của gói
          </h3>
          <div class="overflow-x-auto overflow-y-auto max-h-[380px] flex-grow pr-1">
            <table class="w-full text-left border-collapse text-xs font-semibold text-slate-650">
              <thead class="sticky top-0 bg-white z-10">
                <tr class="border-b border-slate-100 text-slate-400 uppercase tracking-wider">
                  <th class="pb-2.5 bg-white">Tên gói cước</th>
                  <th class="pb-2.5 text-center bg-white">Lượt đăng ký</th>
                  <th class="pb-2.5 text-right bg-white">Doanh thu cước</th>
                  <th class="pb-2.5 text-right bg-white">Sách đã mượn</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr v-for="item in planPopularity" :key="item.name" class="hover:bg-slate-50/50">
                  <td class="py-3 font-bold text-slate-900">{{ item.name }}</td>
                  <td class="py-3 text-center text-slate-800 font-bold">{{ item.count }} lượt</td>
                  <td class="py-3 text-right text-emerald-600 font-bold">{{ formatCurrency(item.revenue) }}</td>
                  <td class="py-3 text-right text-slate-800 font-bold">{{ item.booksCount }} cuốn</td>
                </tr>
                <tr v-if="planPopularity.length === 0">
                  <td colspan="4" class="py-8 text-center text-slate-400">Chưa có số liệu thống kê gói.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Top Books Borrowed by Members (5/12) -->
        <div class="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col">
          <div class="flex flex-col space-y-3 flex-shrink-0">
            <h3 class="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <BookMarked class="h-4.5 w-4.5 text-primary" /> Xếp hạng sách hội viên
            </h3>
            
            <!-- 3 Tabs để cô lập -->
            <div class="flex bg-slate-50 p-0.5 rounded-xl border border-slate-200">
              <button 
                @click="activeTopBookTab = 'borrow'"
                class="flex-1 text-[10px] font-bold py-1.5 rounded-lg transition-all"
                :class="activeTopBookTab === 'borrow' ? 'bg-primary text-white shadow-sm' : 'text-slate-650 hover:text-slate-900'"
              >
                Mượn nhiều
              </button>
              <button 
                @click="activeTopBookTab = 'ratingCount'"
                class="flex-1 text-[10px] font-bold py-1.5 rounded-lg transition-all"
                :class="activeTopBookTab === 'ratingCount' ? 'bg-primary text-white shadow-sm' : 'text-slate-650 hover:text-slate-900'"
              >
                Đánh giá nhiều
              </button>
              <button 
                @click="activeTopBookTab = 'rating'"
                class="flex-1 text-[10px] font-bold py-1.5 rounded-lg transition-all"
                :class="activeTopBookTab === 'rating' ? 'bg-primary text-white shadow-sm' : 'text-slate-650 hover:text-slate-900'"
              >
                Điểm cao nhất
              </button>
            </div>
          </div>

          <div class="overflow-y-auto max-h-[380px] flex-grow pr-1 space-y-3">
            <div 
              v-for="(book, index) in displayedTopBooks" 
              :key="book._id"
              class="flex items-start space-x-3 bg-slate-50 p-3 rounded-2xl border border-slate-150 relative hover:shadow-md transition-all duration-200"
            >
              <!-- Rank -->
              <span class="text-xs font-black text-slate-400 w-5 text-center mt-0.5">#{{ index + 1 }}</span>
              
              <!-- Book Info -->
              <div class="flex-grow min-w-0">
                <span class="text-xs font-bold text-slate-900 truncate block">{{ book.title }}</span>
                <span class="text-[10px] text-slate-450 font-semibold block mb-1">Tác giả: {{ book.author }}</span>
                
                <!-- Sub info -->
                <div class="flex items-center space-x-2 text-[10px] text-slate-500">
                  <template v-if="book.ratingCount > 0">
                    <span class="flex items-center text-amber-500 font-bold" v-if="activeTopBookTab !== 'rating'">
                      ★ <span class="ml-0.5">{{ book.rating }}</span>
                    </span>
                    <span class="text-slate-300" v-if="activeTopBookTab !== 'rating' && activeTopBookTab !== 'ratingCount'">|</span>
                    <span class="font-semibold" v-if="activeTopBookTab === 'borrow'">{{ book.ratingCount }} đánh giá</span>
                    <span class="font-semibold text-primary-dark" v-if="activeTopBookTab === 'ratingCount'">★ {{ book.rating }} sao trung bình</span>
                    <span class="font-semibold text-primary-dark" v-if="activeTopBookTab === 'rating'">{{ book.count }} lượt mượn</span>
                    <span class="text-slate-300" v-if="activeTopBookTab === 'rating'">|</span>
                    <span class="font-semibold" v-if="activeTopBookTab === 'rating'">{{ book.ratingCount }} đánh giá</span>
                  </template>
                  <template v-else>
                    <span class="text-slate-400 font-medium italic">Chưa có đánh giá</span>
                    <span class="text-slate-300" v-if="activeTopBookTab === 'rating'">|</span>
                    <span class="font-semibold text-primary-dark" v-if="activeTopBookTab === 'rating'">{{ book.count }} lượt mượn</span>
                  </template>
                </div>
              </div>

              <!-- Action badge (Dynamic based on Tab) -->
              <span 
                v-if="activeTopBookTab === 'borrow'"
                class="text-[10px] font-bold bg-primary-light text-primary px-2.5 py-1 rounded-full whitespace-nowrap self-center"
              >
                {{ book.count }} lượt mượn
              </span>
              <span 
                v-else-if="activeTopBookTab === 'ratingCount'"
                class="text-[10px] font-bold bg-indigo-50 text-indigo-750 px-2.5 py-1 rounded-full whitespace-nowrap self-center"
              >
                {{ book.ratingCount }} đánh giá
              </span>
              <span 
                v-else
                class="text-[10px] font-bold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full whitespace-nowrap self-center"
              >
                ★ {{ book.rating }} sao
              </span>
            </div>
            <div v-if="displayedTopBooks.length === 0" class="text-center py-8 text-xs text-slate-400">
              Chưa có dữ liệu sách.
            </div>
          </div>
        </div>
      </div>

      <!-- Detail Subscription Table with Filters -->
      <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
          <h3 class="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Danh sách độc giả đăng ký</h3>
          
          <!-- Filters -->
          <div class="flex flex-wrap items-center gap-3">
            <input 
              v-model="searchSubQuery" 
              type="text" 
              placeholder="Tìm độc giả, mã đăng ký..." 
              class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none w-52"
            />
            
            <select v-model="filterPlan" class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none">
              <option value="">Tất cả các gói</option>
              <option v-for="plan in plans" :key="plan._id" :value="plan._id">{{ plan.tenGoi }}</option>
            </select>
            
            <select v-model="filterStatus" class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none">
              <option value="">Tất cả trạng thái</option>
              <option value="DANG_HIEU_LUC">Đang hiệu lực</option>
              <option value="HET_HAN">Hết hạn</option>
              <option value="HUY">Đã hủy</option>
            </select>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs font-semibold text-slate-700">
            <thead>
              <tr class="border-b border-slate-100 text-slate-400 uppercase tracking-wider">
                <th class="pb-3">Mã Đăng ký</th>
                <th class="pb-3">Độc giả</th>
                <th class="pb-3">Gói cước</th>
                <th class="pb-3">Số tiền</th>
                <th class="pb-3">Thanh toán</th>
                <th class="pb-3">Thời hạn sử dụng</th>
                <th class="pb-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="sub in filteredSubscriptions" :key="sub._id" class="hover:bg-slate-50/50">
                <td class="py-4 font-mono text-slate-900">{{ sub.maDangKy }}</td>
                <td class="py-4">
                  <span class="font-bold text-slate-900 block">{{ sub.docGia?.hoLot }} {{ sub.docGia?.ten }}</span>
                  <span class="text-[10px] text-slate-450 block font-mono">Mã: {{ sub.docGia?.maDocGia || sub.docGia?._id }}</span>
                </td>
                <td class="py-4 font-bold">{{ sub.goiDocGia?.tenGoi || 'Standard' }}</td>
                <td class="py-4 font-bold text-primary">{{ formatCurrency(sub.tongTien) }}</td>
                <td class="py-4">
                  <span class="block">{{ sub.phuongThucThanhToan === 'THE_TIN_DUNG' ? 'Thẻ tín dụng' : 'VietQR' }}</span>
                  <span v-if="sub.phuongThucThanhToan === 'THE_TIN_DUNG'" class="text-[9px] text-slate-450 block">
                    Gia hạn: {{ sub.tuDongGiaHan ? 'Bật' : 'Tắt' }}
                  </span>
                </td>
                <td class="py-4 text-slate-500 font-medium">
                  {{ formatDate(sub.ngayBatDau) }} - {{ formatDate(sub.ngayKetThuc) }}
                </td>
                <td class="py-4">
                  <span 
                    class="text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase"
                    :class="[
                      sub.trangThai === 'DANG_HIEU_LUC' ? 'bg-green-100 text-green-700' :
                      sub.trangThai === 'HUY' ? 'bg-red-50 text-red-500' :
                      'bg-slate-100 text-slate-500'
                    ]"
                  >
                    {{ sub.trangThai === 'DANG_HIEU_LUC' ? 'Đang hiệu lực' : sub.trangThai === 'HUY' ? 'Đã hủy' : 'Hết hạn' }}
                  </span>
                </td>
              </tr>
              <tr v-if="filteredSubscriptions.length === 0">
                <td colspan="7" class="py-12 text-center text-slate-450 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  Không tìm thấy đăng ký gói nào khớp với bộ lọc.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- ==================== MÃ GIẢM GIÁ ==================== -->
    <section v-if="activeTab === 'discounts'" class="space-y-6">
      <div class="flex justify-between items-center border-b pb-3">
        <div class="space-y-1.5">
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
              <th class="pb-3">Áp dụng cho</th>
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
              <td class="py-4">
                <span class="text-[10px] font-extrabold px-2 py-1 rounded-full" :class="code.apDungCho === 'GOI_HOI_VIEN' ? 'bg-primary-light text-primary' : 'bg-amber-50 text-amber-700'">
                  {{ getDiscountScopeLabel(code.apDungCho) }}
                </span>
              </td>
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
        <div class="space-y-1.5">
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
              <div class="flex justify-end pt-4 border-t border-slate-100">
                <button type="submit" class="bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md text-xs">
                  Lưu cấu hình trang chủ
                </button>
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
              <div class="flex justify-end pt-4 border-t border-slate-100">
                <button type="submit" class="bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md text-xs">
                  Lưu cấu hình trang chủ
                </button>
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
              <div class="flex justify-end pt-4 border-t border-slate-100">
                <button type="submit" class="bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md text-xs">
                  Lưu cấu hình trang chủ
                </button>
              </div>
            </div>
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
              <div class="flex justify-end pt-4 border-t border-slate-100">
                <button type="submit" class="bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md text-xs">
                  Lưu cấu hình trang giới thiệu
                </button>
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
              <div class="flex justify-end pt-4 border-t border-slate-100">
                <button type="submit" class="bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md text-xs">
                  Lưu cấu hình trang giới thiệu
                </button>
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
              <div class="flex justify-end pt-4 border-t border-slate-100">
                <button type="submit" class="bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md text-xs">
                  Lưu cấu hình trang giới thiệu
                </button>
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
              <div class="flex justify-end pt-4 border-t border-slate-100">
                <button type="submit" class="bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md text-xs">
                  Lưu cấu hình trang giới thiệu
                </button>
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
              <div class="flex justify-end pt-4 border-t border-slate-100">
                <button type="submit" class="bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md text-xs">
                  Lưu cấu hình trang giới thiệu
                </button>
              </div>
            </div>
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
              <div class="flex justify-end pt-4 border-t border-slate-100">
                <button type="submit" class="bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md text-xs">
                  Lưu cấu hình gói hội viên
                </button>
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
              <div class="flex justify-end pt-4 border-t border-slate-100">
                <button type="submit" class="bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md text-xs">
                  Lưu cấu hình gói hội viên
                </button>
              </div>
            </div>
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
              <div class="flex justify-end pt-4 border-t border-slate-100">
                <button type="submit" class="bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md text-xs">
                  Lưu cấu hình trang liên hệ
                </button>
              </div>
            </div>
          </div>
 
          <!-- Section 2: Headquarters Info -->
          <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div 
              @click="toggleSection('contact_info')" 
              class="flex justify-between items-center bg-slate-50/70 px-6 py-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-all select-none"
            >
              <h3 class="font-sans font-bold text-slate-800 text-xs uppercase">Phần 2: Thông tin Trụ sở chính (Headquarters)</h3>
              <ChevronDown 
                :class="collapsedSections.contact_info ? '' : 'rotate-180'" 
                class="h-4 w-4 text-slate-400 transition-transform duration-200" 
              />
            </div>
            <div v-show="!collapsedSections.contact_info" class="p-6 md:p-8 space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-600 uppercase">Tên đơn vị thư viện (Trụ sở chính)</label>
                  <input v-model="contactpageForm.libraryName" type="text" required class="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none font-bold" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-600 uppercase">Địa chỉ chi tiết Trụ sở chính</label>
                  <input v-model="contactpageForm.address" type="text" required class="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-600 uppercase">Số điện thoại Hotline Trụ sở chính</label>
                  <input v-model="contactpageForm.hotline" type="text" required class="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-600 uppercase">Địa chỉ Email Trụ sở chính</label>
                  <input v-model="contactpageForm.email" type="email" required class="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none" />
                </div>
              </div>
              <div class="flex justify-end pt-4 border-t border-slate-100">
                <button type="submit" class="bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md text-xs">
                  Lưu cấu hình trang liên hệ
                </button>
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
              <div class="flex justify-end pt-4 border-t border-slate-100">
                <button type="submit" class="bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md text-xs">
                  Lưu cấu hình trang liên hệ
                </button>
              </div>
            </div>
          </div>
 
          <!-- Section 4: Branches Info -->
          <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div 
              @click="toggleSection('contact_branches')" 
              class="flex justify-between items-center bg-slate-50/70 px-6 py-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-all select-none"
            >
              <h3 class="font-sans font-bold text-slate-800 text-xs uppercase">Phần 4: Danh sách chi nhánh bổ sung</h3>
              <ChevronDown 
                :class="collapsedSections.contact_branches ? '' : 'rotate-180'" 
                class="h-4 w-4 text-slate-400 transition-transform duration-200" 
              />
            </div>
            <div v-show="!collapsedSections.contact_branches" class="p-6 md:p-8 space-y-6">
              <div class="flex justify-between items-center">
                <span class="text-xs font-bold text-slate-500 uppercase">Danh sách chi nhánh phụ</span>
                <button 
                  type="button" 
                  @click="addBranch" 
                  class="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-xl shadow-sm text-[10px] transition-all flex items-center space-x-1"
                >
                  <Plus class="h-3.5 w-3.5" />
                  <span>Thêm chi nhánh mới</span>
                </button>
              </div>
 
              <div v-if="!contactpageForm.branches || contactpageForm.branches.length === 0" class="text-center py-6 text-slate-400 text-xs font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Chưa có chi nhánh bổ sung nào. Hãy bấm "Thêm chi nhánh mới" để thêm.
              </div>
 
              <div v-else class="space-y-6">
                <div 
                  v-for="(branch, index) in contactpageForm.branches" 
                  :key="index"
                  class="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative group/item"
                >
                  <button 
                    type="button" 
                    @click="removeBranch(index)" 
                    class="absolute top-4 right-4 bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-xl transition-all"
                    title="Xóa chi nhánh"
                  >
                    <Trash2 class="h-4 w-4" />
                  </button>
 
                  <h4 class="text-xs font-extrabold text-primary uppercase mb-4">Chi nhánh #{{ index + 1 }}</h4>
 
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div class="space-y-1">
                      <label class="font-bold text-slate-600 uppercase">Tên chi nhánh</label>
                      <input v-model="branch.name" type="text" required class="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 focus:outline-none font-bold" />
                    </div>
                    <div class="space-y-1">
                      <label class="font-bold text-slate-600 uppercase">Địa chỉ chi tiết</label>
                      <input v-model="branch.address" type="text" required class="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" />
                    </div>
                    <div class="space-y-1">
                      <label class="font-bold text-slate-600 uppercase">Số điện thoại Hotline</label>
                      <input v-model="branch.hotline" type="text" required class="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" />
                    </div>
                    <div class="space-y-1">
                      <label class="font-bold text-slate-600 uppercase">Địa chỉ Email</label>
                      <input v-model="branch.email" type="email" required class="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" />
                    </div>
                    <div class="space-y-1 md:col-span-2">
                      <label class="font-bold text-slate-600 uppercase">Đường dẫn nhúng bản đồ Google Maps (Embed Map Iframe URL)</label>
                      <input v-model="branch.mapUrl" type="text" required class="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 focus:outline-none font-mono text-[10px]" />
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex justify-end pt-4 border-t border-slate-100">
                <button type="submit" class="bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md text-xs">
                  Lưu cấu hình trang liên hệ
                </button>
              </div>
            </div>
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
              <div class="flex justify-between items-center">
                <label class="text-xs font-bold text-slate-600 uppercase">Thời hạn (ngày)</label>
                <label class="inline-flex items-center text-[10px] font-bold text-primary cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    :checked="planForm.soNgayHieuLuc === 99999" 
                    @change="e => planForm.soNgayHieuLuc = e.target.checked ? 99999 : 30"
                    class="h-3 w-3 rounded text-primary focus:ring-primary mr-1"
                  />
                  Vĩnh viễn
                </label>
              </div>
              <input 
                v-model="planForm.soNgayHieuLuc" 
                type="number" 
                required 
                placeholder="30" 
                :disabled="planForm.soNgayHieuLuc === 99999"
                class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none disabled:opacity-60" 
              />
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

          <div class="grid grid-cols-3 gap-4">
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-600 uppercase">Phí mượn sách giấy (VND)</label>
              <input v-model="planForm.phiMuonSachGiay" type="number" required placeholder="5000" class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" />
            </div>
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-600 uppercase">Tiền đặt cọc (VND)</label>
              <input v-model="planForm.tienDatCoc" type="number" required placeholder="100000" class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" />
            </div>
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-600 uppercase">Phạt trễ/ngày (VND)</label>
              <input v-model="planForm.phiPhatTreHan" type="number" required placeholder="5000" class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" />
            </div>
          </div>

          <div class="flex items-center space-x-2 pt-2">
            <input 
              v-model="planForm.mienTienCoc" 
              type="checkbox" 
              id="mienTienCoc"
              class="h-4 w-4 rounded border-slate-355 text-primary focus:ring-primary"
            />
            <label for="mienTienCoc" class="text-xs font-bold text-slate-700 cursor-pointer select-none">
              Miễn phí đặt cọc khi mượn sách giấy (So sánh gói)
            </label>
          </div>

          <div class="flex items-center space-x-2 pt-1">
            <input 
              v-model="planForm.choPhepGiaHanOnline" 
              type="checkbox" 
              id="choPhepGiaHanOnline"
              class="h-4 w-4 rounded border-slate-355 text-primary focus:ring-primary"
            />
            <label for="choPhepGiaHanOnline" class="text-xs font-bold text-slate-700 cursor-pointer select-none">
              Cho phép gia hạn trả sách trực tuyến (Online)
            </label>
          </div>

          <div class="flex items-center space-x-2 pt-1">
            <input 
              v-model="planForm.quayNhanUuTien" 
              type="checkbox" 
              id="quayNhanUuTien"
              class="h-4 w-4 rounded border-slate-355 text-primary focus:ring-primary"
            />
            <label for="quayNhanUuTien" class="text-xs font-bold text-slate-700 cursor-pointer select-none">
              Quầy nhận sách ưu tiên (Không xếp hàng)
            </label>
          </div>

          <div class="flex items-center space-x-2 pt-1">
            <input 
              v-model="planForm.chiaSeNhomGiaDinh" 
              type="checkbox" 
              id="chiaSeNhomGiaDinh"
              class="h-4 w-4 rounded border-slate-355 text-primary focus:ring-primary"
            />
            <label for="chiaSeNhomGiaDinh" class="text-xs font-bold text-slate-700 cursor-pointer select-none">
              Chia sẻ quyền lợi nhóm gia đình (Tối đa 3 thành viên)
            </label>
          </div>

          <div class="flex items-center space-x-2 pt-1">
            <input 
              v-model="planForm.docEbookKhongGioiHan" 
              type="checkbox" 
              id="docEbookKhongGioiHan"
              class="h-4 w-4 rounded border-slate-355 text-primary focus:ring-primary"
            />
            <label for="docEbookKhongGioiHan" class="text-xs font-bold text-slate-700 cursor-pointer select-none">
              Đọc sách điện tử (Ebook) bản quyền không giới hạn
            </label>
          </div>

          <div class="flex items-center space-x-2 pt-1">
            <input 
              v-model="planForm.giaoSachTanNha" 
              type="checkbox" 
              id="giaoSachTanNha"
              class="h-4 w-4 rounded border-slate-355 text-primary focus:ring-primary"
            />
            <label for="giaoSachTanNha" class="text-xs font-bold text-slate-700 cursor-pointer select-none">
              Hỗ trợ dịch vụ giao/trả sách tận nhà miễn phí
            </label>
          </div>

          <div class="flex items-center space-x-2 pt-1">
            <input 
              v-model="planForm.workshopDocQuyen" 
              type="checkbox" 
              id="workshopDocQuyen"
              class="h-4 w-4 rounded border-slate-355 text-primary focus:ring-primary"
            />
            <label for="workshopDocQuyen" class="text-xs font-bold text-slate-700 cursor-pointer select-none">
              Tham gia câu lạc bộ sách &amp; Workshop sự kiện độc quyền
            </label>
          </div>

          <div class="space-y-1 pt-2">
            <label class="text-[10px] font-bold text-slate-500 uppercase">Phân loại gói</label>
            <select v-model="planForm.loaiGoi" class="w-full bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-xs font-semibold text-slate-700">
              <option value="INDIVIDUAL">Cá nhân (Individual)</option>
              <option value="TEAM">Nhóm &amp; Gia định (Team)</option>
            </select>
          </div>

          <!-- Gói khuyên dùng -->
          <div class="flex items-center space-x-2.5 py-1">
            <input 
              v-model="planForm.khuyenDung" 
              type="checkbox" 
              id="planKhuyenDung"
              class="h-4.5 w-4.5 rounded border-slate-350 text-primary focus:ring-primary cursor-pointer" 
            />
            <label for="planKhuyenDung" class="text-xs font-bold text-slate-750 cursor-pointer select-none">
              Gói khuyên dùng (Highlight trên giao diện độc giả)
            </label>
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

          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-600 uppercase">Áp dụng cho</label>
            <select v-model="discountForm.apDungCho" required class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none">
              <option value="MUON_SACH">Mượn sách</option>
              <option value="GOI_HOI_VIEN">Gói hội viên</option>
            </select>
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
import { ref, onMounted, computed } from 'vue';
import api from '../../services/api';
import { X, ChevronDown, Plus, Trash2, Award, Users, BookMarked, CreditCard, Star } from '@lucide/vue';
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
  contact_more: false,
  contact_branches: false
});

const toggleSection = (sectionName) => {
  collapsedSections.value[sectionName] = !collapsedSections.value[sectionName];
};

const plans = ref([]);
const adminPlansTab = ref('INDIVIDUAL');
const filteredPlansForAdmin = computed(() => {
  return plans.value.filter(plan => plan.loaiGoi === adminPlansTab.value);
});

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
  mienTienCoc: true,
  khuyenDung: false,
  phiMuonSachGiay: 0,
  phiPhatTreHan: 2000,
  tienDatCoc: 0
});

const showDiscountModal = ref(false);
const isDiscountEdit = ref(false);
const discountEditId = ref(null);
const discountForm = ref({
  maCode: '',
  tenKhuyenMai: '',
  giaTriGiam: 10000,
  giaTriDonToiThieu: 50000,
  apDungCho: 'MUON_SACH',
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

const getDiscountScopeLabel = (scope) => {
  return scope === 'GOI_HOI_VIEN' ? 'Gói hội viên' : 'Mượn sách';
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
  planForm.value = { 
    tenGoi: '', 
    giaTien: 99000, 
    soNgayHieuLuc: 30, 
    soSachToiDa: 10, 
    soNgayMuonToiDa: 30, 
    mienTienCoc: false,
    choPhepGiaHanOnline: false,
    quayNhanUuTien: false,
    chiaSeNhomGiaDinh: false,
    docEbookKhongGioiHan: false,
    giaoSachTanNha: false,
    workshopDocQuyen: false,
    loaiGoi: 'INDIVIDUAL',
    khuyenDung: false,
    phiMuonSachGiay: 0,
    phiPhatTreHan: 2000,
    tienDatCoc: 0
  };
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
  const ok = await confirmModal.value.ask({ 
    message: 'Bạn có chắc chắn muốn xóa gói hội viên này không?',
    isDestructive: true 
  });
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
    apDungCho: 'MUON_SACH',
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
    apDungCho: code.apDungCho || 'MUON_SACH',
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
  const ok = await confirmModal.value.ask({ 
    message: 'Bạn có chắc chắn muốn xóa mã giảm giá này không?',
    isDestructive: true 
  });
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

const addFaq = () => {
  if (!homepageForm.value.faqs) {
    homepageForm.value.faqs = [];
  }
  homepageForm.value.faqs.push({ question: '', answer: '' });
};

const removeFaq = async (index) => {
  const ok = await confirmModal.value.ask({ 
    message: 'Bạn có chắc chắn muốn xóa câu hỏi thường gặp này không?',
    isDestructive: true
  });
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

const addTeamMember = () => {
  if (!aboutpageForm.value.teamMembers) {
    aboutpageForm.value.teamMembers = [];
  }
  aboutpageForm.value.teamMembers.push({ name: '', role: '', avatarText: 'T', avatar: '' });
};

const removeTeamMember = async (index) => {
  const ok = await confirmModal.value.ask({ 
    message: 'Bạn có chắc chắn muốn xóa thành viên này khỏi ban điều hành không?',
    isDestructive: true
  });
  if (!ok) return;
  aboutpageForm.value.teamMembers.splice(index, 1);
};

const addBranch = () => {
  if (!contactpageForm.value.branches) {
    contactpageForm.value.branches = [];
  }
  contactpageForm.value.branches.push({ name: '', address: '', hotline: '', email: '', mapUrl: '' });
};

const removeBranch = async (index) => {
  const ok = await confirmModal.value.ask({ 
    message: 'Bạn có chắc chắn muốn xóa chi nhánh này không?',
    isDestructive: true
  });
  if (!ok) return;
  contactpageForm.value.branches.splice(index, 1);
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
  moreNote: '',
  branches: []
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
    if (contactRes.success) {
      contactpageForm.value = { branches: [], ...contactRes.data };
      if (!contactpageForm.value.branches) {
        contactpageForm.value.branches = [];
      }
    }
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

const isValidPhoneNumber = (phone) => {
  if (!phone) return false;
  const cleanPhone = phone.trim();
  // Regex hỗ trợ di động VN, số cố định VN, và tổng đài 1900/1800
  const phoneRegex = /^(0\d{1,4}[.\s-]?\d{3,4}[.\s-]?\d{3,4}|(1800|1900)\d{4}|(\+84|0)\d{9,10})$/;
  return phoneRegex.test(cleanPhone);
};

const saveContactpageSettings = async () => {
  // Bắt lỗi số điện thoại Trụ sở chính
  if (!isValidPhoneNumber(contactpageForm.value.hotline)) {
    toast.show('Số điện thoại Hotline Trụ sở chính không hợp lệ! Vui lòng nhập đúng định dạng số điện thoại Việt Nam (ví dụ: 0292 3832 663 hoặc 0912345678).', 'error');
    return;
  }

  // Bắt lỗi số điện thoại các chi nhánh bổ sung
  if (contactpageForm.value.branches && contactpageForm.value.branches.length > 0) {
    for (let i = 0; i < contactpageForm.value.branches.length; i++) {
      const branch = contactpageForm.value.branches[i];
      if (!isValidPhoneNumber(branch.hotline)) {
        toast.show(`Số điện thoại Hotline của Chi nhánh #${i + 1} (${branch.name || 'Chưa đặt tên'}) không hợp lệ! Vui lòng nhập đúng định dạng.`, 'error');
        return;
      }
    }
  }

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

// Subscriptions & Receipts statistics states
const subscriptions = ref([]);
const receipts = ref([]);

const fetchSubscriptions = async () => {
  try {
    const res = await api.get('/memberships/subscriptions');
    if (res.success) {
      subscriptions.value = res.data;
    }
  } catch (error) {
    console.error('Fetch subscriptions error:', error);
  }
};

const fetchReceipts = async () => {
  try {
    const res = await api.get('/borrowing/receipts');
    if (res.success) {
      receipts.value = res.data;
    }
  } catch (error) {
    console.error('Fetch receipts error:', error);
  }
};

const filterPlan = ref('');
const filterStatus = ref('');
const searchSubQuery = ref('');

const filteredSubscriptions = computed(() => {
  return subscriptions.value.filter(sub => {
    const matchPlan = !filterPlan.value || (sub.goiDocGia && sub.goiDocGia._id === filterPlan.value);
    const matchStatus = !filterStatus.value || sub.trangThai === filterStatus.value;
    
    let matchQuery = true;
    if (searchSubQuery.value.trim()) {
      const q = searchSubQuery.value.trim().toLowerCase();
      const hoTen = `${sub.docGia?.hoLot || ''} ${sub.docGia?.ten || ''}`.toLowerCase();
      const email = (sub.docGia?.email || '').toLowerCase();
      const maDocGia = (sub.docGia?.maDocGia || sub.docGia?._id || '').toLowerCase();
      const maDangKy = (sub.maDangKy || '').toLowerCase();
      matchQuery = hoTen.includes(q) || email.includes(q) || maDocGia.includes(q) || maDangKy.includes(q);
    }
    
    return matchPlan && matchStatus && matchQuery;
  });
});

// Computed statistics variables
const totalRevenue = computed(() => {
  return subscriptions.value
    .filter(sub => sub.trangThai !== 'HUY' && sub.goiDocGia && sub.goiDocGia.giaTien > 0)
    .reduce((sum, sub) => sum + (sub.tongTien || 0), 0);
});

const premiumSubCount = computed(() => {
  return subscriptions.value.filter(sub => sub.goiDocGia && sub.goiDocGia.giaTien > 0 && sub.trangThai === 'DANG_HIEU_LUC').length;
});

const activeCardAutoRenewCount = computed(() => {
  return subscriptions.value.filter(sub => sub.phuongThucThanhToan === 'THE_TIN_DUNG' && sub.tuDongGiaHan && sub.trangThai === 'DANG_HIEU_LUC').length;
});

const vipReaderIds = computed(() => {
  return subscriptions.value
    .filter(sub => sub.trangThai === 'DANG_HIEU_LUC' && sub.goiDocGia && sub.goiDocGia.giaTien > 0)
    .map(sub => {
      if (!sub.docGia) return null;
      return typeof sub.docGia === 'object' ? sub.docGia._id : sub.docGia;
    })
    .filter(id => id !== null);
});

const vipReceipts = computed(() => {
  const ids = vipReaderIds.value;
  return receipts.value.filter(r => {
    if (!r.docGia) return false;
    const rReaderId = typeof r.docGia === 'object' ? r.docGia._id : r.docGia;
    return ids.includes(rReaderId);
  });
});

const vipBorrowedBooksCount = computed(() => {
  return vipReceipts.value.reduce((sum, r) => {
    return sum + (r.chiTietMuon ? r.chiTietMuon.length : 0);
  }, 0);
});

const topBooksByVip = computed(() => {
  if (realBooks.value.length === 0) return [];
  
  return realBooks.value.map(book => {
    return {
      _id: book._id,
      title: book.tenSach,
      author: book.tacGia ? book.tacGia.map(t => t.tenTacGia || t).join(', ') : 'Chưa rõ',
      count: book.soLuotMuon || 0,
      rating: book.rating !== undefined ? book.rating : 0,
      ratingCount: book.soLuotDanhGia || 0
    };
  });
});

const activeTopBookTab = ref('borrow');
const displayedTopBooks = computed(() => {
  const books = [...topBooksByVip.value];
  if (activeTopBookTab.value === 'borrow') {
    return books.sort((a, b) => b.count - a.count).slice(0, 5);
  } else if (activeTopBookTab.value === 'ratingCount') {
    return books.sort((a, b) => b.ratingCount - a.ratingCount).slice(0, 5);
  } else {
    return books.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating)).slice(0, 5);
  }
});

const planPopularity = computed(() => {
  return plans.value.map(plan => {
    const subsOfPlan = subscriptions.value.filter(sub => sub.goiDocGia && sub.goiDocGia._id === plan._id);
    const count = subsOfPlan.length;
    const revenue = subsOfPlan
      .filter(sub => sub.trangThai !== 'HUY')
      .reduce((sum, sub) => sum + (sub.tongTien || 0), 0);
      
    const readersOfPlan = subsOfPlan
      .filter(sub => sub.trangThai === 'DANG_HIEU_LUC')
      .map(sub => {
        if (!sub.docGia) return null;
        return typeof sub.docGia === 'object' ? sub.docGia._id : sub.docGia;
      })
      .filter(id => id !== null);

    const booksCount = receipts.value
      .filter(r => {
        if (!r.docGia) return false;
        const rReaderId = typeof r.docGia === 'object' ? r.docGia._id : r.docGia;
        return readersOfPlan.includes(rReaderId);
      })
      .reduce((sum, r) => sum + (r.chiTietMuon ? r.chiTietMuon.length : 0), 0);

    return {
      name: plan.tenGoi,
      count,
      revenue,
      booksCount
    };
  }).sort((a, b) => b.count - a.count);
});

const realBooks = ref([]);
const fetchRealBooks = async () => {
  try {
    const res = await api.get('/books?limit=100');
    if (res.success && res.data && res.data.books) {
      realBooks.value = res.data.books;
    }
  } catch (error) {
    console.error('Fetch real books error:', error);
  }
};

onMounted(() => {
  fetchPlans();
  fetchDiscounts();
  fetchSettings();
  fetchSubscriptions();
  fetchReceipts();
  fetchRealBooks();
});
</script>
