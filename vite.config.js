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
export default defineConfig({
  plugins: [
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
      default: 'http://localhost:8098',
      changeOrigin: false
    }),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/assets/svg-icon')],
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
  // 显式预构建：这些依赖仅在懒加载路由/组件中被引用，若不提前构建，
  // 首次进入对应页面时 Vite 会在运行中重新预构建，导致旧依赖 URL 失效，
  // 出现 “504 Outdated Optimize Dep” 并中断正在进行的动态 import。
  optimizeDeps: {
    include: ['sm-crypto-v2', 'echarts', 'vue-cropper', 'sortablejs']
  },
  base: '/element-plus-admin-mini',
  server: {
    host: '0.0.0.0',
    port: 9988
  }
})
