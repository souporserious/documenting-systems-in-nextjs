import { kebabCase } from 'case-anything'
import { Node } from 'ts-morph'
import { transformCode } from './transform-code'
import { utilsSourceFile } from './project'

export async function getUtils() {
  return Promise.all(
    Array.from(utilsSourceFile.getExportedDeclarations())
      .map(async ([name, [declaration]]) => {
        if (!Node.isFunctionDeclaration(declaration)) {
          return null
        }

        const path = declaration.getSourceFile().getFilePath()
        const [doc] = declaration.getJsDocs()
        let description = null
        let examples = []

        if (doc) {
          description = doc.getComment()
          examples = doc
            .getTags()
            .filter((tag) => tag.getTagName() === 'example')
            .map((tag) => tag.getCommentText())
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
      })
      .filter(Boolean)
  )
}
