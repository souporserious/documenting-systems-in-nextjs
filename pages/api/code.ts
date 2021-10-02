import { getMDXComponent } from 'mdx-bundler/client'
import { bundleMDX } from 'mdx-bundler'
import { NodeVM, VMScript } from 'vm2'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const mdxSource = `
# Hello ${request.query.component}

This is coming from the MDX API.
    `
  const { code } = await bundleMDX(mdxSource)
  //   try {
  //     const vm = new NodeVM()
  //     const script = new VMScript(code)
  //     vm.run(script)
  //   } catch (err) {
  //     response.status(500).send('Failed to execute MDX source: ' + err)
  //   }
  response.status(200).send(code)
}
