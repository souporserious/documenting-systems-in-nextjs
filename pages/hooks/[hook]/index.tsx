import Link from 'next/link'
import { getHooks } from 'utils'
import { getEditorLink } from 'utils/get-editor-link'
import { useComponent } from 'hooks/use-component'

function Example({
  example,
}: {
  example: { code: string; compiledCode: string }
}) {
  const Component = useComponent(example.compiledCode)
  return (
    <div>
      <Component />
      <pre>{example.code}</pre>
    </div>
  )
}

export default function Hook({ allHooks, hook }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: 32,
        padding: 32,
      }}
    >
      <div>
        <nav>
          {allHooks.map(({ name, slug }) => (
            <Link key={name} href={`/hooks/${slug}`} passHref>
              <a
                style={{
                  display: 'flex',
                  fontSize: 20,
                  padding: '4px 8px',
                  textDecoration: 'none',
                }}
              >
                {name}
              </a>
            </Link>
          ))}
        </nav>
      </div>
      <div>
        <h1>{hook.name}</h1>
        <p>{hook.description}</p>
        {hook.path && (
          <a href={getEditorLink({ path: hook.path })}>Open Source</a>
        )}
        <h2>Examples</h2>
        {hook.examples.map((example, index) => (
          <Example key={index} example={example} />
        ))}
      </div>
    </div>
  )
}

export async function getStaticPaths() {
  const hooks = await getHooks()
  return {
    paths: hooks.map((hook) => ({
      params: { hook: hook.slug },
    })),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const allHooks = await getHooks()
  const hook = allHooks.find((hook) => hook.slug === params.hook)
  return {
    props: {
      allHooks,
      hook,
    },
  }
}
