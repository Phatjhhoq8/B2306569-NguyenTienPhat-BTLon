<template>
  <div class="min-h-screen bg-white flex items-center justify-center p-4 font-sans select-none overflow-hidden relative">
    <!-- Ambient background gradient -->
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.06)_0%,transparent_70%)]"></div>
    
    <div class="max-w-2xl w-full text-center space-y-4 py-8 relative z-10">
      
      <!-- 404 Serif Text on Top -->
      <h1 class="text-7xl md:text-8xl font-serif font-bold text-slate-900 tracking-tight leading-none">404</h1>
      
      <!-- Caveman SVG Animation Container -->
      <div class="relative w-full h-64 flex items-center justify-center overflow-hidden">
        <!-- SVG Canvas with high-fidelity components -->
        <svg viewBox="0 0 420 220" class="w-full max-w-md h-full object-contain">
          <defs>
            <!-- Ambient Blue Glow during electric shock -->
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            
            <!-- Rock Gradients -->
            <linearGradient id="rockGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#cbd5e1" />
              <stop offset="100%" stop-color="#64748b" />
            </linearGradient>
            <linearGradient id="rockGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#f1f5f9" />
              <stop offset="100%" stop-color="#cbd5e1" />
            </linearGradient>
          </defs>

          <!-- Light blue flash background glow -->
          <circle cx="200" cy="115" r="75" fill="#e0f2fe" class="shock-bg-glow" />

          <!-- Background Scenery -->
          <g class="scenery">
            <!-- Sand island base -->
            <ellipse cx="200" cy="180" rx="160" ry="25" fill="#fef3c7" opacity="0.9" />
            
            <!-- Left Rock Group & Bush -->
            <path d="M 45,180 Q 55,100 75,110 Q 95,120 105,180 Z" fill="url(#rockGrad2)" />
            <path d="M 30,180 Q 40,130 55,135 Q 70,140 75,180 Z" fill="url(#rockGrad1)" opacity="0.7" />
            <circle cx="45" cy="175" r="10" fill="#22c55e" />
            <circle cx="58" cy="177" r="8" fill="#15803d" />

            <!-- Right Dinosaur Bone -->
            <g class="dino-bone" transform="translate(290, 168) rotate(15)">
              <rect x="15" y="5" width="30" height="8" rx="2" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" />
              <circle cx="15" cy="5" r="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" />
              <circle cx="15" cy="13" r="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" />
              <circle cx="45" cy="5" r="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" />
              <circle cx="45" cy="13" r="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" />
            </g>
          </g>

          <!-- Ground Line -->
          <line x1="30" y1="185" x2="370" y2="185" stroke="#e2e8f0" stroke-width="3" stroke-linecap="round" />

          <!-- Prehistoric Caveman Character -->
          <g class="caveman">
            
            <!-- Feet -->
            <g class="feet">
              <g class="foot-left">
                <ellipse cx="152" cy="175" rx="14" ry="10" fill="#fdba74" class="skin" />
                <circle cx="140" cy="168" r="3.5" fill="#fdba74" class="skin" />
                <circle cx="146" cy="166" r="3.2" fill="#fdba74" class="skin" />
                <circle cx="152" cy="166" r="3" fill="#fdba74" class="skin" />
                <circle cx="158" cy="167" r="2.8" fill="#fdba74" class="skin" />
                <circle cx="163" cy="170" r="2.5" fill="#fdba74" class="skin" />
              </g>
              <g class="foot-right">
                <ellipse cx="218" cy="175" rx="14" ry="10" fill="#fdba74" class="skin" />
                <circle cx="206" cy="170" r="2.5" fill="#fdba74" class="skin" />
                <circle cx="211" cy="167" r="2.8" fill="#fdba74" class="skin" />
                <circle cx="217" cy="166" r="3" fill="#fdba74" class="skin" />
                <circle cx="223" cy="166" r="3.2" fill="#fdba74" class="skin" />
                <circle cx="229" cy="168" r="3.5" fill="#fdba74" class="skin" />
              </g>
            </g>

            <!-- Torso / Body -->
            <path d="M 165,95 L 235,95 L 245,160 L 155,160 Z" fill="#ea580c" class="tunic" />
            <!-- Leopard Spots -->
            <path d="M 175,108 L 181,105 L 178,112 Z M 215,110 L 221,115 L 213,118 Z M 195,124 L 202,122 L 198,129 Z M 172,136 L 177,139 L 173,144 Z M 225,132 L 230,130 L 227,137 Z M 200,145 L 206,148 L 201,151 Z" fill="#1e293b" class="tunic-spots" />

            <!-- Electric Shock Body & Skeleton Overlay -->
            <g class="skeleton-overlay">
              <path d="M 165,95 L 235,95 L 245,160 L 155,160 Z" fill="#38bdf8" filter="url(#glow)" />
              <line x1="200" y1="102" x2="200" y2="148" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" />
              <path d="M 183,112 Q 200,106 217,112" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" fill="none" />
              <path d="M 178,120 Q 200,114 222,120" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" fill="none" />
              <path d="M 175,129 Q 200,123 225,129" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" fill="none" />
              <path d="M 178,138 Q 200,132 222,138" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" fill="none" />
              <path d="M 184,146 Q 200,140 216,146" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" fill="none" />
            </g>

            <!-- Right Arm -->
            <path d="M 233,105 Q 262,90 248,70" stroke="#fdba74" stroke-width="9.5" stroke-linecap="round" fill="none" class="skin arm-right" />

            <!-- Head Group -->
            <g class="head-group">
              <!-- Bushy beard -->
              <path d="M 166,62 Q 200,102 234,62 Q 232,92 200,96 Q 168,92 166,62 Z" fill="#334155" class="beard" />
              <!-- Face -->
              <circle cx="200" cy="62" r="19" fill="#fdba74" class="skin face" />
              <!-- Big Nose -->
              <circle cx="200" cy="65" r="5.5" fill="#f87171" class="nose" />
              
              <!-- Eyes -->
              <g class="eyes">
                <g class="eyes-normal">
                  <circle cx="191" cy="56" r="6" fill="#ffffff" />
                  <circle cx="191" cy="56" r="2.8" fill="#0f172a" />
                  <circle cx="209" cy="56" r="6" fill="#ffffff" />
                  <circle cx="209" cy="56" r="2.8" fill="#0f172a" />
                </g>
                <g class="eyes-shocked">
                  <path d="M 187,52 L 195,60 M 195,52 L 187,60" stroke="#000000" stroke-width="2.5" stroke-linecap="round" />
                  <path d="M 205,52 L 213,60 M 213,52 L 205,60" stroke="#000000" stroke-width="2.5" stroke-linecap="round" />
                </g>
              </g>

              <!-- Mouth -->
              <path d="M 194,74 Q 200,79 206,74" fill="none" stroke="#1e293b" stroke-width="2" stroke-linecap="round" class="mouth-normal" />
              <path d="M 194,74 Q 188,80 180,75 Q 186,70 195,73 Z" fill="#ef4444" class="tongue" />

              <!-- Hair -->
              <path d="M 166,56 Q 200,20 234,56 Q 242,38 200,36 Q 158,38 166,56 Z" fill="#334155" class="hair" />
            </g>

            <!-- Left Arm -->
            <path d="M 167,110 Q 140,118 165,82" stroke="#fdba74" stroke-width="9.5" stroke-linecap="round" fill="none" class="skin arm-left" />
          </g>

          <!-- Cable / Wire -->
          <path d="M 115,115 Q 130,125 152,86" stroke="#0f172a" stroke-width="4.5" stroke-linecap="round" fill="none" />
          <path d="M 330,95 Q 260,180 167,82" stroke="#0f172a" stroke-width="4.5" stroke-linecap="round" fill="none" />
          <path d="M 330,95 Q 260,180 167,82" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" fill="none" class="wire-core" />

          <!-- Lightning Bolts -->
          <g class="lightning-bolts">
            <path d="M 130,85 L 145,95 L 138,105 L 150,115" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" fill="none" class="bolt" />
            <path d="M 270,75 L 252,92 L 265,108 L 248,130" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" fill="none" class="bolt" />
            <path d="M 200,15 L 192,35 L 208,50 L 195,65" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round" fill="none" class="bolt" />
            <path d="M 152,145 L 140,155 L 148,162" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" fill="none" class="bolt" />
            <path d="M 248,145 L 260,155 L 252,162" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" fill="none" class="bolt" />
            <circle cx="166" cy="83" r="12" fill="none" stroke="#e0f2fe" stroke-width="2" class="bolt" />
            <path d="M 166,83 L 154,71 M 166,83 L 178,71 M 166,83 L 154,95 M 166,83 L 178,95" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" class="bolt" />
          </g>

          <!-- Smoke Particles -->
          <g class="smoke-elements">
            <circle cx="200" cy="30" r="8" fill="#94a3b8" opacity="0" class="smoke-p smoke-1" />
            <circle cx="218" cy="42" r="6" fill="#cbd5e1" opacity="0" class="smoke-p smoke-2" />
            <circle cx="185" cy="50" r="5" fill="#94a3b8" opacity="0" class="smoke-p smoke-3" />
          </g>
        </svg>
      </div>

      <!-- Typography -->
      <div class="space-y-2">
        <h2 class="text-2xl md:text-3xl font-serif font-normal text-slate-800">Hình như bạn đã đi lạc</h2>
        <p class="text-xs md:text-sm text-slate-400 font-sans font-medium">Trang bạn đang tìm kiếm hiện không khả dụng!</p>
      </div>

      <!-- Action Button -->
      <div class="pt-4">
        <router-link 
          to="/" 
          class="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-8 rounded-lg text-xs md:text-sm tracking-wider uppercase transition-all shadow-md active:scale-95 hover:shadow-lg"
        >
          Trở về Trang Chủ
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
// NotFoundView.vue - Trang lỗi 404 hoạt họa SVG người tiền sử nếm dây điện, lộ xương sườn (phiên bản gốc)
// Lý do tạo: Khôi phục lại bản vẽ SVG nguyên bản theo yêu cầu người dùng
</script>

