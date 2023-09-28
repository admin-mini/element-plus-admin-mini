import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import dynamicProxy from './vite.dynamic.proxy'
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    dynamicProxy({
      path: new RegExp('^/api'),
      default: 'https://mock.apifox.cn/m1/3332315-0-default/'
    })
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/style/var.scss" as *;`
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  base: 'dist',
  server: {
    host: '0.0.0.0',
    port: 9988
  }
})
