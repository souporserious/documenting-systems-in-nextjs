import * as React from 'react'
// import path from 'path'
// import { promises as fs } from 'fs'
import { getMDXComponent } from 'mdx-bundler/client'
import { capitalCase } from 'case-anything'

export default function Component({ name }) {
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0)
  const element = React.useRef(null)
  React.useEffect(() => {
    fetch(`/api/code?component=${name}`)
      .then((response) => response.text())
      .then((code) => {
        element.current = getMDXComponent(code)
        forceUpdate()
      })
  }, [])
  return element.current ? React.createElement(element.current) : null
}

export async function getServerSideProps(context) {
  //   const mdxSource = await fs.readFile(
  //     path.resolve(
  //       process.cwd(),
  //       `components/${capitalCase(context.query.name)}/README.mdx`
  //     ),
  //     'utf-8'
  //   )
  return {
    props: { name: capitalCase(context.query.name) },
  }
}