<style scoped>
/* ==================== PREHISTORIC CARTOON ANIMATIONS ==================== */

/* 1. Squash & Stretch + Shake */
.caveman {
  transform-origin: 200px 165px;
  animation: caveman-behavior 6.5s infinite cubic-bezier(0.45, 0, 0.55, 1);
}

@keyframes caveman-behavior {
  0%, 25% { transform: scale(1) translate(0, 0) rotate(0deg); }
  12% { transform: scale(0.98, 1.02) translate(0, -2px) rotate(-0.5deg); }
  24% { transform: scale(1) translate(0, 0) rotate(0deg); }
  26% { transform: scale(1.1, 0.9) translate(-4px, 5px) rotate(2deg); }
  29% { transform: scale(0.9, 1.1) translate(4px, -4px) rotate(-2deg); }
  32% { transform: scale(1.12, 0.88) translate(-5px, 2px) rotate(3deg); }
  35% { transform: scale(0.88, 1.12) translate(3px, -5px) rotate(-3deg); }
  38% { transform: scale(1.08, 0.92) translate(-3px, 4px) rotate(2deg); }
  41% { transform: scale(0.92, 1.08) translate(3px, -3px) rotate(-2deg); }
  44% { transform: scale(1.05, 0.95) translate(-1px, 3px) rotate(1deg); }
  47% { transform: scale(0.95, 1.05) translate(2px, -2px) rotate(-1deg); }
  50% { transform: scale(1) translate(0, 0) rotate(0deg); }
  53% { transform: scale(1.02, 0.94) translate(0, 5px) rotate(0.5deg); }
  60% { transform: scale(1) translate(0, 0) rotate(0deg); }
  70% { transform: scale(0.98, 1.02) translate(-1px, -1px); }
  80%, 100% { transform: scale(1) translate(0, 0) rotate(0deg); }
}

