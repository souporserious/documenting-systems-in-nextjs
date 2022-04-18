import * as React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { MDXProvider } from '@mdx-js/react'
import * as components from 'components'
import { CompiledComponent, Playground } from 'components'
import { getSourceLink } from 'utils'
import { allComponents } from '.data'

export default function Component({ component }) {
  return (
    <>
      <Head>
        <title>Components / {component.name}</title>
      </Head>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {component.path && (
          <a href={getSourceLink({ path: component.path })}>View Source</a>
        )}
        <code>import {`{ ${component.name} }`} from 'components'</code>
        <h1>{component.name}</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {component.mdx && (
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
              <CompiledComponent codeString={component.mdx?.code} />
            </MDXProvider>
          )}
        </div>
        {component.types.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <h2>Props</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {component.types.map((doc) => (
                <div
                  key={doc.name}
                  style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
                >
                  <h3>{doc.name}</h3>
                  {doc.path && (
                    <a href={getSourceLink({ path: doc.path })}>View Source</a>
                  )}
                  {doc.props.map((type) => (
                    <div
                      key={type.name}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: 8,
                        }}
                      >
                        <h4 style={{ fontWeight: 600, margin: 0 }}>
                          {type.name} {type.required && '*'}
                        </h4>
                        <code>
                          {type.type}{' '}
                          {type.defaultValue && `= ${type.defaultValue}`}
                        </code>
                      </div>
                      {type.description && (
                        <p style={{ margin: 0 }}>{type.description}</p>
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
