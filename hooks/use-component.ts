import * as React from 'react'
import * as jsxRuntime from 'react/jsx-runtime'
import * as mdxReact from '@mdx-js/react'
import * as components from 'components'
import * as hooks from 'hooks'
import { getComponent } from 'utils/get-component'

/**
 * Execute a string of code and return the default export.
 * Supports TypeScript and JSX syntax.
 *
 * @example
 *
 * import { useComponent } from 'hooks'
 *
 * export default function BasicUsage() {
 *   const Component = useComponent(`exports.default = () => require('react').createElement('div', null, 'Hello World')`)
 *   return <Component />
 * }
 */
export function useComponent(codeString) {
  return React.useMemo(
    () =>
      getComponent(codeString, {
        react: React,
        'react/jsx-runtime': jsxRuntime,
        '@mdx-js/react': mdxReact,
        components,
        hooks,
      }),
    [codeString]
  )
}
