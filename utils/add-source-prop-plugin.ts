// adapted from: https://gisthub.com/babel/babel/blob/master/packages/babel-plugin-transform-react-jsx-source/
import type { PluginObj, PluginPass } from '@babel/core'
import jsx from '@babel/plugin-syntax-jsx'
import * as t from '@babel/types'

export type Position = {
  startLine: number
  startColumn: number
  endLine: number
  endColumn: number
}

export type Node = {
  name: string
  position: Position
}

export type Result = {
  list: Array<Node>
  tree: Array<
    Node & {
      children: Array<Array<Node>>
    }
  >
}

const TRACE_ID = '__jsxSource'
const FILE_NAME_ID = '__jsxFileName'

function makeTrace({ startLine, startColumn, endLine, endColumn }) {
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
    startLineProperty,
    startColumnProperty,
    endLineProperty,
    endColumnProperty,
  ])
}

export function addSourceProp(): PluginObj<PluginPass> {
  return {
    inherits: jsx,
    visitor: {
      Program: {
        enter() {
          this.tree = []
          this.list = []
        },
        exit(_, state) {
          state.opts.onReady({
            tree: this.tree[0],
            list: this.list,
          })
        },
      },
      JSXElement: {
        enter(path, state) {
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

            const position = {
              startLine: path.node.loc.start.line,
              startColumn: path.node.loc.start.column,
              endLine: path.node.loc.end.line,
              endColumn: path.node.loc.end.column,
            }
            const trace = makeTrace(position)

            path.node.openingElement.attributes.push(
              t.jsxAttribute(
                t.jsxIdentifier(TRACE_ID),
                t.jsxExpressionContainer(trace)
              )
            )

            this.tree.push({
              name: path.node.openingElement.name.name,
              position,
              children: [],
            })

            this.list.push({
              name: path.node.openingElement.name.name,
              position,
            })
          }
        },
        exit() {
          if (this.tree.length > 1) {
            const child = this.tree.pop()
            const parent = this.tree[this.tree.length - 1]
            parent.children.push(child)
          }
        },
      },
    },
  }
}
