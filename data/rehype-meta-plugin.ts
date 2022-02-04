import { visit } from 'tree-visit'
import { transformSync } from '@swc/core'
import { options } from './transform-code'

// https://github.com/wooorm/xdm#syntax-highlighting-with-the-meta-field
const re = /\b([-\w]+)(?:=(?:"([^"]*)"|'([^']*)'|([^"'\s]+)))?/g

export function rehypeMetaPlugin() {
  return (tree) => {
    visit(tree, {
      getChildren: (node) => node.children || [],
      onEnter(node) {
        let match

        if (node.tagName === 'code' && node.data?.meta) {
          const codeString = node.children[0].value
          node.properties.codeString = codeString
          node.properties.compiledCodeString = transformSync(
            codeString,
            options
          ).code
        }

        if (node.tagName === 'code' && node.data?.meta) {
          re.lastIndex = 0 // Reset regex.

          while ((match = re.exec(node.data.meta))) {
            node.properties[match[1]] = match[2] || match[3] || match[4] || ''
          }
        }
      },
    })
  }
}
