import Link from 'next/link'
import { useComponent } from 'hooks'
import { getComponents, getExamples, getComponentReadme } from 'utils'
import { getEditorLink } from 'utils/get-editor-link'

export default function Component({ component, readme, examples }) {
  const Component = useComponent(readme)
  return (
    <div>
      {component.path && (
        <a href={getEditorLink({ path: component.path })}>Open Source</a>
      )}
      <Component />
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
  const transformedReadme = await getComponentReadme(params.component)
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
      readme: transformedReadme,
      examples,
    },
  }
}
