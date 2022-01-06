import { Directory } from 'ts-morph'
import { kebabCase } from 'case-anything'
import { transformCode } from './transform-code'

export async function getExamples(directory: Directory) {
  const directoryName = directory.getBaseName()
  const examples = directory.getSourceFiles('examples/*.tsx')
  const examplesData = await Promise.all(
    examples.map(async (example) => {
      const exampleName = example.getBaseNameWithoutExtension()
      const exampleCodeString = example.getFullText()
      const transformedCodeString = await transformCode(exampleCodeString)
      return {
        name: exampleName,
        code: exampleCodeString,
        compiledCode: transformedCodeString,
        parentSlug: kebabCase(directoryName),
        slug: kebabCase(exampleName),
        path:
          process.env.NODE_ENV === 'development' ? example.getFilePath() : null,
      }
    })
  )
  return examplesData
}
