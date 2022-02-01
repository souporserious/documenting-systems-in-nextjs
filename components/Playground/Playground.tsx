import * as React from 'react'
import dynamic from 'next/dynamic'
import { useCompiledCode } from 'hooks'
import { CompiledComponent, Spinner } from 'components'

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
  const [focusRange, setFocusRange] = React.useState(null)
  const [value, setValue] = React.useState(null)
  const localCompiledCodeString = useCompiledCode(
    compiledCodeString ? value : codeString
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
              focusRange={focusRange}
              onChange={setValue}
              onMount={() => setIsEditorMounted(true)}
            />
          )}
        </div>

        {!isEditorMounted && (
          <pre
            onClick={(event) => {
              const rect = event.currentTarget.getBoundingClientRect()
              const charWidth = 7.83
              const lineHeight = 20
              const paddingOffsetLeft = 10
              const x = event.clientX - rect.left - paddingOffsetLeft
              const y = event.clientY - rect.top
              const columnPosition = x / charWidth
              const column =
                Math.max(
                  0,
                  columnPosition % Math.floor(columnPosition) > 0.5
                    ? Math.ceil(columnPosition)
                    : Math.floor(columnPosition)
                ) + 1
              const lineNumber = Math.max(0, Math.ceil(y / lineHeight))
              setFocusRange({ column, lineNumber })
              setValue(codeString)
            }}
            style={{
              gridArea: '1 / 1',
              paddingLeft: 10,
              lineHeight: 0,
              borderRadius: 0,
              backgroundColor: '#101218',
              overflow: 'auto',
              zIndex: 1,
            }}
          >
            <code>{code || codeString}</code>
          </pre>
        )}

        {value && !isEditorMounted && (
          <div
            style={{
              gridArea: '1 / 1',
              placeSelf: 'start end',
              padding: 4,
              zIndex: 2,
            }}
          >
            <Spinner
              size="sm"
              primaryColor="rgba(255,255,255,0.75)"
              secondaryColor="rgba(255,255,255,0.5)"
            />
          </div>
        )}
      </div>

      <CompiledComponent
        codeString={
          value
            ? localCompiledCodeString
            : compiledCodeString || localCompiledCodeString
        }
      />
    </div>
  )
}
