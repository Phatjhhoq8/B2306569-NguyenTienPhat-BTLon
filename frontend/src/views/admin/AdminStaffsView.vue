<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-3">
      <div>
        <h1 class="font-sans text-3xl font-extrabold text-slate-900">Quản Lý Nhân Viên</h1>
        <p class="text-sm text-slate-500 font-medium">Thêm nhân viên mới, phân vai trò quản lý hoặc thủ thư (Quản lý mới có quyền xem)</p>
      </div>
      <button 
        @click="openAddModal"
        class="bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 px-6 rounded-xl text-sm transition-all shadow-md flex items-center justify-center space-x-2"
      >
        <Plus class="h-5 w-5" />
        <span>Thêm nhân viên mới</span>
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <!-- Search -->
        <div class="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 w-full sm:w-80 shadow-inner relative z-30">
          <Search class="h-4 w-4 text-slate-400 flex-shrink-0" />
          <div class="relative flex-grow">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Tìm tên, mã số, sđt..." 
              class="w-full focus:outline-none text-sm bg-transparent font-medium"
              @input="[fetchStaffs(), fetchStaffSuggestions()]"
              @focus="showStaffSuggestions = true"
              @blur="setTimeout(() => { showStaffSuggestions = false; activeSuggestionIndex = -1; }, 200)"
              @keydown.down.prevent="onKeyDown"
              @keydown.up.prevent="onKeyUp"
              @keydown.enter.prevent="onKeyEnter"
              @keydown.esc="showStaffSuggestions = false"
            />
            
            <!-- Suggestions Dropdown -->
            <div 
              v-if="showStaffSuggestions && staffSuggestions.length > 0" 
              class="absolute left-0 right-0 mt-3 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto w-64 sm:w-72"
            >
              <div 
                v-for="(item, idx) in staffSuggestions" 
                :key="item.id"
                class="px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-sm font-bold text-slate-700 flex items-center justify-between border-b border-slate-50 last:border-b-0"
                :class="{ 'bg-slate-100': activeSuggestionIndex === idx }"
                @mousedown="selectStaffSuggestion(item)"
              >
                <span class="truncate max-w-[180px] sm:max-w-[200px]">{{ item.text }}</span>
                <span class="text-[10px] md:text-xs text-slate-400 font-semibold font-mono">Nhân viên</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="staffs.length > 0" class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <th class="pb-3">Họ tên nhân viên</th>
              <th class="pb-3">Mã số nhân viên</th>
              <th class="pb-3">Số điện thoại</th>
              <th class="pb-3">Địa chỉ</th>
              <th class="pb-3">Chức vụ</th>
              <th class="pb-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50 text-sm font-medium text-slate-700">
            <tr v-for="staff in staffs" :key="staff._id" class="hover:bg-slate-50/55 transition-colors">
              <td class="py-4 font-bold text-slate-950">{{ staff.hoTenNV }}</td>
              <td class="py-4 text-xs font-bold text-slate-500 font-mono">{{ staff.maSoNV }}</td>
              <td class="py-4 font-mono text-xs">{{ staff.soDienThoai }}</td>
              <td class="py-4 text-xs">{{ staff.diachi }}</td>
              <td class="py-4">
                <span 
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                  :class="staff.chucVu === 'QUAN_LY' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'"
                >
                  {{ staff.chucVu === 'QUAN_LY' ? 'Quản lý' : 'Thủ thư' }}
                </span>
              </td>
              <td class="py-4 text-right space-x-2">
                <button 
                  @click="openEditModal(staff)"
                  class="text-xs font-bold text-primary hover:underline"
                >
                  Sửa
                </button>
                <button 
                  @click="deleteStaff(staff._id)"
                  :disabled="staff.maSoNV === authStore.user?.maSoNV"
                  class="text-xs font-bold text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                  title="Không thể tự xóa chính mình"
                >
                  Xóa
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center py-12 text-sm text-slate-400 font-medium">Chưa có nhân viên nào khác được khởi tạo.</div>
    </div>

    <!-- Modal Form (Add / Edit) -->
    <Teleport to="body">
      <div 
        v-if="showModal" 
        class="fixed inset-0 bg-slate-900 bg-opacity-65 z-[9999] overflow-y-auto p-4 md:py-8 flex items-start justify-center backdrop-blur-sm"
        @click.self="showModal = false"
      >
      <div class="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 space-y-6 shadow-2xl relative my-auto">
        <button @click="showModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X class="h-6 w-6" />
        </button>

        <h2 class="font-sans text-2xl font-extrabold text-slate-900 border-b pb-2">
          {{ isEdit ? 'SỬA THÔNG TIN NHÂN VIÊN' : 'THÊM NHÂN VIÊN MỚI' }}
        </h2>

        <form class="space-y-4 text-sm" @submit.prevent="saveStaff">
          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-600 uppercase">Họ và tên</label>
            <input v-model="form.hoTenNV" type="text" required placeholder="Nguyễn Văn A" class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-600 uppercase">Số điện thoại</label>
            <input v-model="form.soDienThoai" type="text" required placeholder="0912345678" class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-600 uppercase">Địa chỉ</label>
            <input v-model="form.diachi" type="text" required placeholder="Ninh Kiều, Cần Thơ" class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-600 uppercase">Chức vụ</label>
              <select v-model="form.chucVu" class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none">
                <option value="THU_THU">Thủ thư</option>
                <option value="QUAN_LY">Quản lý</option>
              </select>
            </div>
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-600 uppercase">Mật khẩu</label>
              <input 
                v-model="form.matKhau" 
                type="password" 
                :required="!isEdit" 
                placeholder="••••••" 
                class="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none" 
              />
              <span v-if="isEdit" class="text-[10px] text-slate-400 block font-medium">Bỏ trống nếu không muốn đổi</span>
            </div>
          </div>

          <button 
            type="submit" 
            :disabled="saving"
            class="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2"
          >
            <span>{{ isEdit ? 'Lưu thay đổi' : 'Tạo nhân viên' }}</span>
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
import { useAuthStore } from '../../stores/auth';
import api from '../../services/api';
import { Plus, X, Search } from '@lucide/vue';
import ConfirmModal from '../../components/ConfirmModal.vue';
import { useToastStore } from '../../stores/toast';

