import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const projectRoot = process.cwd()
const distDir = resolve(projectRoot, 'dist')
const docsDir = resolve(projectRoot, 'docs')

if (!existsSync(distDir)) {
  console.error('dist directory not found. Run the GitHub Pages build first.')
  process.exit(1)
}

rmSync(docsDir, { recursive: true, force: true })
mkdirSync(docsDir, { recursive: true })
cpSync(distDir, docsDir, { recursive: true })
writeFileSync(resolve(docsDir, '.nojekyll'), '')

console.log('Synced dist/ to docs/ for GitHub Pages deployment.')
