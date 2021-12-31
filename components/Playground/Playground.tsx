import * as React from 'react'
import { useCompiledCode, useComponent } from 'hooks'

export function Playground({
  codeString,
  compiledCodeString,
}: {
  codeString?: string
  compiledCodeString?: string
}) {
  const localCompiledCodeString = useCompiledCode(
    compiledCodeString ? null : codeString
  )
  const Preview = useComponent(compiledCodeString || localCompiledCodeString)
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
        borderRadius: 8,
        boxShadow: '0 0 0 1px #474f6e',
        overflow: 'hidden',
      }}
    >
      <pre
        style={{
          borderRadius: 0,
          backgroundColor: '#101218',
          overflow: 'auto',
        }}
      >
        <code>{codeString}</code>
      </pre>
      {Preview ? <Preview /> : null}
    </div>
  )
}
