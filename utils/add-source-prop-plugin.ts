import type { PluginObj, PluginPass } from '@babel/core'
import jsx from '@babel/plugin-syntax-jsx'
import * as t from '@babel/types'

// adapted from: https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-react-jsx-source/
const TRACE_ID = '__jsxSource'
const FILE_NAME_ID = '__jsxFileName'

function makeTrace(fileNameIdentifier, lineNumber, columnBased) {
  const fileNameProperty = t.objectProperty(
    t.identifier('fileName'),
    fileNameIdentifier
  )
  const lineNumberProperty = t.objectProperty(
    t.identifier('lineNumber'),
    lineNumber != null ? t.numericLiteral(lineNumber) : t.nullLiteral()
  )
  const columnNumberProperty = t.objectProperty(
    t.identifier('columnNumber'),
    columnBased != null ? t.numericLiteral(columnBased + 1) : t.nullLiteral()
  )
  return t.objectExpression([
    fileNameProperty,
    lineNumberProperty,
    columnNumberProperty,
  ])
}

export function addSourceProps(path, state, cache) {
  if (
    path.node.name.name !== 'Fragment' &&
    path.node.name.property?.name !== 'Fragment'
  ) {
    const location = path.container.openingElement.loc
    if (!state.fileNameIdentifier) {
      const fileName = state.filename || ''
      const fileNameIdentifier = path.scope.generateUidIdentifier(FILE_NAME_ID)
      const scope = path.hub.getScope()
      if (scope) {
        scope.push({
          id: fileNameIdentifier,
          init: t.stringLiteral(fileName),
        })
      }
      state.fileNameIdentifier = fileNameIdentifier
    }

    const trace = makeTrace(
      state.fileNameIdentifier,
      location.start.line,
      location.start.column
    )

    path.node.attributes.push(
      t.jsxAttribute(t.jsxIdentifier(TRACE_ID), t.jsxExpressionContainer(trace))
    )
  }
}

export default function (): PluginObj<PluginPass> {
  let cache
  return {
    inherits: jsx,
    visitor: {
      Program: {
        enter() {
          cache = new Set()
        },
      },
      JSXOpeningElement(path, state) {
        addSourceProps(path, state, cache)
      },
    },
  }
}
