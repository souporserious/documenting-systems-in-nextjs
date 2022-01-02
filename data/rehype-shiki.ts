// Forked from: https://github.com/rsclarke/rehype-shiki
import * as shiki from 'shiki'
import { access, findAll, findIndexPath } from 'tree-visit'
import hastToString from 'hast-util-to-string'

function tokensToHast(lines: shiki.IThemedToken[][]) {
  let tree = []

  for (const line of lines) {
    if (line.length === 0) {
      tree.push({ type: 'text', value: '\n' })
    } else {
      for (const token of line) {
        let style = `color: ${token.color};`

        if (token.fontStyle & shiki.FontStyle.Italic) {
          style += ' font-style: italic;'
        }
        if (token.fontStyle & shiki.FontStyle.Bold) {
          style += ' font-weight: bold;'
        }
        if (token.fontStyle & shiki.FontStyle.Underline) {
          style += ' text-decoration: underline;'
        }

        tree.push({
          type: 'element',
          tagName: 'span',
          properties: { style },
          children: [{ type: 'text', value: token.content }],
        })
      }

      tree.push({ type: 'text', value: '\n' })
    }
  }

  // Remove last newline
  tree.pop()

  return tree
}

function getLanguage(node: any) {
  const props = (node.properties || {}) as Record<string, string[]>
  const className = props.className || []
  let value: string

  for (const element of className) {
    value = element

    if (value.slice(0, 9) === 'language-') {
      return value.slice(9)
    }
  }

  return null
}

function highlightBlock(highlighter: shiki.Highlighter, node: any) {
  const language = getLanguage(node)
  if (language) {
    const tokens = highlighter.codeToThemedTokens(hastToString(node), language)
    node.children = tokensToHast(tokens)
  }
}

async function getTheme(theme: string) {
  return shiki.loadTheme(theme)
}

async function getHighlighter(theme: string) {
  const loadedTheme = await getTheme(theme)
  return shiki.getHighlighter({
    theme: loadedTheme,
    langs: [],
  })
}

const getChildren = (node) => node.children || []

export default function attacher({ theme }: { theme?: string } = {}) {
  return async function transformer(tree) {
    const highlighter = await getHighlighter(theme)
    const languageCodeBlocks = findAll(tree, {
      getChildren,
      predicate: (node) => {
        const indexPath = findIndexPath(tree, {
          getChildren,
          predicate: (nodeToCompare) => nodeToCompare === node,
        })
        const parentIndexPath = indexPath.slice(0, -1)
        const parentNode = access(tree, parentIndexPath, { getChildren })
        return node.type === 'element'
          ? parentNode.tagName === 'pre' && node.tagName === 'code'
          : false
      },
    })

    languageCodeBlocks.forEach((node) => {
      highlightBlock(highlighter, node)
    })
  }
}
