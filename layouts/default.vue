<template>
  <div class="min-h-screen flex flex-col bg-white">
    <header class="navbar bg-white border-b border-gray-100 shadow-sm">
      <div class="container mx-auto">
        <div class="flex-1">
          <NuxtLink to="/" class="text-2xl font-extrabold">
            <span class="font-thin">VIVEK</span><span class="font-extrabold">JOSHY</span>
          </NuxtLink>
        </div>
        <div class="flex-none">
          <ul class="menu menu-horizontal px-1">
            <li><NuxtLink to="/" class="hover:text-accent">Home</NuxtLink></li>
            <li><NuxtLink to="/resume" class="hover:text-accent">Resume</NuxtLink></li>
          </ul>
        </div>
      </div>
    </header>
    
    <main class="flex-grow container mx-auto p-4 bg-white">
      <slot />
    </main>
    
    <footer class="bg-gray-50 py-6 border-t border-gray-100">
      <div class="container mx-auto text-center">
        <p>© {{ new Date().getFullYear() }} Vivek Joshy. All rights reserved.</p>
        <div class="mt-2 flex justify-center gap-4">
          <a href="mailto:contact@vivekjoshy.com" class="text-accent hover:opacity-75">
            <i class="fa-regular fa-envelope"></i>
          </a>
          <a href="https://github.com/vivekjoshy" target="_blank" rel="noopener noreferrer" class="text-accent hover:opacity-75">
            <i class="fa-brands fa-github"></i>
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// Default layout
</script> 