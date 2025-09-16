// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static', // 👈 this tells Astro to pre-render all pages
});
