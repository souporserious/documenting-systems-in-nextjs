import { kebabCase } from 'case-anything'
import { promises as fs } from 'fs'
import * as path from 'path'
import { componentsSourceFile } from './project'
import { transformCode } from './transform-code'

export async function getComponentExamples() {
  const components = (
    await fs.readdir(componentsSourceFile.getDirectoryPath())
  ).filter((file) => !file.startsWith('index'))
  const examples = await Promise.all(
    components.map(async (componentFileName) => {
      const component = kebabCase(componentFileName)
      let examples = []
      try {
        const examplesPath = path.resolve(
          process.cwd(),
          'components',
          componentFileName,
          'examples'
        )
        examples = await fs.readdir(examplesPath)
        examples = await Promise.all(
          examples.map(async (exampleFileName) => {
            const exampleSlug = kebabCase(
              path.basename(exampleFileName, `.tsx`)
            )

            const examplePath = path.resolve(examplesPath, exampleFileName)
            const exampleCodeString = (
              await fs.readFile(examplePath, 'utf8')
            ).replace(/from '..'/g, "from 'system'")

            const transformedCodeString = await transformCode(exampleCodeString)

            const exampleData = {
              componentSlug: component,
              slug: exampleSlug,
              name: exampleFileName,
              code: exampleCodeString,
              compiledCode: transformedCodeString,
              path: null,
            }

            if (process.env.NODE_ENV === 'development') {
              exampleData.path = examplePath
            }

            return exampleData
          })
        )
      } catch {
        // console.log(`No examples found for ${component}`)
      }
      return examples
    })
  )

  return examples.flat()
}
