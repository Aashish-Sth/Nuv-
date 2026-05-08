<script setup lang="ts">
import { gsap } from 'gsap'

const heroRef = ref<HTMLElement | null>(null)

onMounted(() => {
  if (!heroRef.value) return

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

  tl.from('.hero-eyebrow', { opacity: 0, y: 24, duration: 0.7, delay: 0.2 })
    .from('.hero-heading', { opacity: 0, y: 24, duration: 1.1 }, '-=0.4')
    .from('.hero-sub', { opacity: 0, y: 24, duration: 0.7 }, '-=0.7')
    .from('.hero-actions', { opacity: 0, y: 24, duration: 0.7 }, '-=0.5')
    .from('.hero-image', { opacity: 0, scale: 0.98, duration: 1.1 }, '-=0.9')
    .from('.hero-stats > *', { opacity: 0, y: 16, duration: 0.5, stagger: 0.08 }, '-=0.6')
})
</script>

<template>
  <section ref="heroRef" class="relative min-h-screen flex items-center pt-20 overflow-hidden">
    <!-- Subtle radial glow -->
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-nv-green/[0.03] rounded-full blur-[120px] pointer-events-none" />

    <div class="nv-container relative z-10">
      <div class="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        <!-- Left: Copy -->
        <div class="max-w-xl">
          <div class="hero-eyebrow flex items-center gap-2 mb-6">
            <span class="inline-block w-8 h-px bg-nv-green" />
            <span class="text-nv-green text-sm font-medium tracking-wider uppercase">Curated Kitchens</span>
          </div>

          <h1 class="hero-heading nv-heading text-4xl sm:text-5xl lg:text-6xl mb-6">
            Exceptional flavours,
            <em class="text-nv-green italic">delivered</em>
            to your door
          </h1>

          <p class="hero-sub text-nv-muted text-base sm:text-lg leading-relaxed mb-8 max-w-md">
            Discover handpicked cloud kitchens and acclaimed restaurants. Every dish crafted with intention, delivered with care.
          </p>

          <div class="hero-actions flex flex-wrap gap-4">
            <NuxtLink
              to="/menu"
              class="inline-flex items-center gap-2 bg-nv-green hover:bg-nv-green-dk text-nv-void font-semibold text-sm px-7 py-3.5 rounded-[10px] transition-all duration-300 active:scale-[0.97]"
            >
              Explore Menu
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </NuxtLink>
            <NuxtLink
              to="/about"
              class="inline-flex items-center gap-2 border border-nv-border hover:border-nv-green/40 text-nv-text font-medium text-sm px-7 py-3.5 rounded-[10px] transition-all duration-300"
            >
              How It Works
            </NuxtLink>
          </div>
        </div>

        <!-- Right: Hero Image -->
        <div class="hero-image relative flex justify-center lg:justify-end">
          <div class="relative w-full max-w-lg">
            <!-- Decorative ring -->
            <div class="absolute -inset-4 border border-nv-border/50 rounded-[16px] -rotate-3" />
            <div class="relative rounded-[16px] overflow-hidden border border-nv-border">
              <img
                src="/images/hero-food.png"
                alt="Beautifully plated gourmet dish"
                class="w-full aspect-[4/3] object-cover"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-nv-void/40 via-transparent to-transparent" />
            </div>

            <!-- Floating card -->
            <div class="absolute -bottom-4 -left-4 bg-nv-surface border border-nv-border rounded-[12px] px-4 py-3 flex items-center gap-3">
              <div class="w-10 h-10 bg-nv-green/15 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-nv-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-xs text-nv-muted">Avg. Delivery</p>
                <p class="text-sm font-semibold text-nv-text">25–35 min</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats bar -->
      <div class="hero-stats grid grid-cols-2 sm:grid-cols-4 gap-6 mt-20 pt-10 border-t border-nv-border">
        <div>
          <p class="text-2xl sm:text-3xl font-display text-nv-text">
            <UiAnimatedCounter :target="120" suffix="+" />
          </p>
          <p class="text-sm text-nv-muted mt-1">Partner Kitchens</p>
        </div>
        <div>
          <p class="text-2xl sm:text-3xl font-display text-nv-text">
            <UiAnimatedCounter :target="50" suffix="k+" />
          </p>
          <p class="text-sm text-nv-muted mt-1">Happy Customers</p>
        </div>
        <div>
          <p class="text-2xl sm:text-3xl font-display text-nv-text">
            <UiAnimatedCounter :target="15" />
          </p>
          <p class="text-sm text-nv-muted mt-1">Cuisine Types</p>
        </div>
        <div>
          <p class="text-2xl sm:text-3xl font-display text-nv-text">
            <UiAnimatedCounter :target="4" prefix="" suffix=".8" />
          </p>
          <p class="text-sm text-nv-muted mt-1">Average Rating</p>
        </div>
      </div>
    </div>
  </section>
</template>
