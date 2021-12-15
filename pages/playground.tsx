import * as React from 'react'
import Link from 'next/link'
import { encode } from 'base64-url'
import { Editor } from 'components'

import { allComponents } from '.data/components'

const initialCodeString = `
import React from 'react'

export default function App() {
  return (
    <div>
      <h1>Hello Playground</h1>
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
      <aside style={{ padding: 24 }}>
        <nav>
          <Link href="/" passHref>
            <a style={{ display: 'flex', fontSize: 18, padding: 8 }}>👻</a>
          </Link>
          <h2>Examples</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {allComponents
              .filter((component) => component.examples.length > 0)
              .map(({ name, examples }) => (
                <li key={name}>
                  <h3>{name}</h3>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {examples.map(({ name, code }) => (
                      <li key={name}>
                        <button onClick={() => setCode(code)}>{name}</button>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
          </ul>
        </nav>
      </aside>
      <Editor value={code} onChange={(value) => setCode(value)} />
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
      style={{ width: '100%', height: '100%' }}
    />
  )
}
