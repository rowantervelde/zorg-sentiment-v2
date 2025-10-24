<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// Global error handling
const error = useError();

if (error.value) {
  console.error('Application error:', error.value);
}
</script>
