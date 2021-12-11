import * as React from 'react'
import * as jsxRuntime from 'react/jsx-runtime'
import * as System from 'system'
import { getComponent } from 'utils/get-component'

export function useComponent(codeString) {
  return React.useMemo(
    () =>
      getComponent(codeString, {
        react: React,
        'react/jsx-runtime': jsxRuntime,
        system: System,
      }),
    [codeString]
  )
}
