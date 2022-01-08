import * as esbuild from 'esbuild'
import { promises as fs } from 'fs'
import matter from 'gray-matter'
import { dirname, resolve } from 'path'
import { StringDecoder } from 'string_decoder'
import xdm from 'xdm/esbuild.js'
import { rehypeMetaPlugin } from './rehype-meta-plugin'
import { getHighlighter, rehypeShikiPlugin } from './rehype-shiki-plugin'
import { remarkExamplePlugin } from './remark-example-plugin'
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

  if (highlighter === null) {
    highlighter = await getHighlighter(
      resolve(process.cwd(), 'theme/code.json')
    )
  }

  try {
    const examples = []
    const frontMatter = matter(readmeContents)
    const result = await esbuild.build({
      entryPoints: [readmePath],
      absWorkingDir: dirname(readmePath),
      target: 'esnext',
      format: 'esm',
      bundle: true,
      write: false,
      minify: process.env.NODE_ENV === 'production',
      plugins: [
        xdm({
          providerImportSource: '@mdx-js/react',
          remarkPlugins: [[remarkExamplePlugin, { examples }]],
          rehypePlugins: [rehypeMetaPlugin, [rehypeShikiPlugin, highlighter]],
        }),
      ],
      external: ['react', 'react-dom', '@mdx-js/react'],
    })
    const bundledReadme = new StringDecoder('utf-8').write(
      Buffer.from(result.outputFiles[0].contents)
    )
    const transformedReadme = await transformCode(bundledReadme)

    return {
      code: transformedReadme,
      data: frontMatter.data,
      examples,
    }
  } catch (error) {
    throw Error(`Error parsing README.mdx at "${readmePath}": ${error}`)
  }
}
