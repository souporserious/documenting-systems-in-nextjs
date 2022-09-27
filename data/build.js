const { build } = require('esbuild')
const { spawn } = require('child_process')
const { dependencies } = require('../package.json')

build({
  entryPoints: ['data/index.ts'],
  outdir: 'data/dist',
  bundle: true,
  platform: 'node',
  target: 'es2019',
  sourcemap: true,
  tsconfig: 'data/tsconfig.json',
  external: Object.keys(dependencies).filter(
    (dependency) => dependency !== 'xdm'
  ),
  watch: process.argv.includes('--watch')
    ? {
        onRebuild(error) {
          console.log('rebuilding...')
          if (error) {
            console.error(error)
          } else {
            executeBuildCommand()
          }
        },
      }
    : false,
})

let child = null

function getOption(name) {
  return process.argv.includes(`--${name}`) ? `--${name}` : undefined
}

function executeBuildCommand() {
  if (child) {
    child.kill()
  }
  child = spawn(
    'pnpm',
    ['build:data', getOption('watch'), getOption('debug')].filter(Boolean),
    { stdio: 'inherit' }
  )
}

executeBuildCommand()
