import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import dynamicProxy from './vite.dynamic.proxy'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import UnoCSS from 'unocss/vite'
export default defineConfig({
  plugins: [
    UnoCSS(),
    vue(),
    vueJsx(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: true,
      resolvers: [
        ElementPlusResolver()
        // (name) => {
        //   if (name === 'dict') {
        //     return {
        //       from: '@/utils/dict', // 模块路径
        //       name: ['getDict', 'default'] // 导出的名称（如果需要导出默认模块）
        //     }
        //   }
        // }
      ]
    }),
    // Components({
    //   resolvers: [ElementPlusResolver()]
    // }),
    dynamicProxy({
      path: new RegExp('^/api'),
      default: 'http://vue.ruoyi.vip/prod-api/',
      changeOrigin: false
    }),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'svg-icon')],
      symbolId: 'icon-[dir]-[name]',
      svgoOptions: false
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
      '~': path.resolve(__dirname, './'),
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
  base: '/element-plus-admin-mini',
  server: {
    host: '0.0.0.0',
    port: 9988
  },
  build: {
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, 'index.html'),
        notice: path.resolve(__dirname, 'notice.html')
      }
    }
  }
})
