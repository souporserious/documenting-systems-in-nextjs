import * as React from 'react'
import path from 'path'
import { promises as fs } from 'fs'
import { bundleMDX } from 'mdx-bundler'
import { getMDXComponent } from 'mdx-bundler/client'
import { capitalCase } from 'case-anything'
import { VM } from 'vm2'

export default function Component({ code }) {
  const Element = React.useMemo(() => getMDXComponent(code), [code])
  return <Element />
}

export async function getServerSideProps(context) {
  const vm = new VM()
  const mdxSource = await fs.readFile(
    path.resolve(
      process.cwd(),
      `components/${capitalCase(context.query.name)}/README.mdx`
    ),
    'utf-8'
  )
  const { code } = await bundleMDX(mdxSource, {})
  return {
    props: { code },
  }
}
