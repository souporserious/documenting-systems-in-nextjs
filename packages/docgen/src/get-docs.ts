import { kebabCase } from 'case-anything'

import { parseMDX } from './parse-mdx'
import { docsSourceFiles } from './index'

export async function getDocs() {
  const allMDXDocs = await Promise.all(
    docsSourceFiles.map((sourceFile) =>
      parseMDX(
        sourceFile.getFilePath(),
        sourceFile.getSourceFile().getFullText()
      )
    )
  )

  const allDocs = docsSourceFiles.map((sourceFile, index) => {
    const path = sourceFile.getFilePath()
    const baseName = sourceFile.getBaseName()
    const mdx = allMDXDocs[index]
    const name = mdx.data?.title ?? baseName.replace(/\.mdx$/, '')

    return {
      mdx,
      name: mdx.data?.title ?? name.replace(/\.mdx$/, ''),
      slug: kebabCase(name),
      path:
        process.env.NODE_ENV === 'development'
          ? path
          : path.replace(process.cwd(), ''),
    }
  })

  return allDocs
}
