import Link from 'next/link'
import { useComponent } from 'hooks'
import {
  getComponents,
  getExamples,
  getComponentReadme,
  getComponentDocs,
} from 'utils'
import { getEditorLink } from 'utils/get-editor-link'

export default function Component({ component, readme, docs, examples }) {
  const Component = useComponent(readme)
  return (
    <div>
      <code>import {`{ ${component.name} }`} from '@components'</code>
      {component.path && (
        <a href={getEditorLink({ path: component.path })}>Open Source</a>
      )}
      <Component />
      <h2>Props</h2>
      {Object.entries(docs).map(([name, types]) => (
        <div key={name}>
          <h3 style={{ fontWeight: 600 }}>{name}</h3>
          {types.map((type) => (
            <div key={type.name}>
              <div style={{ display: 'flex', gap: 8 }}>
                <h4 style={{ fontWeight: 600, margin: 0 }}>{type.name}</h4>
                <code>{type.type}</code>
              </div>
              <p style={{ margin: 0 }}>{type.description}</p>
            </div>
          ))}
        </div>
      ))}
      <h2>Examples</h2>
      {examples.map(({ name, slug }) => (
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
  const readme = await getComponentReadme(params.component)
  const docs = await getComponentDocs(params.component)
  const allComponents = await getComponents()
  const allExamples = await getExamples()
  const component = allComponents.find(
    (component) => component.slug === params.component
  )
  const examples = allExamples.filter(
    (example) => example.componentSlug === params.component
  )
  return {
    props: {
      component,
      readme,
      docs,
      examples,
    },
  }
}
