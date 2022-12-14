import { resolve } from 'node:path'

export default {
  basePath: resolve(process.cwd(), '../../site'),
  themePath: resolve(process.cwd(), 'theme.json'),
}
