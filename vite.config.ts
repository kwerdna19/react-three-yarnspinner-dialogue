import { resolve, basename } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import * as packageJson from './package.json'
import * as tsConfig from './tsconfig.json'


export default defineConfig({
  plugins: [react(), dts({
    insertTypesEntry: true,
    copyDtsFiles: true,
    beforeWriteFile(filePath, content) {
      const output = basename(packageJson.types)
      if(basename(filePath) === output) {
        const typePathImports = tsConfig.compilerOptions.types.map(t => `import '${t}'`)
        return {
          filePath,
          content: `${typePathImports.join('\n')}\n\n${content}`
        }
      }
        
    },

  })],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/lib.ts'),
      name: 'ReactThreeYarnSpinnerDialogue',
      // the proper extensions will be added
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
