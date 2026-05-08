<script setup lang="ts">
interface Props {
  label: string
  variant?: 'filled' | 'outlined' | 'subtle'
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'filled',
  size: 'sm',
})

const classes = computed(() => {
  const base = 'inline-flex items-center font-body font-medium transition-colors duration-300'
  const sizes = {
    sm: 'px-2.5 py-0.5 text-xs rounded-full',
    md: 'px-3 py-1 text-sm rounded-full',
  }
  const variants = {
    filled: 'bg-nv-green-lt/15 text-nv-green-lt',
    outlined: 'border border-nv-border text-nv-muted',
    subtle: 'bg-nv-edge text-nv-muted',
  }
  return [base, sizes[props.size], variants[props.variant]].join(' ')
})
</script>

<template>
  <span :class="classes">{{ label }}</span>
</template>
