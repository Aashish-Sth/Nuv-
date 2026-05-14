<script setup lang="ts">
import { useIntersectionObserver } from "@vueuse/core";
import { ref } from "vue";

interface Props {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

const props = withDefaults(defineProps<Props>(), {
  suffix: "",
  prefix: "",
  duration: 3000,
});

const current = ref(0);
const el = ref<HTMLElement | null>(null);
const hasAnimated = ref(false);

onMounted(() => {
  useIntersectionObserver(el, ([{ isIntersecting }]) => {
    if (isIntersecting && !hasAnimated.value) {
      hasAnimated.value = true;
      animateCount();
    }
  });
});

function animateCount() {
  current.value = 0;
  const start = performance.now();
  const step = (timestamp: number) => {
    const progress = Math.min((timestamp - start) / props.duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    current.value = Math.floor(eased * props.target);
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      current.value = props.target;
    }
  };
  requestAnimationFrame(step);
}
</script>

<template>
  <span ref="el" class="tabular-nums">
    {{ prefix }}{{ current.toLocaleString() }}{{ suffix }}
  </span>
</template>
