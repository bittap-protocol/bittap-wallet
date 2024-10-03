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
      :font-size="computedFontSize"
      text-anchor="middle"
    >
      {{ formattedName }}
    </text>
  </svg>
</template>

<script setup lang="ts">
import { defineComponent, computed } from 'vue';

defineComponent({
  name: 'IconAutoTokenName',
});

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
});

const formattedName = computed(() => {
  if (props.name.length > 5) {
    return props.name.substring(0, 5).toUpperCase();
  } else {
    return props.name.toUpperCase();
  }
});

const minFontSize = 100;
const maxFontSize = 80;
const maxNameLengthForMinSize = 2;
const maxNameLengthForMaxSize = 5;

const computedFontSize = computed(() => {
  const nameLength = props.name.length;
  if (nameLength <= maxNameLengthForMinSize) {
    return minFontSize + '%';
  } else if (nameLength >= maxNameLengthForMaxSize) {
    return maxFontSize + '%';
  } else {
    const scaleFactor = (maxFontSize - minFontSize) / (maxNameLengthForMaxSize - maxNameLengthForMinSize);
    return ((nameLength - maxNameLengthForMinSize) * scaleFactor + minFontSize) + '%';
  }
});
</script>