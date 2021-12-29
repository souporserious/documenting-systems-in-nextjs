import * as React from 'react'
import { useComponent } from 'hooks'

export function Playground({ code, tokens }: { code: string; tokens?: any }) {
  const Component = useComponent(code)

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
      }}
    >
      <pre>{code}</pre> <Component />
    </div>
  )
}
