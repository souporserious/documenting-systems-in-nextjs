import * as esbuild from 'esbuild'
import { promises as fs } from 'fs'
import { resolve } from 'path'
import matter from 'gray-matter'
import { StringDecoder } from 'string_decoder'
import { compile } from 'xdm'
import xdm from 'xdm/esbuild.js'
import type { Options } from 'xdm/lib/integration/esbuild'
import { rehypeMetaPlugin } from './rehype-meta-plugin'
import { rehypeShikiPlugin } from './rehype-shiki-plugin'
import { remarkExamplePlugin } from './remark-example-plugin'
import { transformCode } from './transform-code.js'

export async function getComponentReadme(componentDirectoryPath) {
  const componentReadmePath = `${componentDirectoryPath}/README.mdx`
  try {
    const componentReadmeContents = await fs.readFile(
      componentReadmePath,
      'utf-8'
    )
    const result = matter(componentReadmeContents)
    return {
      data: result.data,
      code: await transformReadme(result.content, componentReadmePath),
    }
  } catch {
    return null
  }
}

async function transformReadme(componentReadmeContents, componentReadmePath) {
  const examples = []
  const containsImports = /import [^}]*.*(?=from).*/.test(
    componentReadmeContents
  )
  const xdmOptions: Options = {
    providerImportSource: '@mdx-js/react',
    remarkPlugins: [[remarkExamplePlugin, { examples }]],
    rehypePlugins: [
      rehypeMetaPlugin,
      [rehypeShikiPlugin, { theme: resolve(process.cwd(), 'theme/code.json') }],
    ],
  }
  if (containsImports) {
    // If there are imports we need to bundle with esbuild before transforming
    const result = await esbuild.build({
      entryPoints: [componentReadmePath],
      target: 'esnext',
      format: 'esm',
      bundle: true,
      write: false,
      plugins: [xdm(xdmOptions)],
      external: ['react', 'react-dom', '@mdx-js/react'],
    })
    const bundledReadme = new StringDecoder('utf-8').write(
      Buffer.from(result.outputFiles[0].contents)
    )
    return transformCode(bundledReadme)
  }
  // Otherwise we can simply just compile it with xdm
  const compiledReadme = await compile(componentReadmeContents, xdmOptions)
  return transformCode(compiledReadme.value)
}
