import * as React from 'react'
import dynamic from 'next/dynamic'
import { useCompiledCode, useComponent } from 'hooks'

const Editor = dynamic(async () => (await import('../Editor')).Editor, {
  ssr: false,
})

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
  const [isEditorMounted, setIsEditorMounted] = React.useState(false)
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
      <div style={{ display: 'grid' }}>
        <div style={{ gridArea: '1 / 1' }}>
          {value && (
            <Editor
              lineNumbers={false}
              folding={false}
              fontSize={13}
              value={value}
              onChange={setValue}
              onMount={() => setIsEditorMounted(true)}
            />
          )}
        </div>
        {!isEditorMounted && (
          <pre
            onClick={() => setValue(codeString)}
            style={{
              gridArea: '1 / 1',
              paddingLeft: 10,
              borderRadius: 0,
              backgroundColor: '#101218',
              overflow: 'auto',
              zIndex: 1,
            }}
          >
            <code>{code || codeString}</code>
          </pre>
        )}
      </div>

      {Preview ? <Preview /> : null}
    </div>
  )
}
