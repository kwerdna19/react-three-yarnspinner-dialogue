import { resolve, relative } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import * as packageJson from './package.json'

export default defineConfig({
  plugins: [react(), dts({
    copyDtsFiles: true,
    insertTypesEntry: true,
    beforeWriteFile(filePath, content) {
        if(content.includes('from "yarn-bound"') || content.includes('from \'yarn-bound\'')) {
          const relPath = relative(resolve(filePath, '..'), resolve(__dirname, 'dist', 'types', 'yarn-bound.d.ts'))
          const importPath = relPath.startsWith('.') ? relPath : `./${relPath}`
          return {
            filePath,
            content: `/// <reference types="${importPath}" />\n${content}`
          }
        }
    },
  })],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/lib.ts'),
      name: 'ReactThreeYarnSpinnerDialogue',
      fileName: 'react-three-yarnspinner-dialogue',
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: [...Object.keys(packageJson.peerDependencies)],
      output: {
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM',
          'three': 'three',
          'yarn-bound': 'YarnBound',
          '@react-three/fiber': 'ReactThreeFiber'
        }
      }
    },
  }
})
