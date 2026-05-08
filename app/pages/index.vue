<script setup lang="ts">
useHead({
  title: 'Nuvé — Curated Cloud Kitchens & Restaurant Delivery',
  meta: [{ name: 'description', content: 'Discover handpicked cloud kitchens and premium restaurants.' }],
})

const steps = [
  { title: 'Discover', description: 'Browse curated cloud kitchens and restaurants, each vetted for quality.' },
  { title: 'Order', description: 'Build your perfect meal. Mix dishes from different kitchens in one order.' },
  { title: 'Enjoy', description: 'Your meal arrives beautifully packaged, at the perfect temperature.' },
]
</script>

<template>
  <div>
    <SectionsHeroSection />

    <!-- How It Works -->
    <section class="nv-section">
      <div class="nv-container">
        <div class="text-center mb-14">
          <span class="text-nv-green text-sm font-medium tracking-wider uppercase mb-2 block">Simple &amp; Seamless</span>
          <h2 class="nv-heading text-3xl sm:text-4xl">How <em class="text-nv-green italic">Nuvé</em> works</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div
            v-for="(step, i) in steps"
            :key="i"
            v-motion
            :initial="{ opacity: 0, y: 24 }"
            :visible-once="{ opacity: 1, y: 0, transition: { duration: 700, delay: i * 80 } }"
            class="relative bg-nv-surface border border-nv-border rounded-[12px] p-8 text-center group hover:border-nv-green/30 transition-colors duration-300"
          >
            <span class="absolute top-4 right-4 text-xs font-mono text-nv-dim">0{{ i + 1 }}</span>
            <div class="w-14 h-14 mx-auto mb-5 bg-nv-green/10 rounded-full flex items-center justify-center text-nv-green group-hover:bg-nv-green/15 transition-colors duration-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                <path v-if="i === 0" stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                <path v-if="i === 1" stroke-linecap="round" stroke-linejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                <path v-if="i === 2" stroke-linecap="round" stroke-linejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
              </svg>
            </div>
            <h3 class="font-display text-xl text-nv-text mb-3">{{ step.title }}</h3>
            <p class="text-sm text-nv-muted leading-relaxed">{{ step.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <SectionsFeaturedSection />
    <SectionsTestimonialSection />

    <!-- CTA Banner -->
    <section class="nv-section">
      <div class="nv-container">
        <div
          v-motion
          :initial="{ opacity: 0, y: 24 }"
          :visible-once="{ opacity: 1, y: 0, transition: { duration: 700 } }"
          class="relative bg-nv-surface border border-nv-border rounded-[16px] p-10 sm:p-16 text-center overflow-hidden"
        >
          <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-nv-green/[0.06] blur-[80px] rounded-full pointer-events-none" />
          <div class="relative z-10">
            <h2 class="nv-heading text-3xl sm:text-4xl mb-4">Ready to <em class="text-nv-green italic">elevate</em> your next meal?</h2>
            <p class="text-nv-muted text-base sm:text-lg max-w-lg mx-auto mb-8">Join thousands who discovered a better way to enjoy restaurant-quality food at home.</p>
            <NuxtLink to="/menu" class="inline-flex items-center gap-2 bg-nv-green hover:bg-nv-green-dk text-nv-void font-semibold text-sm px-8 py-4 rounded-[10px] transition-all duration-300 active:scale-[0.97]">
              Start Ordering
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
