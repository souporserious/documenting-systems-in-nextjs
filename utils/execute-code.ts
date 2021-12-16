import { jsx } from 'components/CreateElement'
import { AddSourceProps } from './add-source-props-plugin'

let swc = null

export async function transformCode(codeString: string) {
  if (swc === null) {
    const module = await import('@swc/wasm-web')
    await module.default()
    swc = module
  }
  const result = swc.transformSync(codeString, {
    filename: 'index.tsx',
    jsc: {
      transform: {
        react: {
          pragma: 'jsx',
          useBuiltins: true,
          development: false,
        },
      },
      parser: {
        syntax: 'typescript',
        tsx: true,
      },
    },
    module: {
      type: 'commonjs',
    },
    plugin: (program) => new AddSourceProps().visitProgram(program),
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
