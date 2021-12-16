// adapted from: https://gisthub.com/babel/babel/blob/master/packages/babel-plugin-transform-react-jsx-source/
import type { PluginObj, PluginPass } from '@babel/core'
import jsx from '@babel/plugin-syntax-jsx'
import * as t from '@babel/types'

const TRACE_ID = '__jsxSource'
const FILE_NAME_ID = '__jsxFileName'

function makeTrace(
  fileNameIdentifier,
  startLine,
  startColumn,
  endLine,
  endColumn
) {
  const fileNameProperty = t.objectProperty(
    t.identifier('fileName'),
    fileNameIdentifier
  )
  const startLineProperty = t.objectProperty(
    t.identifier('startLine'),
    startLine != null ? t.numericLiteral(startLine) : t.nullLiteral()
  )
  const startColumnProperty = t.objectProperty(
    t.identifier('startColumn'),
    startColumn != null ? t.numericLiteral(startColumn) : t.nullLiteral()
  )
  const endLineProperty = t.objectProperty(
    t.identifier('endLine'),
    endLine != null ? t.numericLiteral(endLine) : t.nullLiteral()
  )
  const endColumnProperty = t.objectProperty(
    t.identifier('endColumn'),
    endColumn != null ? t.numericLiteral(endColumn) : t.nullLiteral()
  )
  return t.objectExpression([
    fileNameProperty,
    startLineProperty,
    startColumnProperty,
    endLineProperty,
    endColumnProperty,
  ])
}

export default function (): PluginObj<PluginPass> {
  return {
    inherits: jsx,
    visitor: {
      JSXElement(path, state) {
        if (
          path.node.openingElement.name.name !== 'Fragment' &&
          path.node.openingElement.name.property?.name !== 'Fragment'
        ) {
          if (!state.fileNameIdentifier) {
            const fileName = state.filename || ''
            const fileNameIdentifier =
              path.scope.generateUidIdentifier(FILE_NAME_ID)
            const scope = path.hub.getScope()
            if (scope) {
              scope.push({
                id: fileNameIdentifier,
                init: t.stringLiteral(fileName),
              })
            }
            state.fileNameIdentifier = fileNameIdentifier
          }

          console.log(path)

          const trace = makeTrace(
            state.fileNameIdentifier,
            path.node.loc.start.line,
            path.node.loc.start.column,
            path.node.loc.end.line,
            path.node.loc.end.column
          )

          path.node.openingElement.attributes.push(
            t.jsxAttribute(
              t.jsxIdentifier(TRACE_ID),
              t.jsxExpressionContainer(trace)
            )
          )
        }
      },
    },
  }
}
