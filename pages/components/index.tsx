import Link from 'next/link'
import { getComponents } from 'utils'

export default function Components({ allComponents }) {
  return (
    <div>
      <h1>Components</h1>
      {allComponents.map(({ name, slug }) => (
        <Link key={name} href={`components/${slug}`} passHref>
          <a style={{ display: 'flex', fontSize: 32, padding: 16 }}>{name}</a>
        </Link>
      ))}
    </div>
  )
}

export async function getStaticProps() {
  const allComponents = await getComponents()
  return {
    props: {
      allComponents,
    },
  }
}
