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
        <div v-if="chatStore.messages.length === 0" class="bg-white rounded-2xl border border-slate-200 p-4 text-sm text-slate-600 shadow-sm space-y-2">
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
              <div v-for="book in message.suggested_books" :key="book._id" class="w-36 flex-shrink-0 rounded-2xl border border-slate-200 bg-white overflow-hidden">
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

          <div v-if="message.external_suggestions?.length" class="bg-amber-50 border border-amber-100 rounded-2xl p-3 space-y-2">
            <h3 class="text-xs font-extrabold text-amber-900">Tác phẩm liên quan nhưng thư viện hiện chưa có</h3>
            <div v-for="item in message.external_suggestions" :key="item.title" class="text-xs text-amber-900 bg-white/70 rounded-xl p-2">
              <p class="font-bold">{{ item.title }}</p>
              <p v-if="item.author" class="text-[10px]">Tác giả: {{ item.author }}</p>
              <p v-if="item.reason" class="text-[10px] leading-relaxed text-amber-800 line-clamp-3">{{ item.reason }}</p>
            </div>
          </div>

          <div v-if="message.membership_plans?.length" class="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm space-y-3">
            <h3 class="text-xs font-extrabold text-slate-900">Gói hội viên</h3>
            <div class="space-y-2">
              <button
                v-for="plan in message.membership_plans"
                :key="plan._id"
                @click="message.selectedPlanId = plan._id"
                class="w-full text-left rounded-2xl border p-3 transition-all"
                :class="message.selectedPlanId === plan._id ? 'border-primary bg-primary-light' : 'border-slate-200 hover:border-primary/40'"
              >
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <p class="text-xs font-extrabold text-slate-900">{{ plan.tenGoi }}</p>
                    <p class="text-[10px] text-slate-500 font-bold">{{ plan.formatted_price || formatPrice(plan.giaTien) }} / {{ plan.soNgayHieuLuc }} ngày</p>
                  </div>
                  <span v-if="message.plan_comparison?.recommended_plan_id === plan._id" class="text-[9px] font-extrabold bg-primary text-white rounded-full px-2 py-1">Khuyên dùng</span>
                </div>
                <div class="grid grid-cols-2 gap-2 mt-2 text-[10px] text-slate-600 font-semibold">
                  <span>{{ plan.soSachToiDa }} sách</span>
                  <span>{{ plan.soNgayMuonToiDa }} ngày mượn</span>
                </div>
              </button>
            </div>
            <button @click="confirmPlan(message.selectedPlanId)" :disabled="!message.selectedPlanId" class="w-full rounded-xl bg-primary text-white py-2 text-xs font-extrabold disabled:opacity-50">
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
        ></textarea>
        <button type="submit" :disabled="chatStore.loading || !input.trim()" class="h-10 w-10 rounded-2xl bg-primary text-white flex items-center justify-center disabled:opacity-50">
          <Send class="h-4 w-4" />
        </button>
      </form>
    </section>
  </transition>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Bot, X, Send, ChevronLeft, ChevronRight } from '@lucide/vue';
import { useChatStore } from '../../stores/chat';
import { useCartStore } from '../../stores/cart';

const chatStore = useChatStore();
const cartStore = useCartStore();
const router = useRouter();
const input = ref('');
const messageList = ref(null);
const bookScrollers = ref({});

const setBookScroller = (index, el) => {
  if (el) bookScrollers.value[index] = el;
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
  const text = input.value;
  input.value = '';
  await chatStore.sendMessage(text);
  scrollToBottom();
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

const confirmPlan = (planId) => {
  if (!planId) return;
  chatStore.closeChat();
  router.push({ name: 'memberships', query: { plan: planId, confirm: '1' } });
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
</style>
