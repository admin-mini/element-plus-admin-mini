import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import dynamicProxy from './vite.dynamic.proxy'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import UnpluginSvgComponent from 'unplugin-svg-component/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    }),
    dynamicProxy({
      path: new RegExp('^/api'),
      default: 'http://vue.ruoyi.vip/prod-api/',
      changeOrigin: false
    }),
    UnpluginSvgComponent({
      // 指定需要缓存的图标文件夹
      iconDir: [path.resolve(process.cwd(), 'svg-icon-origin')],
      // 指定symbolId格式
      symbolIdFormatter: (svgName) => svgName.replace(/\.svg$/, ''),
      svgSpriteDomId: '__svg__icons__dom__',
      scanStrategy: 'text'
    })
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: ['legacy-js-api'],
        additionalData: `@use "@/style/var.scss" as *;`
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  base: '/element-plus-admin-mini',
  server: {
    host: '0.0.0.0',
    port: 9988
  }
})
