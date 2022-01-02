import * as React from 'react'
import { useCompiledCode, useComponent } from 'hooks'
import { Editor } from 'components'

export function Playground({
  code,
  codeString,
  compiledCodeString,
}: {
  /** Children of the code element used to display highlighted code. */
  code?: React.ReactNode

  /** A code string compiled by the `useCompiledCode` hook and rendered as the preview. */
  codeString?: string

  /** A compiled code string rendered as the preview. */
  compiledCodeString?: string
}) {
  const [value, setValue] = React.useState(null)
  const localCompiledCodeString = useCompiledCode(
    compiledCodeString ? value : codeString
  )
  const Preview = useComponent(
    value
      ? localCompiledCodeString
      : compiledCodeString || localCompiledCodeString
  )
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
        boxShadow: '0 0 0 1px #474f6e',
        // borderRadius: 8,
        // overflow: 'hidden',
      }}
    >
      <Editor
        lineNumbers={false}
        folding={false}
        fontSize={13}
        value={codeString}
        onChange={setValue}
      />

      <pre
        onClick={() => setValue(codeString)}
        style={{
          paddingLeft: 12,
          borderRadius: 0,
          backgroundColor: '#101218',
          overflow: 'auto',
        }}
      >
        <code>{code || codeString}</code>
      </pre>

      {Preview ? <Preview /> : null}
    </div>
  )
}
