import { promises as fs } from 'fs'
import * as path from 'path'
import { Project, Node } from 'ts-morph'
import { camelCase } from 'case-anything'
import { transformCode } from './transform-code'

const hooksDirectory = path.resolve(process.cwd(), 'hooks')
const project = new Project({
  tsConfigFilePath: path.resolve(process.cwd(), 'tsconfig.json'),
})

export async function getHooks() {
  const hooks = (await fs.readdir(hooksDirectory)).filter(
    (file) => !file.startsWith('index')
  )
  const sourcePath = path.resolve(process.cwd(), hooksDirectory, 'index.ts')

  console.log(`Generating docs for hooks at: ${sourcePath}`)

  const sourceFile = project.getSourceFile(sourcePath)
  const exportedDeclarations = sourceFile.getExportedDeclarations()
  let docs = {}

  exportedDeclarations.forEach(([declaration]) => {
    if (Node.isFunctionDeclaration(declaration)) {
      const [doc] = declaration.getJsDocs()

      if (doc) {
        docs[declaration.getName()] = {
          description: doc.getComment(),
          examples: doc
            .getTags()
            .filter((tag) => tag.getTagName() === 'example')
            .map((tag) => tag.getCommentText()),
        }
      }
    }
  })

  return Promise.all(
    hooks.map(async (fileName) => {
      const extension = path.extname(fileName).slice(1)
      const name = path.basename(fileName, `.${extension}`)
      const doc = docs[camelCase(name)]
      let hookExamples = doc.examples

      if (hookExamples) {
        const compiledExamples = await Promise.all(
          hookExamples.map((codeString) => {
            const reactImport = `import React from 'react'\n`
            return transformCode(reactImport + codeString)
          })
        )
        hookExamples = hookExamples.map((codeString, index) => ({
          code: codeString,
          compiledCode: compiledExamples[index],
        }))
      } else {
        hookExamples = null
      }

      const hookData = {
        name: camelCase(name),
        slug: name,
        path: null,
        description: doc.description,
        examples: hookExamples,
      }

      if (process.env.NODE_ENV === 'development') {
        hookData.path = path.resolve(hooksDirectory, fileName)
      }

      return hookData
    })
  )
}
