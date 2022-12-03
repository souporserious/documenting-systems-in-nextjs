import * as esbuild from 'esbuild'
import matter from 'gray-matter'
import { dirname, resolve } from 'node:path'
import { StringDecoder } from 'node:string_decoder'
import type { AsyncReturnType } from 'type-fest'
import { config } from './config'

import { getHeadingsFromMarkdown } from './get-headings-from-markdown'
import { rehypeMetaPlugin } from './rehype-meta-plugin'
import { getHighlighter, rehypeShikiPlugin } from './rehype-shiki-plugin'
import { remarkPlugin } from './remark-plugin'
import { transformCode } from './transform-code'

export async function parseMDX(path: string, contents: string) {
  try {
    const result = matter(contents)

    /** Provide a miscellaneous category if none found. */
    if (!result.data.category) {
      result.data.category = 'Misc'
    }

    /** Add heading links to data. */
    result.data.headings = getHeadingsFromMarkdown(contents)

    const { code, examples } = await transformReadme(path)

    return {
      data: result.data,
      code,
      examples,
    }
  } catch (error) {
    throw Error(`Error parsing MDX at "${path}": ${error}`)
  }
}

let mdx: typeof import('@mdx-js/esbuild').default | null = null
let remarkFrontmatter: typeof import('remark-frontmatter').default | null = null
let highlighter: AsyncReturnType<typeof getHighlighter> | null = null

async function transformReadme(path) {
  if (mdx === null) {
    mdx = (await import('@mdx-js/esbuild')).default
  }
  if (remarkFrontmatter === null) {
    remarkFrontmatter = (await import('remark-frontmatter')).default
  }
  if (highlighter === null) {
    highlighter = await getHighlighter(config.themePath)
  }

  let data = null
  const examples = []
  const workingDirectory = dirname(path)
  const xdmOptions: Parameters<typeof mdx>[0] = {
    providerImportSource: '@mdx-js/react',
    remarkPlugins: [
      remarkFrontmatter,
      [
        remarkPlugin,
        {
          examples,
          workingDirectory,
          onData: (yaml) => {
            data = yaml
          },
        },
      ],
    ],
    rehypePlugins: [rehypeMetaPlugin, [rehypeShikiPlugin, highlighter]],
  }
  const result = await esbuild.build({
    entryPoints: [path],
    absWorkingDir: workingDirectory,
    target: 'esnext',
    format: 'esm',
    bundle: true,
    write: false,
    minify: process.env.NODE_ENV === 'production',
    plugins: [mdx(xdmOptions)],
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
