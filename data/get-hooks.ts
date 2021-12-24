import { readdirSync } from 'fs'
import * as path from 'path'
import { camelCase } from 'case-anything'
import { Node } from 'ts-morph'
import { transformCode } from './transform-code'
import { hooksSourceFile } from './project'

const hooksDirectory = path.resolve(process.cwd(), 'hooks')
const hooks = readdirSync(hooksDirectory).filter(
  (file) => !file.startsWith('index')
)

export async function getHooks() {
  let docs = {}

  hooksSourceFile.getExportedDeclarations().forEach(([declaration]) => {
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
      const hookPath = path.resolve(hooksDirectory, fileName)
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
        hookData.path = hookPath
      }

      return hookData
    })
  )
}
