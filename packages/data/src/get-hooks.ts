import { kebabCase } from 'case-anything'
import { Node } from 'ts-morph'

import { transformCode } from './transform-code'
import { hooksSourceFile } from './index'

export async function getHooks() {
  const allHooks = await Promise.all(
    Array.from(hooksSourceFile.getExportedDeclarations()).map(
      async ([name, [declaration]]) => {
        if (!Node.isFunctionDeclaration(declaration)) {
          return null
        }

        const path = declaration.getSourceFile().getFilePath()
        const [doc] = declaration.getJsDocs()
        let description: ReturnType<typeof doc.getComment> | null = null
        let examples:
          | Array<string>
          | Array<{ code: string; compiledCode: string }> = []

        if (doc) {
          description = doc.getComment()
          examples = doc
            .getTags()
            .filter((tag) => tag.getTagName() === 'example')
            .map((tag) => tag.getCommentText())
            .filter(Boolean) as Array<string>
        }

        if (examples) {
          const compiledExamples = await Promise.all(
            examples.map(transformCode)
          )
          examples = examples.map((codeString, index) => ({
            code: codeString,
            compiledCode: compiledExamples[index],
          }))
        }

        return {
          description,
          examples,
          name,
          slug: kebabCase(name),
          path:
            process.env.NODE_ENV === 'development'
              ? path
              : path.replace(process.cwd(), ''),
        }
      }
    )
  )

  return allHooks.filter(Boolean) as Array<{
    description: string | null
    examples: Array<string> | Array<{ code: string; compiledCode: string }>
    name: string
    slug: string
    path: string
  }>
}
