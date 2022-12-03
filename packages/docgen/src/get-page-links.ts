import { capitalCase } from 'case-anything'
import matter from 'gray-matter'
import groupBy from 'lodash.groupby'
import sortBy from 'lodash.sortby'
import { Project, SourceFile } from 'ts-morph'

const project = new Project()
const sourceFiles = project.addSourceFilesAtPaths([
  `pages/**/*{.tsx,.mdx,.json}`,
  `!pages/_*.tsx`,
  `!pages/api/*.ts`,
])

/** Gathers meta information for page links from the NextJS pages directory. */
export function getPageLinks() {
  const allPageMetaData = Object.fromEntries(
    sourceFiles
      .filter((sourceFile) => sourceFile.getExtension() === '.json')
      .map((sourceFile) => {
        const slug = getSlugFromSourceFile(sourceFile)
        const [categorySlug] = slug.split('/')
        const data = JSON.parse(sourceFile.getFullText())

        return [categorySlug, data]
      })
  )
  const allPageLinks = sourceFiles
    .filter((sourceFile) => {
      return (
        !sourceFile.getFilePath().includes('[') && // Skip dynamic files
        sourceFile.getDirectory().getBaseName() !== 'pages' && // Skip pages directory
        sourceFile.getExtension() !== '.json' // Skip meta.json files
      )
    })
    .map((sourceFile) => {
      const slug = getSlugFromSourceFile(sourceFile)
      const [categorySlug, baseSlug] = slug.split('/')
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
        name: name === 'index' ? category : capitalCase(name),
        slug: `/${slug}`,
        baseSlug,
        categorySlug,
      }
    })
    .filter(Boolean)
  const groupedLinks = groupBy(allPageLinks, 'categorySlug')
  const orderedLinks = Object.fromEntries(
    Object.entries(groupedLinks).map(([categorySlug, links]) => {
      const metaData = allPageMetaData[categorySlug]
      const category = capitalCase(categorySlug)

      return [
        metaData?.title || category,
        sortBy(links, (link) => metaData?.order.indexOf(link.baseSlug) ?? 0),
      ]
    })
  )

  return orderedLinks
}

function getSlugFromSourceFile(sourceFile: SourceFile) {
  return sourceFile
    .getFilePath()
    .replace(`${process.cwd()}/pages/`, '')
    .replace('index', '')
    .replace('.tsx', '')
}
