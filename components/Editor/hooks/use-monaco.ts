// modified from: https://github.com/suren-atoyan/monaco-react/blob/master/src/Editor/Editor.js
import * as React from 'react'
import loader from '@monaco-editor/loader'
import { useRouter } from 'next/router'
import { kebabCase } from 'case-anything'
import { initializeMonaco } from '../utils/initialize-monaco'
import type { Monaco } from '../utils/initialize-monaco'

export type MonacoOptions = {
  containerRef: React.RefObject<HTMLElement>
  value?: string
  id?: number
  onChange?: (value: string) => void
  decorationRange?: {
    startLine: number
    startColumn: number
    endLine: number
    endColumn: number
  }
}

export function useMonaco({
  containerRef,
  value,
  id,
  onChange,
  decorationRange,
}: MonacoOptions) {
  const router = useRouter()
  const [isMounting, setIsMounting] = React.useState(true)
  const monacoRef = React.useRef<Monaco>(null)
  const editorRef = React.useRef<ReturnType<Monaco['editor']['create']>>(null)
  const disposeRef = React.useRef(null)
  const decorationsRef = React.useRef([])

  React.useEffect(() => {
    const cancelable = loader.init()

    cancelable
      .then(async (monaco) => {
        const result = await initializeMonaco({
          container: containerRef.current,
          monaco,
          defaultValue: value,
          id,
          onChange,
          onOpenEditor: (input) => {
            const [base, filename] = input.resource.path
              .replace('/node_modules/', '') // trim node_modules prefix used by Monaco Editor
              .replace('.d.ts', '') // trim .d.ts suffix from decalaration
              .split('/') // finally split the path into an array
            if (base === 'components' || base === 'hooks') {
              router.push(
                filename === 'index'
                  ? `/${base}`
                  : `/${base}/${kebabCase(filename)}`
              )
            }
          },
        })
        monacoRef.current = monaco
        editorRef.current = result.editor
        disposeRef.current = result.dispose
        setIsMounting(false)
      })
      .catch((error) => {
        if (error?.type !== 'cancelation') {
          console.error('Monaco initialization: error:', error)
        }
      })

    return () => {
      if (editorRef.current) {
        disposeRef.current()
      } else {
        cancelable.cancel()
      }
    }
  }, [])

  React.useEffect(() => {
    if (editorRef.current && editorRef.current.getValue() !== value) {
      const currentModel = editorRef.current.getModel()
      if (currentModel) {
        editorRef.current.executeEdits('', [
          {
            range: currentModel.getFullModelRange(),
            text: value,
            forceMoveMarkers: true,
          },
        ])
        editorRef.current.pushUndoStop()
      } else {
        editorRef.current.setValue(value)
      }
    }
  }, [value])

  React.useEffect(() => {
    if (isMounting) return

    const oldDecorations = decorationsRef.current

    if (decorationRange) {
      decorationsRef.current = [
        {
          range: new monacoRef.current.Range(
            decorationRange.startLine,
            decorationRange.startColumn,
            decorationRange.endLine,
            decorationRange.endColumn
          ),
          options: {
            className: 'line-decorator',
            isWholeLine: true,
          },
        },
      ]
    } else {
      decorationsRef.current = []
    }

    editorRef.current.deltaDecorations(oldDecorations, decorationsRef.current)

    return () => {
      // Hack for now to remove decorations correctly
      // https://github.com/microsoft/monaco-editor/issues/269#issuecomment-530098836
      Array.from(document.querySelectorAll('.line-decorator')).forEach(
        (element) => {
          element.classList.remove('line-decorator')
        }
      )
    }
  }, [decorationRange, isMounting, value])
}
