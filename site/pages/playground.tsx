import * as React from 'react'
import Link from 'next/link'
import { encode } from 'base64-url'
import { Editor } from 'components'

import { allComponents } from 'data/components'

const initialCodeString = `
import React from 'react'

function Welcome() {
  return (
    <h1>
      <span>Hello</span> <span>Playground</span>
    </h1>
  )
}

export default function App() {
  return (
    <div style={{ textAlign: 'center' }}>
      <Welcome />
      <h2>
        Start editing to see some
        magic happen!
      </h2>
    </div>
  )
}
`.trim()

export default function Playground() {
  const [code, setCode] = React.useState(initialCodeString)
  return (
    <div
      id="index"
      style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr' }}
    >
      <aside style={{ height: '100vh', padding: 24 }}>
        <nav
          style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        >
          <Link href="/" style={{ display: 'flex', fontSize: 18, padding: 8 }}>
            👻
          </Link>
          <h2>Examples</h2>
          <ul
            style={{
              display: 'flex',
              flexDirection: 'column',
              listStyle: 'none',
              padding: 0,
              gap: 16,
              flex: 1,
              overflow: 'auto',
            }}
          >
            {allComponents
              .filter((component) => component.examples.length > 0)
              .map(({ name, examples }) => (
                <li
                  key={name}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <h3 style={{ fontSize: 14, margin: 0 }}>{name}</h3>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {examples.map(({ name, code, slug, parentSlug }) => (
                      <li
                        key={name}
                        style={{
                          width: 150,
                          height: 100,
                          overflow: 'hidden',
                        }}
                      >
                        <button
                          onClick={() => setCode(code)}
                          style={{ appearance: 'none', padding: 0, border: 0 }}
                        >
                          <iframe
                            title={name}
                            src={`components/${parentSlug}/examples/${slug}`}
                            style={{
                              pointerEvents: 'none',
                              width: 600,
                              height: 400,
                              transform: 'scale(0.25)',
                              transformOrigin: 'top left',
                              border: '1px solid var(--color-separator)',
                              backgroundColor: 'var(--color-background)',
                            }}
                          />
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
          </ul>
        </nav>
      </aside>
      <Editor
        height="100vh"
        value={code}
        onChange={(value) => setCode(value)}
        highlightPosition
      />
      <Preview code={code} />
    </div>
  )
}

function Preview({ code }) {
  const frameRef = React.useRef<HTMLIFrameElement>(null)
  const frameSource = React.useRef(null)

  /**
   * Only set the source of the iframe on the initial mount since we use message
   * passing below for subsequent updates.
   */
  if (frameSource.current === null) {
    frameSource.current = `/preview?code=${encode(code)}`
  }

  React.useEffect(() => {
    frameRef.current.contentWindow.postMessage({
      code: encode(code),
      type: 'preview',
    })
  }, [code])

  return (
    <iframe
      ref={frameRef}
      src={frameSource.current}
      style={{ width: '100%', height: '100%', border: 'none' }}
    />
  )
}
