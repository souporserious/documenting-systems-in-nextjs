import * as esbuild from 'esbuild'
import { promises as fs } from 'fs'
import matter from 'gray-matter'
import { dirname, resolve } from 'path'
import remarkFrontmatter from 'remark-frontmatter'
import { StringDecoder } from 'string_decoder'
import xdm from 'xdm/esbuild.js'
import type { Options } from 'xdm/lib/integration/esbuild'
import { rehypeMetaPlugin } from './rehype-meta-plugin'
import { getHighlighter, rehypeShikiPlugin } from './rehype-shiki-plugin'
import { remarkPlugin } from './remark-plugin'
import { transformCode } from './transform-code.js'

let highlighter = null

export async function getReadme(directoryPath) {
  const readmePath = `${directoryPath}/README.mdx`
  let readmeContents = null

  try {
    readmeContents = await fs.readFile(readmePath, 'utf-8')
  } catch (error) {
    // Bail if README.mdx not found since it isn't required
    return null
  }

  try {
    const result = matter(readmeContents)

    if (highlighter === null) {
      highlighter = await getHighlighter(
        resolve(process.cwd(), 'theme/code.json')
      )
    }

    const { code, examples } = await transformReadme(readmePath)

    return {
      data: result.data,
      code,
      examples,
    }
  } catch (error) {
    throw Error(`Error parsing README.mdx at "${readmePath}": ${error}`)
  }
}

async function transformReadme(readmePath) {
  let data = null
  const examples = []
  const xdmOptions: Options = {
    providerImportSource: '@mdx-js/react',
    remarkPlugins: [
      remarkFrontmatter,
      [remarkPlugin, { examples, onData: (parsedYaml) => (data = parsedYaml) }],
    ],
    rehypePlugins: [rehypeMetaPlugin, [rehypeShikiPlugin, highlighter]],
  }
  const result = await esbuild.build({
    entryPoints: [readmePath],
    absWorkingDir: dirname(readmePath),
    target: 'esnext',
    format: 'esm',
    bundle: true,
    write: false,
    minify: process.env.NODE_ENV === 'production',
    plugins: [xdm(xdmOptions)],
    external: ['react', 'react-dom', '@mdx-js/react'],
  })
  const bundledReadme = new StringDecoder('utf-8').write(
    Buffer.from(result.outputFiles[0].contents)
  )
  const transformedReadme = await transformCode(bundledReadme)

  return {
    code: transformedReadme,
    data,
    examples,
  }
}