const confirmModal = ref(null);
const toast = useToastStore();
const authStore = useAuthStore();
const staffs = ref([]);
const showModal = ref(false);
const isEdit = ref(false);
const saving = ref(false);
const editId = ref(null);

const searchQuery = ref('');
const staffSuggestions = ref([]);
const showStaffSuggestions = ref(false);
const activeSuggestionIndex = ref(-1);

const form = ref({
  hoTenNV: '',
  soDienThoai: '',
  diachi: '',
  chucVu: 'THU_THU',
  matKhau: ''
});

let searchTimeout = null;
const fetchStaffSuggestions = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  
  const query = searchQuery.value?.trim();
  if (!query) {
    staffSuggestions.value = [];
    activeSuggestionIndex.value = -1;
    return;
  }
  
  searchTimeout = setTimeout(async () => {
    try {
      const res = await api.get(`/admin/staffs/search-suggestions?q=${encodeURIComponent(query)}`);
      if (res.success) {
        staffSuggestions.value = res.data;
        activeSuggestionIndex.value = -1;
      }
    } catch (error) {
      console.error('Fetch staff suggestions error:', error);
    }
  }, 200);
};

const selectStaffSuggestion = (item) => {
  searchQuery.value = item.code || item.name;
  showStaffSuggestions.value = false;
  activeSuggestionIndex.value = -1;
  fetchStaffs();
};

const onKeyDown = () => {
  if (staffSuggestions.value.length === 0) return;
  activeSuggestionIndex.value = (activeSuggestionIndex.value + 1) % staffSuggestions.value.length;
};

const onKeyUp = () => {
  if (staffSuggestions.value.length === 0) return;
  activeSuggestionIndex.value = (activeSuggestionIndex.value - 1 + staffSuggestions.value.length) % staffSuggestions.value.length;
};

const onKeyEnter = () => {
  if (showStaffSuggestions.value && activeSuggestionIndex.value !== -1 && activeSuggestionIndex.value < staffSuggestions.value.length) {
    selectStaffSuggestion(staffSuggestions.value[activeSuggestionIndex.value]);
  } else {
    showStaffSuggestions.value = false;
    activeSuggestionIndex.value = -1;
    fetchStaffs();
  }
};

const fetchStaffs = async () => {
  try {
    let url = '/admin/staffs';
    if (searchQuery.value.trim()) {
      url += `?q=${encodeURIComponent(searchQuery.value.trim())}`;
    }
    const res = await api.get(url);
    if (res.success) {
      staffs.value = res.data;
    }
  } catch (error) {
    console.error('Fetch staffs error:', error);
  }
};

const openAddModal = () => {
  isEdit.value = false;
  editId.value = null;
  form.value = {
    hoTenNV: '',
    soDienThoai: '',
    diachi: '',
    chucVu: 'THU_THU',
    matKhau: ''
  };
  showModal.value = true;
};

const openEditModal = (staff) => {
  isEdit.value = true;
  editId.value = staff._id;
  form.value = {
    hoTenNV: staff.hoTenNV,
    soDienThoai: staff.soDienThoai,
    diachi: staff.diachi,
    chucVu: staff.chucVu,
    matKhau: ''
  };
  showModal.value = true;
};

const saveStaff = async () => {
  const ok = await confirmModal.value.ask({ message: 'Bạn có chắc chắn muốn lưu (thêm/sửa) thông tin nhân viên này không?' });
  if (!ok) return;
  saving.value = true;
  try {
    const payload = { ...form.value };
    if (isEdit.value) {
      if (!payload.matKhau) delete payload.matKhau; // Không đổi mật khẩu
      const res = await api.put(`/admin/staffs/${editId.value}`, payload);
      if (res.success) {
        toast.show('Cập nhật nhân viên thành công!');
      }
    } else {
      const res = await api.post('/admin/staffs', payload);
      if (res.success) {
        toast.show('Tạo nhân viên mới thành công!');
      }
    }
    showModal.value = false;
    fetchStaffs();
  } catch (error) {
    toast.show(error.message || 'Lỗi khi lưu nhân viên', 'error');
  } finally {
    saving.value = false;
  }
};

const deleteStaff = async (id) => {
  const ok = await confirmModal.value.ask({ message: 'Bạn có chắc chắn muốn xóa nhân viên này ra khỏi hệ thống không?' });
  if (!ok) return;
  try {
    const res = await api.delete(`/admin/staffs/${id}`);
    if (res.success) {
      toast.show('Đã xóa nhân viên thành công.');
      fetchStaffs();
    }
  } catch (error) {
    toast.show(error.message || 'Lỗi khi xóa nhân viên', 'error');
  }
};

onMounted(() => {
  fetchStaffs();
});
</script>
