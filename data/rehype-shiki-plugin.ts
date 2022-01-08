// Forked from: https://github.com/rsclarke/rehype-shiki
import hastToString from 'hast-util-to-string'
import * as shiki from 'shiki'
import { access, findAll, findIndexPath } from 'tree-visit'

function tokensToHast(lines: shiki.IThemedToken[][]) {
  const tree = []

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

function highlightBlock(
  highlighter: shiki.Highlighter,
  theme: shiki.Theme,
  node: any
) {
  const language = getLanguage(node)
  if (language) {
    const tokens = highlighter.codeToThemedTokens(
      hastToString(node),
      language,
      theme,
      { includeExplanation: false }
    )
    node.children = tokensToHast(tokens)
  }
}

export async function getHighlighter(theme: string) {
  const loadedTheme = await shiki.loadTheme(theme)
  const highlighter = await shiki.getHighlighter({
    theme: loadedTheme,
    langs: ['js', 'jsx', 'ts', 'tsx'],
  })
  return {
    theme: loadedTheme,
    highlighter,
  }
}

const getChildren = (node) => node.children || []

export function rehypeShikiPlugin({
  theme,
  highlighter,
}: {
  theme: shiki.Theme
  highlighter: shiki.Highlighter
}) {
  return async function transformer(tree) {
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
      highlightBlock(highlighter, theme, node)
    })
  }
}
