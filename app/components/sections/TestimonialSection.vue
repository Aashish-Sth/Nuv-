<script setup lang="ts">
const activeIndex = ref(0)

const testimonials = [
  {
    quote: "Nuvé changed how I think about food delivery. Every dish arrives like it was plated a moment ago — warm, beautiful, and full of flavor.",
    name: 'Sophia Chen',
    role: 'Food Enthusiast',
    rating: 5,
  },
  {
    quote: "The curation is what sets them apart. I trust every restaurant on the platform, and the delivery is always immaculate.",
    name: 'Marcus Rivera',
    role: 'Regular Customer',
    rating: 5,
  },
  {
    quote: "As a chef, I'm particular about quality. Nuvé's partnership model lets us maintain our standards while reaching more people.",
    name: 'Chef Anika Patel',
    role: 'Partner Kitchen Owner',
    rating: 5,
  },
]

let interval: ReturnType<typeof setInterval>

onMounted(() => {
  interval = setInterval(() => {
    activeIndex.value = (activeIndex.value + 1) % testimonials.length
  }, 6000)
})

onUnmounted(() => {
  clearInterval(interval)
})

function setActive(i: number) {
  activeIndex.value = i
  clearInterval(interval)
  interval = setInterval(() => {
    activeIndex.value = (activeIndex.value + 1) % testimonials.length
  }, 6000)
}
</script>

<template>
  <section class="nv-section">
    <div class="nv-container">
      <!-- Header -->
      <div class="text-center mb-14">
        <span class="text-nv-green text-sm font-medium tracking-wider uppercase mb-2 block">Testimonials</span>
        <h2 class="nv-heading text-3xl sm:text-4xl">
          What our <em class="text-nv-green italic">guests</em> say
        </h2>
      </div>

      <!-- Testimonial card -->
      <div class="max-w-3xl mx-auto">
        <div class="relative bg-nv-surface border border-nv-border rounded-[16px] p-8 sm:p-12">
          <!-- Quote mark -->
          <svg class="absolute top-6 left-6 w-10 h-10 text-nv-green/15" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
          </svg>

          <Transition name="fade" mode="out-in">
            <div :key="activeIndex">
              <!-- Stars -->
              <div class="flex gap-1 mb-6 pt-4">
                <svg
                  v-for="s in testimonials[activeIndex].rating"
                  :key="s"
                  class="w-4 h-4 text-nv-green"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>

              <blockquote class="text-lg sm:text-xl text-nv-text leading-relaxed font-light mb-8">
                "{{ testimonials[activeIndex].quote }}"
              </blockquote>

              <div>
                <p class="font-semibold text-nv-text">{{ testimonials[activeIndex].name }}</p>
                <p class="text-sm text-nv-muted">{{ testimonials[activeIndex].role }}</p>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Dots -->
        <div class="flex justify-center gap-2 mt-6">
          <button
            v-for="(_, i) in testimonials"
            :key="i"
            class="w-2 h-2 rounded-full transition-all duration-300"
            :class="i === activeIndex ? 'bg-nv-green w-6' : 'bg-nv-border hover:bg-nv-dim'"
            :aria-label="`Testimonial ${i + 1}`"
            @click="setActive(i)"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 400ms cubic-bezier(0.16, 1, 0.3, 1),
              transform 400ms cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
