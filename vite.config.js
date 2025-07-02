import { fileURLToPath, URL } from 'node:url'
import process from 'node:process'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'
  const isGitHubPages =
    process.env.GITHUB_ACTIONS === 'true' || process.env.DEPLOY_TARGET === 'github-pages'

  return {
    base: isGitHubPages ? '/baby-bookshelf/' : '/',

    plugins: [
      vue(),
      vueJsx(),
      !isProd && vueDevTools(),
      AutoImport({
        resolvers: [VantResolver()],
        imports: ['vue', 'vue-router', 'pinia'],
        dts: true,
      }),
      Components({
        resolvers: [VantResolver()],
        dts: true,
      }),
    ].filter(Boolean),

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },

    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: !isProd,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('vant')) return 'vant'
              if (id.includes('vue') || id.includes('pinia')) return 'vendor'
            }
          },
        },
      },
    },

    server: {
      port: 3000,
      host: true,
    },

    preview: {
      port: 3000,
      host: true,
    },
  }
})
