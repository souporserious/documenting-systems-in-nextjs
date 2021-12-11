import Link from 'next/link'
import { getComponents } from 'utils'

export default function Components({ components }) {
  return (
    <div>
      <h1>Components</h1>
      {components.map(({ name, slug }) => (
        <Link key={name} href={`components/${slug}`} passHref>
          <a style={{ display: 'flex', fontSize: 32, padding: 16 }}>{name}</a>
        </Link>
      ))}
    </div>
  )
}

export async function getStaticProps() {
  const components = await getComponents()
  return {
    props: {
      components,
    },
  }
}
