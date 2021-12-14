const { build } = require('esbuild')
const { dependencies } = require('../package.json')

build({
  entryPoints: ['data/generate-data.ts'],
  outdir: 'data/dist',
  bundle: true,
  platform: 'node',
  target: 'es2019',
  external: Object.keys(dependencies).filter((dep) => dep !== 'xdm'),
  tsconfig: 'tsconfig-node.json',
})
