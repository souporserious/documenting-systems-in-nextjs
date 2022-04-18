import * as esbuild from 'esbuild'
import matter from 'gray-matter'
import { dirname, resolve } from 'path'
import remarkFrontmatter from 'remark-frontmatter'
import { StringDecoder } from 'string_decoder'
import xdm from 'xdm/esbuild.js'
import type { Options } from 'xdm/lib/integration/esbuild'
import { getHeadingsFromMarkdown } from './get-headings-from-markdown'
import { rehypeMetaPlugin } from './rehype-meta-plugin'
import { getHighlighter, rehypeShikiPlugin } from './rehype-shiki-plugin'
import { remarkPlugin } from './remark-plugin'
import { transformCode } from './transform-code'

let highlighter = null

export async function parseMDX(path: string, contents: string) {
  try {
    const result = matter(contents)

    /** Only load the shiki highlighter once. */
    if (highlighter === null) {
      highlighter = await getHighlighter(
        resolve(process.cwd(), 'theme/code.json')
      )
    }

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

async function transformReadme(path) {
  let data = null
  const examples = []
  const workingDirectory = dirname(path)
  const xdmOptions: Options = {
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
