import Link from 'next/link'
import { useComponent } from 'hooks'
import { getComponents, getExamples, getComponentReadme } from 'utils'

export default function Component({ component, readme, examples }) {
  const Component = useComponent(readme)
  return (
    <div>
      <Component />
      <h2>Examples</h2>
      {examples.map(({ name, slug }) => (
        <Link key={name} href={`${component}/examples/${slug}`} passHref>
          <a style={{ display: 'flex', fontSize: 32, padding: 16 }}>
            <iframe
              src={`${component}/examples/${slug}`}
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
  const allExamples = await getExamples()
  const examples = allExamples.filter(
    (example) => example.component === params.component
  )
  return {
    props: {
      component: params.component,
      readme: transformedReadme,
      examples,
    },
  }
}
