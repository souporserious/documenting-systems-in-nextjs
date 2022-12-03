import { resolve } from 'node:path'
import { register } from 'esbuild-register/dist/node'

const { unregister } = register()
const [configFilePath] = process.argv.slice(2)

export const config = require(resolve(process.cwd(), configFilePath))
  .default as {
  basePath: string
  themePath: string
}

unregister()