/* 2. Skin color change */
.skin {
  animation: skin-burn 6.5s infinite step-end;
}
@keyframes skin-burn {
  0%, 25% { fill: #fdba74; }
  26%, 50% { fill: #0284c7; }
  51%, 100% { fill: #fdba74; }
}

.tunic {
  animation: tunic-burn 6.5s infinite step-end;
}
@keyframes tunic-burn {
  0%, 25% { fill: #ea580c; }
  26%, 50% { fill: #1e293b; }
  51%, 100% { fill: #ea580c; }
}

.beard, .hair {
  transform-origin: 200px 62px;
  animation: hair-burn 6.5s infinite ease-in-out;
}
@keyframes hair-burn {
  0%, 25% { fill: #334155; transform: scale(1); }
  26%, 50% { fill: #0f172a; transform: scale(1.15) skewX(2deg); }
  51%, 100% { fill: #334155; transform: scale(1); }
}

/* 3. Skeleton Overlay */
.skeleton-overlay {
  opacity: 0;
  animation: skeleton-glow-cycle 6.5s infinite step-end;
}
@keyframes skeleton-glow-cycle {
  0%, 25% { opacity: 0; }
  26%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.shock-bg-glow {
  opacity: 0;
  animation: bg-glow-flash 6.5s infinite step-end;
}
@keyframes bg-glow-flash {
  0%, 25% { opacity: 0; }
  26% { opacity: 0.6; } 28% { opacity: 0.1; }
  30% { opacity: 0.6; } 32% { opacity: 0.1; }
  34% { opacity: 0.6; } 36% { opacity: 0.1; }
  38% { opacity: 0.6; } 40% { opacity: 0.1; }
  42% { opacity: 0.6; } 44% { opacity: 0.1; }
  46% { opacity: 0.6; } 48% { opacity: 0.1; }
  50%, 100% { opacity: 0; }
}

/* 4. Eyes */
.eyes-normal {
  animation: eyes-normal-cycle 6.5s infinite step-end;
}
@keyframes eyes-normal-cycle {
  0%, 25% { opacity: 1; }
  26%, 50% { opacity: 0; }
  51%, 100% { opacity: 1; }
}

.eyes-shocked {
  opacity: 0;
  animation: eyes-shocked-cycle 6.5s infinite step-end;
}
@keyframes eyes-shocked-cycle {
  0%, 25% { opacity: 0; }
  26%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* 5. Mouth & Tongue */
.mouth-normal {
  animation: mouth-normal-cycle 6.5s infinite step-end;
}
@keyframes mouth-normal-cycle {
  0%, 8% { opacity: 1; }
  9%, 25% { opacity: 0; }
  26%, 100% { opacity: 1; }
}

.tongue {
  opacity: 0;
  transform-origin: 195px 73px;
  animation: tongue-lick 6.5s infinite ease-in-out;
}
@keyframes tongue-lick {
  0%, 8% { opacity: 0; transform: scale(0.6) translate(5px, -2px); }
  9%, 25% { opacity: 1; transform: scale(1.15) translate(0, 0); }
  26%, 100% { opacity: 0; transform: scale(0.6) translate(5px, -2px); }
}

/* 6. Arms */
.arm-right {
  transform-origin: 233px 105px;
  animation: arm-right-scratch 6.5s infinite ease-in-out;
}
@keyframes arm-right-scratch {
  0%, 25% { transform: rotate(0deg); }
  26%, 50% { transform: rotate(15deg) scaleY(1.05); }
  65% { transform: rotate(-55deg) translate(-6px, -4px); }
  68% { transform: rotate(-40deg) translate(-2px, -2px); }
  71% { transform: rotate(-55deg) translate(-6px, -4px); }
  74% { transform: rotate(-40deg) translate(-2px, -2px); }
  77% { transform: rotate(-55deg) translate(-6px, -4px); }
  80%, 100% { transform: rotate(0deg); }
}

.arm-left {
  transform-origin: 167px 110px;
  animation: arm-left-lick 6.5s infinite ease-in-out;
}
@keyframes arm-left-lick {
  0% { transform: rotate(-10deg); }
  9%, 25% { transform: rotate(18deg); }
  26%, 50% { transform: rotate(10deg) scaleY(1.03); }
  51%, 100% { transform: rotate(-10deg); }
}

.wire-core {
  stroke-dasharray: 8;
  animation: wire-glow 6.5s infinite linear;
}
@keyframes wire-glow {
  0%, 25% { stroke: #38bdf8; stroke-dashoffset: 0; }
  26%, 50% { stroke: #ffffff; stroke-dashoffset: 20; }
  51%, 100% { stroke: #38bdf8; stroke-dashoffset: 0; }
}

/* 7. Lightning Bolts */
.bolt {
  opacity: 0;
  animation: lightning-flash-cycle 6.5s infinite step-end;
}
@keyframes lightning-flash-cycle {
  0%, 25% { opacity: 0; }
  26% { opacity: 1; } 28% { opacity: 0; }
  30% { opacity: 1; } 32% { opacity: 0; }
  34% { opacity: 1; } 36% { opacity: 0; }
  38% { opacity: 1; } 40% { opacity: 0; }
  42% { opacity: 1; } 44% { opacity: 0; }
  46% { opacity: 1; } 48% { opacity: 0; }
  50%, 100% { opacity: 0; }
}

/* 8. Smoke */
.smoke-1 { animation: smoke-lift-1 6.5s infinite ease-out; }
.smoke-2 { animation: smoke-lift-2 6.5s infinite ease-out; }
.smoke-3 { animation: smoke-lift-3 6.5s infinite ease-out; }

@keyframes smoke-lift-1 {
  0%, 50% { opacity: 0; transform: translateY(0) scale(0.6); }
  52% { opacity: 0.7; transform: translateY(-8px) scale(0.9); }
  64% { opacity: 0; transform: translateY(-30px) scale(1.5); }
  65%, 100% { opacity: 0; }
}
@keyframes smoke-lift-2 {
  0%, 52% { opacity: 0; transform: translateY(0) scale(0.5); }
  54% { opacity: 0.6; transform: translateY(-6px) scale(0.8); }
  67% { opacity: 0; transform: translateY(-25px) scale(1.3); }
  68%, 100% { opacity: 0; }
}
@keyframes smoke-lift-3 {
  0%, 49% { opacity: 0; transform: translateY(0) scale(0.7); }
  51% { opacity: 0.8; transform: translateY(-10px) scale(1); }
  61% { opacity: 0; transform: translateY(-35px) scale(1.6); }
  62%, 100% { opacity: 0; }
}
</style>
