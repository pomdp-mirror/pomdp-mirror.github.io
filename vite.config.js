import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig(({ mode }) => {
  const version = mode === 'review' ? 'review' : 'public'

  return {
    base: `/${version}/`,
    build: {
      outDir: `dist/${version}`,
    },
    resolve: {
      alias: {
        '@publication': fileURLToPath(new URL(`./src/publication.${version}.js`, import.meta.url)),
      },
    },
    plugins: [
      react(),
      {
        name: 'publication-metadata',
        transformIndexHtml(html) {
          return html.replace('__PAGE_TITLE__', version === 'review' ? 'MIRROR | Anonymous Review' : 'MIRROR | CoRL 2026')
        },
      },
    ],
  }
})
