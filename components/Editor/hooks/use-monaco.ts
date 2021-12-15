// modified from: https://github.com/suren-atoyan/monaco-react/blob/master/src/Editor/Editor.js
import * as React from 'react'
import loader from '@monaco-editor/loader'
import { useRouter } from 'next/router'
import { initializeMonaco } from '../utils/initialize-monaco'
import type { Monaco } from '../utils/initialize-monaco'

export type MonacoOptions = {
  containerRef: React.RefObject<HTMLElement>
  value?: string
  id?: number
  onChange?: (value: string) => void
}

export function useMonaco({
  containerRef,
  value,
  id,
  onChange,
}: MonacoOptions) {
  const router = useRouter()
  const [isMounting, setIsMounting] = React.useState(true)
  const monacoRef = React.useRef<Monaco>(null)
  const editorRef = React.useRef(null)
  const disposeRef = React.useRef(null)

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
            const slug = input.resource.path
              .replace('/node_modules/', '')
              .replace('.d.ts', '')
              .replace('/index', '')
            if (slug.includes('components') || slug.includes('hooks')) {
              router.push(slug)
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
}
