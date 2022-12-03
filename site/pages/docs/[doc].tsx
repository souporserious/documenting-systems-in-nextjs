import * as React from 'react'
import Head from 'next/head'
import { MDXProvider } from '@mdx-js/react'
import * as components from 'components'
import { CompiledComponent, Playground } from 'components'
import { getSourceLink } from 'utils'
import { allDocs } from 'data/docs'

export default function Doc({ doc }) {
  return (
    <>
      <Head>
        <title>Docs / {doc.name}</title>
      </Head>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {doc.path && (
          <a href={getSourceLink({ path: doc.path })}>View Source</a>
        )}
        <h1>{doc.name}</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {doc.mdx && (
            <MDXProvider
              components={{
                ...Object.fromEntries(
                  Object.entries(components).filter(([name]) =>
                    /[A-Z]/.test(name.charAt(0))
                  )
                ),
                pre: (props) => {
                  if (props.children.props.playground !== undefined) {
                    const { children, codeString, compiledCodeString } =
                      props.children.props
                    return (
                      <Playground
                        code={children}
                        codeString={codeString}
                        compiledCodeString={compiledCodeString}
                      />
                    )
                  }
                  return <pre {...props} />
                },
              }}
            >
              <CompiledComponent codeString={doc.mdx?.code} />
            </MDXProvider>
          )}
        </div>
      </div>
    </>
  )
}

export async function getStaticPaths() {
  return {
    paths: allDocs.map((doc) => ({
      params: { doc: doc.slug },
    })),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const doc = allDocs.find((doc) => doc.slug === params.doc)
  return { props: { doc } }
}
