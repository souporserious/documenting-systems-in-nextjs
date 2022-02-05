import * as esbuild from 'esbuild'
import wasmLoader from 'esbuild-plugin-wasm'

export function bundleDependencies() {
  return Promise.all(
    ['components', 'hooks', 'utils'].map((path) =>
      esbuild.build({
        entryPoints: [`${path}/index.ts`],
        outfile: `.data/${path}-bundle.js`,
        bundle: true,
        minify: true,
        platform: 'node',
        target: 'esnext',
        plugins: [wasmLoader()],
        external: ['react', 'react-dom', 'styled-components'],
      })
    )
  )
}
