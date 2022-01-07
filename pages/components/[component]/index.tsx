import * as React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { MDXProvider } from '@mdx-js/react'
import * as components from 'components'
import { Playground } from 'components'
import { useComponent } from 'hooks'
import { getEditorLink } from 'utils'
import { allComponents } from '.data'

export default function Component({ component }) {
  const Readme = useComponent(component.readme?.code)
  return (
    <>
      <Head>
        <title>Components / {component.name}</title>
      </Head>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <code>import {`{ ${component.name} }`} from 'components'</code>
        {component.path && (
          <a href={getEditorLink({ path: component.path })}>View Source</a>
        )}
        <h1>{component.name}</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {component.readme && (
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
              <Readme />
            </MDXProvider>
          )}
        </div>
        {component.docs.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <h2>Props</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {component.docs.map((doc) => (
                <div
                  key={doc.name}
                  style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
                >
                  <h3>{doc.name}</h3>
                  {doc.props.map((type) => (
                    <div
                      key={type.name}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      <div style={{ display: 'flex', gap: 8 }}>
                        <h4 style={{ fontWeight: 600, margin: 0 }}>
                          {type.name}
                        </h4>
                        <code>{type.type}</code>
                      </div>
                      {type.comment && (
                        <p style={{ margin: 0 }}>{type.comment[0]}</p>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
        {component.examples.length > 0 && (
          <>
            <h2>Examples</h2>
            {component.examples.map(({ name, slug }) => (
              <Link
                key={name}
                href={`${component.slug}/examples/${slug}`}
                passHref
              >
                <a style={{ display: 'flex', fontSize: 32, padding: 16 }}>
                  <iframe
                    src={`${component.slug}/examples/${slug}`}
                    style={{ pointerEvents: 'none' }}
                  />
                </a>
              </Link>
            ))}
          </>
        )}
      </div>
    </>
  )
}

export async function getStaticPaths() {
  return {
    paths: allComponents.map((component) => ({
      params: { component: component.slug },
    })),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const component = allComponents.find(
    (component) => component.slug === params.component
  )
  return { props: { component } }
}
