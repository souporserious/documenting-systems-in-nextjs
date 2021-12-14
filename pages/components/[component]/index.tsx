import Link from 'next/link'
import { useComponent } from 'hooks'
import { getComponents } from 'utils'
import { getEditorLink } from 'utils/get-editor-link'

export default function Component({ allComponents, component, docs }) {
  const Component = useComponent(component.readme)
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: 32,
        padding: 32,
      }}
    >
      <nav>
        {allComponents.map(({ name, slug }) => (
          <Link key={name} href={`/components/${slug}`} passHref>
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
      <div>
        <code>import {`{ ${component.name} }`} from '@components'</code>
        {component.path && (
          <a href={getEditorLink({ path: component.path })}>View Source</a>
        )}
        <Component />
        <h2>Props</h2>
        {component.props.map((type) => (
          <div key={type.name}>
            <div style={{ display: 'flex', gap: 8 }}>
              <h4 style={{ fontWeight: 600, margin: 0 }}>{type.name}</h4>
              <code>{type.type}</code>
            </div>
            <p style={{ margin: 0 }}>{type.description}</p>
          </div>
        ))}
        <h2>Examples</h2>
        {component.examples.map(({ name, slug }) => (
          <Link key={name} href={`${component.slug}/examples/${slug}`} passHref>
            <a style={{ display: 'flex', fontSize: 32, padding: 16 }}>
              <iframe
                src={`${component.slug}/examples/${slug}`}
                style={{ pointerEvents: 'none' }}
              />
            </a>
          </Link>
        ))}
      </div>
    </div>
  )
}

export async function getStaticPaths() {
  const components = await getComponents()
  return {
    paths: components.map((component) => ({
      params: { component: component.slug },
    })),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const allComponents = await getComponents()
  const component = allComponents.find(
    (component) => component.slug === params.component
  )
  return {
    props: {
      allComponents,
      component,
    },
  }
}
