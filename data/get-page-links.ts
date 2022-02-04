import { capitalCase } from 'case-anything'
import matter from 'gray-matter'
import groupBy from 'lodash.groupby'
import { Project } from 'ts-morph'

const project = new Project()
const sourceFiles = project.addSourceFilesAtPaths([
  `src/pages/**/*{.tsx,.mdx}`,
  `!src/pages/_*.tsx`,
  `!src/pages/api/*.ts`,
])

/** Gather meta information for page links from the NextJS pages directory. */
export function getPageLinks() {
  const allPageLinks = sourceFiles
    .filter((sourceFile) => {
      return (
        sourceFile.getDirectory().getBaseName() !== 'pages' && // Skip pages directory
        !sourceFile.getFilePath().includes('[') // Skip dynamic files
      )
    })
    .map((sourceFile) => {
      const slug = sourceFile
        .getFilePath()
        .replace(`${process.cwd()}/src/pages/`, '')
        .replace('index', '')
        .slice(0, -5)
      const [categorySlug] = slug.split('/')
      const category = capitalCase(categorySlug)
      let name = sourceFile.getBaseNameWithoutExtension()

      if (sourceFile.getExtension() === '.mdx') {
        const { data } = matter(sourceFile.getText())
        name = data.title || name
      }

      // Skip top-level category pages for now
      if (name.toLowerCase() === category.toLowerCase()) {
        return null
      }

      return {
        name: capitalCase(name),
        category: category,
        slug: `/${slug}`,
      }
    })
    .filter(Boolean)
  const groupedLinks = groupBy(allPageLinks, 'category')

  return groupedLinks
}
