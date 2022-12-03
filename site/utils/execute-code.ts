import { jsx } from 'components/CreateElement'
import type { Result } from './add-source-prop-plugin'
import { addSourceProp } from './add-source-prop-plugin'

let transform = null

export async function transformCode(
  codeString: string,
  onReady: (result: Result) => void
) {
  if (transform === null) {
    const module = await import('@babel/standalone')
    transform = module.transform
  }
  const result = transform(codeString, {
    filename: 'index.tsx',
    presets: ['env', 'typescript', ['react', { pragma: 'jsx' }]],
    plugins: [[addSourceProp, { onReady }]],
  })
  return result.code
}

export async function executeCode(
  codeString: string,
  dependencies: Record<string, unknown>,
  onReady: (result: Result) => void
) {
  const transformedCode = await transformCode(codeString, onReady)
  const exports: Record<string, unknown> = {}
  const require = (path) => {
    if (dependencies[path]) {
      return dependencies[path]
    }
    throw Error(`Module not found: ${path}.`)
  }
  const result = new Function('exports', 'require', 'jsx', transformedCode)

  result(exports, require, jsx)

  return exports.default
}
