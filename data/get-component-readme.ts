import { promises as fs } from 'fs'
import { StringDecoder } from 'string_decoder'
import { compile } from 'xdm'
import { Options } from 'xdm/lib/integration/esbuild'
import xdm from 'xdm/esbuild.js'
import * as esbuild from 'esbuild'
import shiki from 'rehype-shiki'
import { remarkExamplePlugin } from './remark-example-plugin'
import { transformCode } from './transform-code.js'

export async function getComponentReadme(componentDirectoryPath) {
  const componentReadmePath = `${componentDirectoryPath}/README.mdx`
  try {
    const componentReadmeContents = await fs.readFile(
      componentReadmePath,
      'utf-8'
    )
    return transformReadme(componentReadmeContents, componentReadmePath)
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
    remarkPlugins: [[remarkExamplePlugin, { examples }]],
    rehypePlugins: [[shiki, { theme: 'theme/code.json' }]],
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
      external: ['react', 'react-dom'],
    })
    const decoder = new StringDecoder('utf-8')
    const bundledReadme = decoder.write(
      Buffer.from(result.outputFiles[0].contents)
    )
    return transformCode(bundledReadme)
  } else {
    // Otherwise we can simply just compile it with xdm
    const compiledReadme = await compile(componentReadmeContents, xdmOptions)
    return transformCode(compiledReadme.value)
  }
}
