import * as React from 'react'
import * as jsxRuntime from 'react/jsx-runtime'
import * as mdxReact from '@mdx-js/react'
import * as components from 'components'
import * as hooks from 'hooks'
import * as styledComponents from 'styled-components'
import useIsomorphicLayoutEffect from 'use-isomorphic-layout-effect'
import { getComponent } from 'utils/get-component'

/**
 * Execute a string of code and return the default export.
 * Supports TypeScript and JSX syntax.
 *
 * @example
 *
 * import { useComponent } from 'hooks'
 *
 * export default function Example() {
 *   const element = useComponent(`exports.default = () => require('react').createElement('div', null, 'Hello World')`)
 *   return element
 * }
 */
export function useComponent(codeString): React.ReactNode | null {
  const [component, setComponent] = React.useState(null)

  useIsomorphicLayoutEffect(() => {
    const component = getComponentWithDependencies(codeString)
    if (component) {
      const element = React.createElement(component)
      setComponent(element)
    }
  }, [codeString])

  return component
}

function getComponentWithDependencies(codeString: string) {
  return getComponent(codeString, {
    react: React,
    'react/jsx-runtime': jsxRuntime,
    '@mdx-js/react': mdxReact,
    'styled-components': styledComponents,
    components,
    hooks,
  })
}
