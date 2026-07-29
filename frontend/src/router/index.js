import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  // Public Routes
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/books',
    name: 'books',
    component: () => import('../views/BookCatalogView.vue')
  },
  {
    path: '/books/:id',
    name: 'book-detail',
    component: () => import('../views/BookDetailView.vue')
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue')
  },
  {
    path: '/contact',
    name: 'contact',
    component: () => import('../views/ContactView.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('../views/admin/AdminLoginView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/admin/change-password',
    name: 'admin-change-password',
    component: () => import('../views/admin/AdminChangePasswordView.vue'),
    meta: { requiresStaff: true }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/RegisterView.vue'),
    meta: { guestOnly: true }
  },

  // Reader-only Routes
  {
    path: '/cart',
    name: 'cart',
    component: () => import('../views/CartView.vue'),
    meta: { requiresReader: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresReader: true }
  },
  {
    path: '/memberships',
    name: 'memberships',
    component: () => import('../views/MembershipsView.vue')
  },

  // Admin/Staff-only Routes (Admin Dashboard & Management)
  {
    path: '/admin',
    component: () => import('../views/admin/AdminLayout.vue'),
    meta: { requiresStaff: true },
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: () => import('../views/admin/AdminDashboardView.vue')
      },
      {
        path: 'books',
        name: 'admin-books',
        component: () => import('../views/admin/AdminBooksView.vue')
      },
      {
        path: 'copies/:bookId',
        name: 'admin-copies',
        component: () => import('../views/admin/AdminCopiesView.vue')
      },
      {
        path: 'borrowing',
        name: 'admin-borrowing',
        component: () => import('../views/admin/AdminBorrowingView.vue')
      },
      {
        path: 'finance',
        name: 'admin-finance',
        component: () => import('../views/admin/AdminFinanceView.vue')
      },
      {
        path: 'readers',
        name: 'admin-readers',
        component: () => import('../views/admin/AdminReadersView.vue')
      },
      {
        path: 'staffs',
        name: 'admin-staffs',
        component: () => import('../views/admin/AdminStaffsView.vue'),
        meta: { requiresAdmin: true } // Quản lý mới có quyền xem
      },
      {
        path: 'settings',
        name: 'admin-settings',
        component: () => import('../views/admin/AdminSettingsView.vue')
      }
    ]
  },

  // 404 Route
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    // Nếu chỉ thay đổi query parameters trên cùng một page, giữ nguyên vị trí cuộn
    if (to.path === from.path) return false;
    return { top: 0 };
  }
});

// Guard xử lý đăng nhập & phân quyền
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // Nạp thông tin user nếu chưa có
  if (!authStore.user) {
    await authStore.fetchUser();
  }

  const isLoggedIn = authStore.isAuthenticated;
  const isReader = authStore.isReader;
  const isStaff = authStore.isStaff;
  const isAdmin = authStore.isAdmin;
  const mustChangePassword = isStaff && authStore.user?.mustChangePassword === true;

  // 1. Chỉ dành cho khách chưa đăng nhập
  if (to.meta.guestOnly && isLoggedIn) {
    return next(isStaff ? { name: mustChangePassword ? 'admin-change-password' : 'admin-dashboard' } : { name: 'home' });
  }

  // 2. Yêu cầu quyền Độc giả
  if (to.meta.requiresReader && (!isLoggedIn || !isReader)) {
    return next({ name: 'login' });
  }

  // 3. Yêu cầu quyền Nhân viên
  if (to.meta.requiresStaff && (!isLoggedIn || !isStaff)) {
    return next({ name: 'admin-login' });
  }

  if (mustChangePassword && to.name !== 'admin-change-password') {
    return next({ name: 'admin-change-password' });
  }

  // 4. Yêu cầu quyền Quản lý (Admin) cấp cao
  if (to.meta.requiresAdmin && (!isLoggedIn || !isAdmin)) {
    return next({ name: 'admin-dashboard' });
  }

  next();
});

export default router;
