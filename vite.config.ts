import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vue(),
    // Removed lovable-tagger import and componentTagger
    // other plugins can be added here
  ],
});