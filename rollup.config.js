import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'

export default [
  {
    input: 'packages/vue/src/index.ts',
    output: [
      {
        sourcemap: true,
        file: './packages/vue/dist/vue.esm-bundler.js',
        format: 'es',
        name: 'Vue'
      }
    ],
    plugins: [
      typescript({
        sourceMap: true,
        tsconfig: './tsconfig.json'
      }),
      nodeResolve(),
      commonjs()
    ]
  },
  {
    input: 'packages/reactivity/src/index.ts',
    output: [
      {
        sourcemap: true,
        file: './packages/reactivity/dist/reactivity.esm-bundler.js',
        format: 'es',
        name: 'VueReactivity'
      }
    ],
    plugins: [
      typescript({
        sourceMap: true,
        tsconfig: './tsconfig.json'
      }),
      nodeResolve(),
      commonjs()
    ]
  }
]
