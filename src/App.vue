<script setup lang="ts">
import { apps } from '@/constants/app';

const openMiniApp = (app: any) => {}
</script>

<template>
  <main class="container w-screen h-screen bg-gray-100 p-6 box-border overflow-x-hidden">
    <div
      class="app-item flex items-center gap-4 px-4 py-2 rounded-md bg-white shadow-md hover:bg-gray-200 overflow-hidden"
      v-for="app in apps" 
      :key="app.appId"
      @click="openMiniApp(app)"
    >
      <img class="app-logo w-10 h-10 rounded-md" :src="app.logo" />
      <span class="text-base">{{ app.name }}</span>
    </div>
  </main>
</template>