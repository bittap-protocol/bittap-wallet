<script setup lang="ts">
import { defineComponent, defineProps } from 'vue'

defineComponent({
  name: 'IconAutoTokenName',
})

defineProps({
  name: {
    type: String,
    required: true,
  },
})
</script>
<template>
  <svg
    class="img"
    width="36"
    height="36"
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="18"
      cy="18"
      r="16"
      fill="#8000FF"
      stroke="none"
      stroke-width="2"
    />
    <text
      x="18"
      y="22"
      fill="white"
      :font-size="name.length > 5 ? '80%' : '100%'"
      text-anchor="middle"
    >
      {{ name && name.length > 5 ? name.substring(0, 5).toUpperCase() : name.toUpperCase() }}
    </text>
  </svg>
</template>
