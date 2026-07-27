<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-3">
      <div>
        <h1 class="font-serif text-3xl font-bold text-slate-900">Quản Lý Nhân Viên</h1>
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
    <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
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
    <div v-if="showModal" class="fixed inset-0 bg-slate-900 bg-opacity-65 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button @click="showModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X class="h-6 w-6" />
        </button>

        <h2 class="font-serif text-2xl font-bold text-slate-900 border-b pb-2">
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import api from '../../services/api';
import { Plus, X } from '@lucide/vue';

const authStore = useAuthStore();
const staffs = ref([]);
const showModal = ref(false);
const isEdit = ref(false);
const saving = ref(false);
const editId = ref(null);

const form = ref({
  hoTenNV: '',
  soDienThoai: '',
  diachi: '',
  chucVu: 'THU_THU',
  matKhau: ''
});

const fetchStaffs = async () => {
  try {
    const res = await api.get('/admin/staffs');
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
  saving.value = true;
  try {
    const payload = { ...form.value };
    if (isEdit.value) {
      if (!payload.matKhau) delete payload.matKhau; // Không đổi mật khẩu
      const res = await api.put(`/admin/staffs/${editId.value}`, payload);
      if (res.success) {
        alert('Cập nhật nhân viên thành công!');
      }
    } else {
      const res = await api.post('/admin/staffs', payload);
      if (res.success) {
        alert('Tạo nhân viên mới thành công!');
      }
    }
    showModal.value = false;
    fetchStaffs();
  } catch (error) {
    alert(error.message || 'Lỗi khi lưu nhân viên');
  } finally {
    saving.value = false;
  }
};

const deleteStaff = async (id) => {
  if (!confirm('Bạn có chắc chắn muốn xóa nhân viên này ra khỏi hệ thống? (Xóa mềm)')) return;
  try {
    const res = await api.delete(`/admin/staffs/${id}`);
    if (res.success) {
      alert('Đã xóa nhân viên thành công.');
      fetchStaffs();
    }
  } catch (error) {
    alert(error.message || 'Lỗi khi xóa nhân viên');
  }
};

onMounted(() => {
  fetchStaffs();
});
</script>
