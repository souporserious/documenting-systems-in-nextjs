import * as React from 'react'

/**
 * Uses SWC to compile a string of TypeScript code at runtime.
 *
 * @example
 *
 * import { useCompiledCode, useComponent } from 'hooks'
 *
 * export default function Preview() {
 *   const compiledCodeString = useCompiledCode('export default () => <div>Hello World</div>')
 *   const Component = useComponent(compiledCodeString)
 *   return Component ? <Component /> : null
 * }
 */
export function useCompiledCode(codeString) {
  const swc = React.useRef(null)
  const compile = React.useCallback((codeString) => {
    const result = swc.current.transformSync(codeString, {
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: true,
        },
        transform: {
          react: {
            runtime: 'automatic',
          },
        },
      },
      module: {
        type: 'commonjs',
      },
    })
    setCompiledCodeString(result.code)
  }, [])
  const [compiledCodeString, setCompiledCodeString] = React.useState(null)

  React.useEffect(() => {
    import('@swc/wasm-web').then(async (module) => {
      await module.default()
      swc.current = module
      if (codeString) {
        compile(codeString)
      }
    })
  }, [])

  React.useEffect(() => {
    if (swc.current && codeString) {
      compile(codeString)
    }
  }, [codeString])

  return compiledCodeString
}
