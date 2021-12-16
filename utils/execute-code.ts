import { jsx } from 'components/CreateElement'
import addSourcePropPlugin from './add-source-prop-plugin'

let transform = null

export async function transformCode(codeString: string) {
  if (transform === null) {
    const module = await import('@babel/standalone')
    transform = module.transform
  }
  const result = transform(codeString, {
    filename: 'index.tsx',
    presets: ['env', 'typescript', ['react', { pragma: 'jsx' }]],
    plugins: [
      [addSourcePropPlugin, { onTreeReady: (tree) => console.log(tree) }],
    ],
  })
  return result.code
}

export async function executeCode(
  codeString: string,
  dependencies: Record<string, unknown>
) {
  const transformedCode = await transformCode(codeString)
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
