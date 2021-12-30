const { build } = require('esbuild')
const { spawn } = require('child_process')
const { dependencies } = require('../package.json')

build({
  entryPoints: ['cli/index.tsx'],
  outdir: 'cli/dist',
  bundle: true,
  platform: 'node',
  target: 'es2019',
  tsconfig: 'cli/tsconfig.json',
  external: Object.keys(dependencies),
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
}).then(executeBuildCommand)

let child = null

function executeBuildCommand() {
  if (child) {
    child.kill()
  }
  child = spawn('node', ['cli/dist'], { stdio: 'inherit' })
}
