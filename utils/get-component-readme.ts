import { promises as fs } from 'fs'
import * as path from 'path'
import { pascalCase } from 'case-anything'
import { compile } from 'xdm'
import { transformCode } from 'utils/transform-code'
import { StringDecoder } from 'string_decoder'
import xdm from 'xdm/esbuild.js'
import * as esbuild from 'esbuild'

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
  const containsImports = /import [^}]*.*(?=from).*/.test(
    componentReadmeContents
  )
  let transformedReadme = ''

  if (containsImports) {
    // If there are imports we need to bundle with esbuild before transforming
    const result = await esbuild.build({
      entryPoints: [componentReadmePath],
      target: 'esnext',
      format: 'esm',
      bundle: true,
      write: false,
      plugins: [xdm()],
      external: ['react', 'react-dom'],
    })
    const decoder = new StringDecoder('utf-8')
    const bundledReadme = decoder.write(
      Buffer.from(result.outputFiles[0].contents)
    )
    transformedReadme = await transformCode(bundledReadme)
  } else {
    // Otherwise we can simply just compile it with xdm
    const compiledReadme = await compile(componentReadmeContents)
    transformedReadme = await transformCode(compiledReadme.value)
  }

  return transformedReadme
}
