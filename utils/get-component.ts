import { MdxContentProps } from 'xdm/complex-types'

export function getComponent(
  codeString: string,
  dependencies: Record<string, unknown>
) {
  const exports: Record<string, unknown> = {}
  const require = (path) => {
    if (dependencies[path]) {
      return dependencies[path]
    }
    throw Error(`Module not found: ${path}.`)
  }
  const result = new Function('exports', 'require', codeString)

  result(exports, require)

  return exports.default as React.ComponentType<MdxContentProps>
}
