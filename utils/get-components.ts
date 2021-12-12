import { promises as fs } from 'fs'
import * as path from 'path'
import { kebabCase } from 'case-anything'

const componentsDirectory = path.resolve(process.cwd(), 'components')

export async function getComponents() {
  const components = (await fs.readdir(componentsDirectory)).filter(
    (file) => !file.startsWith('index')
  )
  return components.map((fileName) => {
    const componentData = {
      name: fileName,
      slug: kebabCase(fileName),
      path: null,
    }

    if (process.env.NODE_ENV === 'development') {
      componentData.path = path.resolve(
        componentsDirectory,
        fileName,
        `${fileName}.tsx`
      )
    }

    return componentData
  })
}
