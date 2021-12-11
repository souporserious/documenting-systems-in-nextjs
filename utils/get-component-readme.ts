import { promises as fs } from 'fs'
import * as path from 'path'
import { pascalCase } from 'case-anything'
import { compile } from 'xdm'
import { transformCode } from 'utils/transform-code'

export async function getComponentReadme(componentSlug) {
  const componentReadmePath = path.resolve(
    process.cwd(),
    'components',
    `${pascalCase(componentSlug)}/README.mdx`
  )
  const componentReadmeContents = await fs.readFile(
    componentReadmePath,
    'utf-8'
  )
  const compiledReadme = await compile(componentReadmeContents)
  const transformedReadme = await transformCode(compiledReadme.value)
  return transformedReadme
}
