import fs from 'fs/promises'
import { parseMDX } from './parse-mdx'

export async function getReadme(directoryPath) {
  const readmePath = `${directoryPath}/README.mdx`
  let readmeContents = null

  try {
    readmeContents = await fs.readFile(readmePath, 'utf-8')
  } catch (error) {
    // Bail if README.mdx not found since it isn't required
    return null
  }

  return parseMDX(readmePath, readmeContents)
}
