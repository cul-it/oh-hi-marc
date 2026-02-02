import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'

function getGitCommitHash(): string {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim()
  } catch {
    return 'dev'
  }
}

export default defineConfig({
  base: '/oh-hi-marc/',
  plugins: [react()],
  define: {
    __COMMIT_HASH__: JSON.stringify(getGitCommitHash()),
  },
})
