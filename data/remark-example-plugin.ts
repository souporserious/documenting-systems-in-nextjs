import { readFileSync } from 'fs'
import { basename, resolve } from 'path'
import { kebabCase } from 'case-anything'

/**
 * Custom Remark plugin to add Example meta data attributes.
 */
export function remarkExamplePlugin({ examples }) {
  return (tree, file) => {
    /** Parse Example components: <Example source="./Example.tsx" />  */
    tree.children.forEach((node, index) => {
      /**
       * Instead of filtering out, we skip over so we can use the index to look
       * up the nearest heading
       */
      if (node.type === 'mdxJsxFlowElement' && node.name === 'Example') {
        const sourceAttribute = node.attributes.find(
          (attribute) => attribute.name === 'source'
        )
        const examplePath = resolve(file.dirname, sourceAttribute.value)

        try {
          const codeString = readFileSync(examplePath, 'utf-8')

          /**
           * Add `code` and `filename` props used in live examples.
           */
          node.attributes.push({
            type: 'mdxJsxAttribute',
            name: 'code',
            value: codeString,
          })

          const filename = basename(sourceAttribute.value)
          node.attributes.push({
            type: 'mdxJsxAttribute',
            name: 'filename',
            value: filename,
          })

          /**
           * Add the example file path in development so we can generate API
           * endpoints to open a developer's local editor.
           */
          if (process.env.NODE_ENV === 'development') {
            node.attributes.push({
              type: 'mdxJsxAttribute',
              name: 'path',
              value: examplePath,
            })
          }

          /**
           * Use the second-level heading that precedes this example as the title.
           */
          let title
          const headingNode = tree.children
            .slice(0, index)
            .reverse()
            .find((node) => node.type === 'heading' && node.depth === 2)

          if (headingNode) {
            title = headingNode.children[0].value
          } else {
            title = filename
          }

          examples.push({
            title,
            slug: kebabCase(title),
            code: codeString,
            filename,
          })
        } catch (error) {
          console.log(
            `Error parsing example source: Make sure example exists.`,
            error
          )
        }
      }
    })
  }
}
