<script setup lang="ts">
useHead({ title: 'About — Nuvé', meta: [{ name: 'description', content: 'Learn about Nuvé — our mission to connect you with the finest curated cloud kitchens.' }] })

const values = [
  { title: 'Curated Quality', description: 'Every partner kitchen is handpicked. We taste, evaluate, and maintain standards so you never have to wonder.' },
  { title: 'Sustainable Sourcing', description: 'We champion kitchens that prioritize local, seasonal ingredients and eco-friendly packaging.' },
  { title: 'Seamless Experience', description: 'From discovery to doorstep, every touchpoint is designed to feel effortless and premium.' },
]
</script>

<template>
  <div class="pt-24 pb-16">
    <div class="nv-container">
      <!-- Hero -->
      <div class="max-w-3xl mb-20">
        <span class="text-nv-green text-sm font-medium tracking-wider uppercase mb-3 block">Our Story</span>
        <h1 class="nv-heading text-4xl sm:text-5xl lg:text-6xl mb-6">
          A new standard for <em class="text-nv-green italic">food delivery</em>
        </h1>
        <p class="text-nv-muted text-lg leading-relaxed">
          Nuvé was born from a simple frustration: why does ordering food online feel so impersonal? We believe every meal
          should be an experience — curated with the same care a great host brings to their table. We partner exclusively
          with kitchens that share our obsession with quality, flavour, and presentation.
        </p>
      </div>

      <!-- Values -->
      <div class="mb-20">
        <h2 class="nv-heading text-2xl sm:text-3xl mb-10">What we <em class="text-nv-green italic">stand for</em></h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div
            v-for="(val, i) in values"
            :key="i"
            v-motion
            :initial="{ opacity: 0, y: 24 }"
            :visible-once="{ opacity: 1, y: 0, transition: { duration: 700, delay: i * 80 } }"
            class="bg-nv-surface border border-nv-border rounded-[12px] p-8 hover:border-nv-green/30 transition-colors duration-300"
          >
            <span class="text-nv-green font-display text-3xl mb-4 block">0{{ i + 1 }}</span>
            <h3 class="font-body font-semibold text-nv-text text-lg mb-3">{{ val.title }}</h3>
            <p class="text-sm text-nv-muted leading-relaxed">{{ val.description }}</p>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="bg-nv-surface border border-nv-border rounded-[16px] p-10 sm:p-14">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p class="text-3xl sm:text-4xl font-display text-nv-text"><UiAnimatedCounter :target="120" suffix="+" /></p>
            <p class="text-sm text-nv-muted mt-2">Partner Kitchens</p>
          </div>
          <div>
            <p class="text-3xl sm:text-4xl font-display text-nv-text"><UiAnimatedCounter :target="50" suffix="k+" /></p>
            <p class="text-sm text-nv-muted mt-2">Orders Delivered</p>
          </div>
          <div>
            <p class="text-3xl sm:text-4xl font-display text-nv-text"><UiAnimatedCounter :target="15" /></p>
            <p class="text-sm text-nv-muted mt-2">Cuisine Types</p>
          </div>
          <div>
            <p class="text-3xl sm:text-4xl font-display text-nv-text"><UiAnimatedCounter :target="98" suffix="%" /></p>
            <p class="text-sm text-nv-muted mt-2">Satisfaction Rate</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
