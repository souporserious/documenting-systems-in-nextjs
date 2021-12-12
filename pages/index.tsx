import Link from 'next/link'
import { getComponents, getHooks } from 'utils'

export default function Components({ allComponents, allHooks }) {
  return (
    <div>
      <h1>Design System</h1>
      <h2>Components</h2>
      {allComponents.map(({ name, slug }) => (
        <Link key={name} href={`components/${slug}`} passHref>
          <a style={{ display: 'flex', fontSize: 32, padding: 16 }}>{name}</a>
        </Link>
      ))}
      <h2>Hooks</h2>
      {allHooks.map(({ name, slug }) => (
        <Link key={name} href={`hooks/${slug}`} passHref>
          <a style={{ display: 'flex', fontSize: 32, padding: 16 }}>{name}</a>
        </Link>
      ))}
    </div>
  )
}

export async function getStaticProps() {
  const allComponents = await getComponents()
  const allHooks = await getHooks()
  return {
    props: {
      allComponents,
      allHooks,
    },
  }
}
