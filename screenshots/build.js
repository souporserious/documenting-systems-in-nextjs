const { build } = require('esbuild')
const { spawn } = require('child_process')
const { dependencies } = require('../package.json')

build({
  entryPoints: ['screenshots/index.ts'],
  outdir: 'screenshots/dist',
  bundle: true,
  platform: 'node',
  target: 'es2019',
  tsconfig: 'screenshots/tsconfig.json',
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
}).then(executeBuildCommand)

let child = null

function executeBuildCommand() {
  if (child) {
    child.kill()
  }
  child = spawn('node', ['screenshots/dist'], { stdio: 'inherit' })
}
