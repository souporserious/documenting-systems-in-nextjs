import loader from '@monaco-editor/loader'
import { wireTmGrammars } from 'monaco-editor-textmate'
import { Registry } from 'monaco-textmate'
import { loadWASM } from 'onigasm'
import type { AsyncReturnType } from 'type-fest'
import { allTypes } from '.data/types'

import theme from '../theme.json'
import defineTheme from './define-theme'

export type Monaco = AsyncReturnType<typeof loader.init>

export type InitializeMonacoOptions = {
  container: HTMLElement
  monaco: Monaco
  defaultValue?: string
  id?: number
  onChange?: (value: string) => void
  onOpenEditor?: (input: any, source: any) => void
}

export async function initializeMonaco({
  container,
  monaco,
  defaultValue = '',
  id = 0,
  onChange = () => null,
  onOpenEditor = () => null,
}: InitializeMonacoOptions) {
  // @ts-ignore
  const onigasm = await import('onigasm/lib/onigasm.wasm')

  try {
    await loadWASM(onigasm.default)
  } catch {
    // try/catch prevents onigasm from erroring on fast refreshes
  }

  const registry = new Registry({
    getGrammarDefinition: async (scopeName) => {
      switch (scopeName) {
        case 'source.js':
          return {
            format: 'json',
            content: await (await fetch('/JavaScript.tmLanguage.json')).text(),
          }
        case 'source.ts':
          return {
            format: 'json',
            content: await (await fetch('/TypeScript.tmLanguage.json')).text(),
          }
        case 'source.tsx':
          return {
            format: 'json',
            content: await (
              await fetch('/TypeScriptReact.tmLanguage.json')
            ).text(),
          }
        default:
          return null
      }
    },
  })

  const grammars = new Map()

  grammars.set('javascript', 'source.js')
  grammars.set('typescript', 'source.ts')
  grammars.set('typescript', 'source.tsx')

  const model = monaco.editor.createModel(
    defaultValue,
    'typescript',
    monaco.Uri.parse(`file:///index-${id}.tsx`)
  )

  const editor = monaco.editor.create(container, {
    model,
    language: 'typescript',
    contextmenu: false,
    lineNumbers: 'off',
    theme: 'vs-dark',
    fontSize: 18,
    minimap: { enabled: false },
  })

  // @ts-ignore
  const editorService = editor._codeEditorService
  const openEditorBase = editorService.openCodeEditor.bind(editorService)

  editorService.openCodeEditor = async (input, source) => {
    const result = await openEditorBase(input, source)
    if (result === null) {
      onOpenEditor(input, source)
    }
    return result
  }

  defineTheme(monaco, theme)

  await wireTmGrammars(monaco, registry, grammars, editor)

  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.Latest,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    esModuleInterop: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    reactNamespace: 'React',
    allowJs: true,
    typeRoots: ['node_modules/@types'],
  })

  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  })

  const subscription = editor.onDidChangeModelContent(() => {
    onChange(editor.getValue())
  })

  editor.focus()

  /**
   * Load React types
   * alternatively, you can use: https://github.com/lukasbach/monaco-editor-auto-typings
   */
  fetch('https://unpkg.com/@types/react/index.d.ts')
    .then((response) => response.text())
    .then((types) => {
      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        types,
        'file:///node_modules/react/index.d.ts'
      )
    })

  /**
   * Load types for components and hooks
   */
  allTypes.forEach((typeDef) => {
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      typeDef.code,
      typeDef.path
    )
  })

  return { editor, subscription }
}
