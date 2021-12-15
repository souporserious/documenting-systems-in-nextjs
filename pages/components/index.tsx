import Link from 'next/link'
import { allComponents } from '.data/components'

export default function Components() {
  return (
    <>
      <h1>Components</h1>
      {allComponents.map(({ name, slug }) => (
        <Link key={name} href={`components/${slug}`} passHref>
          <a style={{ display: 'flex', fontSize: 32, padding: 16 }}>{name}</a>
        </Link>
      ))}
    </>
  )
}
