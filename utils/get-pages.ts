import { promises as fs } from 'fs'
import * as path from 'path'
import { kebabCase } from 'case-anything'
import { transformCode } from 'utils/transform-code'

export async function getComponents() {
  const fileNames = (
    await fs.readdir(path.resolve(process.cwd(), 'components'))
  ).filter((file) => !file.startsWith('index'))
  return fileNames.map((fileName) => {
    return {
      name: fileName,
      slug: kebabCase(fileName),
    }
  })
}

export async function getExamples() {
  const components = (
    await fs.readdir(path.resolve(process.cwd(), 'components'))
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

            const exampleCodeString = (
              await fs.readFile(
                path.resolve(examplesPath, exampleFileName),
                'utf8'
              )
            ).replace(/from '..'/g, "from 'system'")

            const transformedCodeString = await transformCode(exampleCodeString)

            return {
              component,
              slug: exampleSlug,
              name: exampleFileName,
              code: transformedCodeString,
            }
          })
        )
      } catch {
        console.log(`No examples found for ${component}`)
      }
      return examples
    })
  )

  return examples.flat()
}
